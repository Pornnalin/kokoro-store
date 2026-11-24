// Integration test ของ flow ตะกร้า → checkout → จ่ายเงิน ยิงผ่าน HTTP ไปยังเซิร์ฟเวอร์ที่รันอยู่
// test นี้สร้างออเดอร์และตัดสต็อกจริง ห้ามชี้ไปที่ production ให้ใช้ Neon branch แยกสำหรับทดสอบ
// รัน: TEST_BASE_URL=http://localhost:3000 npm test (อ่าน DATABASE_URL จาก .env.local ต้องเป็นฐานข้อมูลเดียวกับเซิร์ฟเวอร์)
// checkout มี rate limit 10 ครั้ง / 10 นาที ต่อ IP ไฟล์นี้ใช้ 5 ครั้ง จึงรันติดกันได้ไม่เกิน 2 รอบ
import { test, before } from 'node:test'
import assert from 'node:assert/strict'
import { neon } from '@neondatabase/serverless'

const BASE = process.env.TEST_BASE_URL
const DB_URL = process.env.DATABASE_URL
if (!BASE) throw new Error('ตั้ง TEST_BASE_URL ก่อน (เช่น http://localhost:3000 ที่ต่อกับฐานข้อมูลทดสอบ)')
if (BASE.includes('kokoro-store.vercel.app')) throw new Error('ห้ามรัน test กับ production')
if (!DB_URL) throw new Error('ต้องมี DATABASE_URL (ใช้ปรับสต็อกในเคสซื้อตัดหน้า)')
const db = neon(DB_URL)
const MAX_PER_ITEM = 5 // ต้องตรงกับ lib/types.ts

type Product = { id: number; slug: string; price: number; stock: number }
type Order = { orderId: string; status: string; total: number }

// แต่ละ session = ผู้ใช้หนึ่งคน (เก็บ cookie cart_id ของตัวเอง)
function session() {
  let cookie = ''
  return async (path: string, body?: unknown) => {
    const res = await fetch(BASE + path, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const set = res.headers.get('set-cookie')
    if (set) cookie = set.split(';')[0]
    return { status: res.status, data: (await res.json()) as unknown }
  }
}

async function stockOf(slug: string) {
  const { data } = await session()(`/api/products/${slug}`)
  return (data as Product).stock
}

let product: Product

before(async () => {
  const { data } = await session()('/api/products')
  const found = (data as Product[]).find((p) => p.stock >= 3)
  assert.ok(found, 'ต้องมีสินค้าที่สต็อก >= 3 ในฐานข้อมูลทดสอบ')
  product = found
})

test('checkout ปฏิเสธข้อมูลไม่ครบ', async () => {
  const { status } = await session()('/api/checkout', { customerName: '', address: 'x' })
  assert.equal(status, 400)
})

test('checkout ปฏิเสธตะกร้าว่าง', async () => {
  const { status } = await session()('/api/checkout', { customerName: 'ทดสอบ', address: 'ที่อยู่ทดสอบ' })
  assert.equal(status, 400)
})

test('สั่งซื้อสำเร็จ: ตัดสต็อก ล้างตะกร้า แล้วจ่ายเงินได้ครั้งเดียว', async () => {
  const api = session()
  const stockBefore = await stockOf(product.slug)

  assert.equal((await api('/api/cart', { productId: product.id, quantity: 2 })).status, 200)
  const res = await api('/api/checkout', { customerName: 'ทดสอบ', address: 'ที่อยู่ทดสอบ' })
  assert.equal(res.status, 201)
  const order = res.data as Order
  assert.equal(order.status, 'pending')
  assert.equal(order.total, product.price * 2)

  assert.equal(await stockOf(product.slug), stockBefore - 2)
  assert.deepEqual(((await api('/api/cart')).data as { items: unknown[] }).items, [])

  assert.equal((await api(`/api/orders/${order.orderId}/pay`, { method: 'bitcoin' })).status, 400)
  const paid = await api(`/api/orders/${order.orderId}/pay`, { method: 'promptpay' })
  assert.equal(paid.status, 200)
  assert.equal((paid.data as Order).status, 'paid')
  assert.equal((await api(`/api/orders/${order.orderId}/pay`, { method: 'promptpay' })).status, 409)
})

test(`ใส่ตะกร้าเกิน ${MAX_PER_ITEM} ชิ้นต่อรายการไม่ได้`, async () => {
  const api = session()
  assert.equal((await api('/api/cart', { productId: product.id, quantity: MAX_PER_ITEM + 1 })).status, 409)
  assert.equal((await api('/api/cart', { productId: product.id, quantity: MAX_PER_ITEM })).status, 200)
  assert.equal((await api('/api/cart', { productId: product.id, quantity: 1 })).status, 409)
})

test('สต็อกไม่พอตอน checkout (มีคนซื้อตัดหน้า) ได้ 409 และไม่ตัดสต็อก', async () => {
  const a = session()
  const b = session()
  // เพดานต่อรายการทำให้กวาดสต็อกผ่าน API ไม่ได้ จึงลดสต็อกตรง ๆ ให้เหลือ 2 แล้วคืนตอนจบ
  const [{ stock: original }] = (await db`select stock from products where id = ${product.id}`) as { stock: number }[]
  await db`update products set stock = 2 where id = ${product.id}`
  try {
    // a ใส่ตะกร้าเต็มสต็อก แล้ว b ซื้อไป 1 ชิ้นก่อน
    assert.equal((await a('/api/cart', { productId: product.id, quantity: 2 })).status, 200)
    assert.equal((await b('/api/cart', { productId: product.id, quantity: 1 })).status, 200)
    assert.equal((await b('/api/checkout', { customerName: 'B', address: 'ที่อยู่ B' })).status, 201)

    const res = await a('/api/checkout', { customerName: 'A', address: 'ที่อยู่ A' })
    assert.equal(res.status, 409)
    assert.equal(await stockOf(product.slug), 1)
  } finally {
    await db`update products set stock = stock + ${original - 2} where id = ${product.id}`
  }
})

test('cron cleanup ปฏิเสธคำขอที่ไม่มี secret', async () => {
  assert.equal((await session()('/api/cron/cleanup')).status, 401)
})
