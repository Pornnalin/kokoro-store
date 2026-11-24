'use client'

import Script from 'next/script'
import { useSyncExternalStore } from 'react'
import { btn } from './ui'

// โหลด GA4 หลังผู้ใช้กดยอมรับเท่านั้น (PDPA) ส่วน Vercel Analytics ไม่ใช้คุกกี้ จึงไม่ต้องขอ
const GA_ID = 'G-PW8PS8G5W1'
const KEY = 'cookie-consent'

type Choice = 'granted' | 'denied' | null

// เก็บไว้ในหน่วยความจำด้วย เผื่อ localStorage ใช้ไม่ได้ (โหมดส่วนตัว) แบนเนอร์จะได้ไม่เด้งซ้ำในหน้านั้น
let memory: Choice | undefined
let gaLoaded = false // เคยยอมรับในหน้านี้แล้ว = สคริปต์ GA โหลดไปแล้ว
const listeners = new Set<() => void>()

function read(): Choice {
  let v: Choice = null
  if (memory !== undefined) v = memory
  else {
    try {
      const s = localStorage.getItem(KEY)
      if (s === 'granted' || s === 'denied') v = s
    } catch {}
  }
  if (v === 'granted') gaLoaded = true
  return v
}

function save(choice: Choice) {
  const hadGa = gaLoaded
  memory = choice
  try {
    if (choice) localStorage.setItem(KEY, choice)
    else localStorage.removeItem(KEY)
  } catch {}
  // ถอนความยินยอมหลัง GA โหลดไปแล้ว ต้องรีโหลดหน้าให้สคริปต์หายไป
  if (hadGa && choice === 'denied') return window.location.reload()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function useConsent() {
  // ฝั่งเซิร์ฟเวอร์ยังไม่รู้คำตอบ คืน 'pending' เพื่อไม่ render อะไรจน hydrate เสร็จ
  return useSyncExternalStore<Choice | 'pending'>(subscribe, read, () => 'pending')
}

export function CookieConsent() {
  const choice = useConsent()

  if (choice === 'granted') {
    return (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </>
    )
  }
  if (choice !== null) return null

  return (
    <section
      aria-label="การใช้คุกกี้"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl border border-ink-soft/15 bg-white p-5 shadow-lg sm:flex sm:items-center sm:gap-6"
    >
      <p className="text-sm leading-6 text-muted">
        เราใช้คุกกี้ของ Google Analytics เพื่อวัดจำนวนผู้เข้าชมและปรับปรุงเว็บไซต์ จะเริ่มเก็บข้อมูลเมื่อคุณกดยอมรับเท่านั้น
        เปลี่ยนใจได้ภายหลังที่ &quot;ตั้งค่าคุกกี้&quot; ด้านล่างของหน้า
      </p>
      <div className="mt-4 flex shrink-0 gap-3 sm:mt-0">
        <button type="button" onClick={() => save('denied')} className={`${btn.secondary} flex-1 sm:flex-none`}>ปฏิเสธ</button>
        <button type="button" onClick={() => save('granted')} className={`${btn.primary} flex-1 sm:flex-none`}>ยอมรับ</button>
      </div>
    </section>
  )
}

// ปุ่มใน footer ให้เปิดแบนเนอร์อีกครั้งเพื่อเปลี่ยนคำตอบ
export function CookieSettingsButton() {
  return (
    <button type="button" onClick={() => save(null)} className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline">
      ตั้งค่าคุกกี้
    </button>
  )
}
