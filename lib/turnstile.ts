// ยืนยัน token ของ Cloudflare Turnstile ฝั่งเซิร์ฟเวอร์ คืน Response ถ้าไม่ผ่าน คืน null ถ้าผ่าน (เรียกแบบเดียวกับ rateLimit)
// นอก production ข้ามการยืนยัน (หน้าเว็บใช้ test site key อยู่แล้ว) test และ dev จึงไม่ต้องมี secret
export async function verifyTurnstile(token: unknown, request: Request) {
  if (process.env.NODE_ENV !== 'production') return null

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return Response.json({ error: 'Bot check is not configured' }, { status: 503 })
  if (typeof token !== 'string' || !token || token.length > 2048) {
    return Response.json({ error: 'Bot check failed' }, { status: 403 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) }),
  }).catch(() => null)
  const result = res?.ok ? ((await res.json()) as { success?: boolean }) : null
  return result?.success === true ? null : Response.json({ error: 'Bot check failed' }, { status: 403 })
}
