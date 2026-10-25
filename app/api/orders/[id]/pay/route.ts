import { sql } from '@/lib/db'
import { UUID } from '@/lib/cart'

const METHODS = ['promptpay', 'card', 'cod'] as const
type Method = (typeof METHODS)[number]

// จ่ายเงินจำลอง: บันทึกวิธีชำระ แล้วเปลี่ยน order จาก pending เป็น paid (ไม่ต่อ payment gateway จริง)
// COD = ยังไม่ได้รับเงิน จึงเก็บวิธีชำระไว้แต่สถานะยังเป็น pending
// ponytail: ใครรู้ order id ก็จ่ายได้ (uuid เดายาก) ถ้ามีระบบ user ค่อยเช็กเจ้าของ order
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!UUID.test(id)) return Response.json({ error: 'Order not found' }, { status: 404 })

  const body: unknown = await request.json().catch(() => null)
  const method = typeof body === 'object' && body !== null && 'method' in body ? body.method : null
  if (!METHODS.includes(method as Method)) {
    return Response.json({ error: 'method must be promptpay, card or cod' }, { status: 400 })
  }
  const status = method === 'cod' ? 'pending' : 'paid'

  const [paid] = (await sql`
    update orders set status = ${status}, payment_method = ${method as Method}
    where id = ${id} and status = 'pending'
    returning id, status, total, payment_method
  `) as { id: string; status: string; total: number; payment_method: Method }[]
  if (paid) return Response.json(paid)

  const [order] = (await sql`select status from orders where id = ${id}`) as { status: string }[]
  if (!order) return Response.json({ error: 'Order not found' }, { status: 404 })
  return Response.json({ error: `Order is already ${order.status}` }, { status: 409 })
}
