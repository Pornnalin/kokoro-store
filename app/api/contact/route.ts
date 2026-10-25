import { sql } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

function text(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t && t.length <= max ? t : null
}

// รับข้อความจากฟอร์มหน้าติดต่อ แล้วเก็บลงตาราง contact_messages
export async function POST(request: Request) {
  const limited = await rateLimit(request, 'contact', 5, 600)
  if (limited) return limited

  const body: unknown = await request.json().catch(() => null)
  const f = (typeof body === 'object' && body !== null ? body : {}) as Record<string, unknown>
  const name = text(f.name, 200)
  const phone = text(f.phone, 30)
  const email = text(f.email, 320)
  const subject = text(f.subject, 200)
  const message = text(f.message, 5000)
  if (!name || !phone || !/^[0-9+\-\s]{8,30}$/.test(phone) || f.consent !== true || !email || !subject || !message || !/^\S+@\S+\.\S+$/.test(email)) {
    return Response.json({ error: 'name, phone, email, subject, message and consent are required' }, { status: 400 })
  }

  await sql`insert into contact_messages (name, phone, email, subject, message, consent) values (${name}, ${phone}, ${email}, ${subject}, ${message}, true)`
  return Response.json({ ok: true }, { status: 201 })
}
