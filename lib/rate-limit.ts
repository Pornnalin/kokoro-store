import { sql } from '@/lib/db'

// จำกัดจำนวนคำขอต่อ IP แบบ fixed window เก็บตัวนับใน Neon (ฟรี ไม่ต้องมีบริการเพิ่ม)
// คืน Response 429 ถ้าเกิน ไม่เกินคืน null ให้เรียกที่ต้นของ handler
// ponytail: fixed window (ช่วงรอยต่อยิงได้สูงสุด 2 เท่า) ถ้าต้องเข้มกว่านี้ค่อยย้ายไป Upstash/Vercel Firewall
export async function rateLimit(request: Request, name: string, max: number, windowSec: number) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const [row] = (await sql`
    insert into rate_limits (key, window_start)
    values (${`${name}:${ip}`}, to_timestamp(floor(extract(epoch from now()) / ${windowSec}) * ${windowSec}))
    on conflict (key, window_start) do update set count = rate_limits.count + 1
    returning count
  `) as { count: number }[]

  // เก็บกวาดแถวเก่าเป็นบางครั้ง ไม่ต้องมีตัวตั้งเวลา
  if (Math.random() < 0.01) await sql`delete from rate_limits where window_start < now() - interval '1 day'`

  if (row.count <= max) return null
  return Response.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(windowSec) } })
}
