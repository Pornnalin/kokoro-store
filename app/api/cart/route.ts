import { sql } from '@/lib/db'
import { findCartId, getOrCreateCartId } from '@/lib/cart'
import type { CartItem } from '@/lib/types'

const MAX_INT = 2147483647 // ขอบบนของ integer ใน Postgres

function isPositiveInt(v: unknown): v is number {
  return Number.isInteger(v) && (v as number) >= 1 && (v as number) <= MAX_INT
}

async function readCart(cartId: string | null) {
  if (!cartId) return { items: [], total: 0 }
  const items = (await sql`
    select p.id as product_id, p.slug, p.name, p.price, p.image_url, p.stock, ci.quantity
    from cart_items ci
    join products p on p.id = ci.product_id
    where ci.cart_id = ${cartId}
    order by ci.id
  `) as CartItem[]
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  return { items, total }
}

async function readBody(request: Request, needQuantity: boolean) {
  const body: unknown = await request.json().catch(() => null)
  if (typeof body !== 'object' || body === null) return null
  const { productId, quantity } = body as Record<string, unknown>
  if (!isPositiveInt(productId)) return null
  if (needQuantity && !isPositiveInt(quantity)) return null
  return { productId, quantity: isPositiveInt(quantity) ? quantity : 0 }
}

async function getStock(productId: number) {
  const [product] = (await sql`select stock from products where id = ${productId}`) as { stock: number }[]
  return product?.stock ?? null
}

const badRequest = (error: string) => Response.json({ error }, { status: 400 })

export async function GET() {
  return Response.json(await readCart(await findCartId()))
}

// เพิ่มสินค้า (บวกจำนวนเข้าของเดิม)
export async function POST(request: Request) {
  const body = await readBody(request, true)
  if (!body) return badRequest('productId and quantity must be positive integers')

  const stock = await getStock(body.productId)
  if (stock === null) return Response.json({ error: 'Product not found' }, { status: 404 })

  const cartId = await getOrCreateCartId()
  const [existing] = (await sql`
    select quantity from cart_items where cart_id = ${cartId} and product_id = ${body.productId}
  `) as { quantity: number }[]
  if ((existing?.quantity ?? 0) + body.quantity > stock) {
    return Response.json({ error: 'Not enough stock' }, { status: 409 })
  }

  await sql`
    insert into cart_items (cart_id, product_id, quantity)
    values (${cartId}, ${body.productId}, ${body.quantity})
    on conflict (cart_id, product_id)
    do update set quantity = cart_items.quantity + excluded.quantity
  `
  return Response.json(await readCart(cartId))
}

// ตั้งจำนวนใหม่ (ทับของเดิม)
export async function PATCH(request: Request) {
  const body = await readBody(request, true)
  if (!body) return badRequest('productId and quantity must be positive integers')

  const cartId = await findCartId()
  if (!cartId) return Response.json({ error: 'Item not in cart' }, { status: 404 })

  const stock = await getStock(body.productId)
  if (stock === null) return Response.json({ error: 'Product not found' }, { status: 404 })
  if (body.quantity > stock) return Response.json({ error: 'Not enough stock' }, { status: 409 })

  const updated = await sql`
    update cart_items set quantity = ${body.quantity}
    where cart_id = ${cartId} and product_id = ${body.productId}
    returning id
  `
  if (updated.length === 0) return Response.json({ error: 'Item not in cart' }, { status: 404 })
  return Response.json(await readCart(cartId))
}

// ลบสินค้าออกจากตะกร้า
export async function DELETE(request: Request) {
  const body = await readBody(request, false)
  if (!body) return badRequest('productId must be a positive integer')

  const cartId = await findCartId()
  if (cartId) {
    await sql`delete from cart_items where cart_id = ${cartId} and product_id = ${body.productId}`
  }
  return Response.json(await readCart(cartId))
}
