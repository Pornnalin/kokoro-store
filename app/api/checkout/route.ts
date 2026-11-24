import { Client } from '@neondatabase/serverless'
import { randomUUID } from 'node:crypto'
import { findCartId } from '@/lib/cart'
import { rateLimit } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/turnstile'

type Line = { product_id: number; name: string; price: number; stock: number; quantity: number }

function text(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t && t.length <= max ? t : null
}

// สร้าง order (pending) จากตะกร้า ตัดสต็อก แล้วล้างตะกร้า ทั้งหมดใน transaction เดียว
// ราคาทั้งหมดเป็นสตางค์
export async function POST(request: Request) {
  const limited = await rateLimit(request, 'checkout', 10, 600)
  if (limited) return limited

  const body: unknown = await request.json().catch(() => null)
  const fields = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>
  const { customerName, address } = fields
  const name = text(customerName, 200)
  const addr = text(address, 1000)
  if (!name || !addr) {
    return Response.json({ error: 'customerName (<= 200) and address (<= 1000) are required' }, { status: 400 })
  }

  const blocked = await verifyTurnstile(fields['cf-turnstile-response'], request)
  if (blocked) return blocked

  const cartId = await findCartId()
  if (!cartId) return Response.json({ error: 'Cart is empty' }, { status: 400 })

  // ต้องใช้ Client (WebSocket) เพราะ transaction ต้องเช็กสต็อกก่อนตัด ซึ่ง sql`` แบบ HTTP ทำไม่ได้
  // Client ต้องเปิด-ปิดภายใน request เดียว (ข้อกำหนดของ Neon บน serverless)
  const client = new Client(process.env.DATABASE_URL)
  await client.connect()
  try {
    await client.query('begin')

    // ออเดอร์ pending ที่ยังไม่เลือกวิธีจ่ายเกิน 30 นาที = ยกเลิกแล้วคืนสต็อก (COD มี payment_method แล้ว จึงไม่โดน)
    // update ... returning ทำให้ request ที่ชนกันไม่คืนสต็อกซ้ำ
    await client.query(
      `with expired as (
         update orders set status = 'cancelled'
         where status = 'pending' and payment_method is null and created_at < now() - interval '30 minutes'
         returning id
       ), back as (
         select oi.product_id, sum(oi.quantity)::int as qty
         from order_items oi join expired e on e.id = oi.order_id
         group by oi.product_id
       )
       update products p set stock = p.stock + back.qty from back where p.id = back.product_id`
    )

    // lock แถวสินค้า (เรียงตาม id กัน deadlock) ระหว่าง checkout พร้อมกันจะได้ไม่ตัดสต็อกเกิน
    const { rows: lines } = await client.query<Line>(
      `select p.id as product_id, p.name, p.price, p.stock, ci.quantity
       from cart_items ci
       join products p on p.id = ci.product_id
       where ci.cart_id = $1
       order by p.id
       for update of p`,
      [cartId]
    )

    if (lines.length === 0) {
      await client.query('rollback')
      return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const short = lines.filter((l) => l.quantity > l.stock)
    if (short.length > 0) {
      await client.query('rollback')
      return Response.json(
        { error: 'Not enough stock', items: short.map((l) => ({ productId: l.product_id, name: l.name, stock: l.stock })) },
        { status: 409 }
      )
    }

    const orderId = randomUUID()
    const total = lines.reduce((sum, l) => sum + l.price * l.quantity, 0)
    await client.query(
      `insert into orders (id, customer_name, address, total, status, created_at)
       values ($1, $2, $3, $4, 'pending', now())`,
      [orderId, name, addr, total]
    )

    for (const l of lines) {
      await client.query(
        `insert into order_items (order_id, product_id, name, price, quantity) values ($1, $2, $3, $4, $5)`,
        [orderId, l.product_id, l.name, l.price, l.quantity]
      )
      await client.query('update products set stock = stock - $1 where id = $2', [l.quantity, l.product_id])
    }

    await client.query('delete from cart_items where cart_id = $1', [cartId])
    await client.query('commit')

    return Response.json({ orderId, status: 'pending', total }, { status: 201 })
  } catch (err) {
    await client.query('rollback').catch(() => {})
    throw err
  } finally {
    await client.end()
  }
}
