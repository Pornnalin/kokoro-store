import { cookies } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { sql } from '@/lib/db'

const COOKIE = 'cart_id'
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// อ่าน cart id จาก cookie คืน null ถ้าไม่มี/ไม่ถูกต้อง/ไม่มีใน DB (ไม่สร้างตะกร้าใหม่)
export async function findCartId(): Promise<string | null> {
  const current = (await cookies()).get(COOKIE)?.value
  if (!current || !UUID.test(current)) return null

  const [row] = (await sql`select id from carts where id = ${current}`) as { id: string }[]
  return row ? current : null
}

// ใช้ตอนเพิ่มสินค้าเท่านั้น จะได้ไม่สร้างตะกร้าเปล่าจาก GET/bot
// ต้องเรียกใน Route Handler เท่านั้น (ต้อง set cookie)
// ponytail: ไม่มีงานลบตะกร้าเก่า เพิ่ม cron ลบ carts ที่ created_at เก่ากว่า 30 วัน ถ้าตารางโต
export async function getOrCreateCartId(): Promise<string> {
  const existing = await findCartId()
  if (existing) return existing

  const id = randomUUID()
  await sql`insert into carts (id) values (${id})`
  ;(await cookies()).set(COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return id
}
