import { sql } from '@/lib/db'

// Vercel Cron เรียกวันละครั้ง (ดู vercel.json) ให้ demo ฟื้นตัวเองถ้าโดนบอทหรือคนทดสอบกวาดสต็อก
// Vercel ส่ง Authorization: Bearer <CRON_SECRET> มาให้เอง ถ้าไม่ได้ตั้ง CRON_SECRET จะปฏิเสธทุกคำขอ
const MIN_STOCK = 50

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // transaction เดียว now() จึงเป็นเวลาเดียวกันทุกคำสั่ง ไม่ลบ order_items ของออเดอร์ที่เพิ่งเกิด
  await sql.transaction([
    sql`delete from order_items where order_id in (select id from orders where created_at < now() - interval '1 day')`,
    sql`delete from orders where created_at < now() - interval '1 day'`,
    sql`delete from carts where created_at < now() - interval '7 days'`, // cart_items ลบตามด้วย cascade
    sql`delete from rate_limits where window_start < now() - interval '1 day'`,
    sql`update products set stock = ${MIN_STOCK} where stock < ${MIN_STOCK}`,
  ])

  return Response.json({ ok: true })
}
