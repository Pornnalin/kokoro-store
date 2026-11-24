'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

type TurnstileApi = {
  render: (el: HTMLElement, options: { sitekey: string }) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

// site key เป็นค่าสาธารณะ นอก production ใช้ test key ของ Cloudflare ที่ผ่านเสมอ (localhost ไม่ต้องตั้งค่าใน Cloudflare)
const SITE_KEY = process.env.NODE_ENV === 'production' ? '0x4AAAAAAGQTqVg4Z5BAVtCw' : '1x00000000000000000000AA'

// วางไว้ใน <form> แล้ว widget จะเพิ่ม hidden input ชื่อ cf-turnstile-response ให้เอง
// token ใช้ได้ครั้งเดียว ถ้าส่งไม่สำเร็จให้เปลี่ยน key ของ component เพื่อขอ token ใหม่
export function Turnstile() {
  const ref = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!ready || !ref.current || !window.turnstile) return
    const id = window.turnstile.render(ref.current, { sitekey: SITE_KEY })
    return () => window.turnstile?.remove(id)
  }, [ready])

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} />
      <div ref={ref} className="min-h-[65px]" />
    </>
  )
}
