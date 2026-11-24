'use client'

import { useState } from 'react'
import { ArrowRightIcon, CheckIcon, ClockIcon } from '../icons'
import { Turnstile } from '../turnstile'
import { btn } from '../ui'

const input = 'min-h-11 w-full rounded border border-ink-soft/15 bg-white px-3 text-base placeholder:text-quiet/60 focus:border-ink-soft'
const SUBJECTS = ['สอบถามสินค้า', 'ติดตามคำสั่งซื้อ', 'การจัดส่งและการคืนสินค้า', 'ของขวัญและสั่งซื้อจำนวนมาก', 'อื่น ๆ']
const MAX = 500

type State = 'idle' | 'busy' | 'done' | 'error'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label} <span aria-hidden className="text-cinnabar">*</span></span>
      {children}
    </label>
  )
}

export function ContactForm() {
  const [state, setState] = useState<State>('idle')
  const [length, setLength] = useState(0)
  const [attempt, setAttempt] = useState(0) // เปลี่ยนแล้ว Turnstile ขอ token ใหม่

  async function submit(form: FormData) {
    setState('busy')
    // form มี cf-turnstile-response จาก widget อยู่แล้ว
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...Object.fromEntries(form), consent: form.get('consent') === 'on' }),
    }).catch(() => null)
    setState(res?.ok ? 'done' : 'error')
    setAttempt((n) => n + 1)
  }

  if (state === 'done') {
    return (
      <div role="status" className="bg-moss-soft p-8 text-center sm:p-12">
        <CheckIcon className="mx-auto size-8 text-moss" />
        <p className="mt-3 text-lg font-medium text-moss">ส่งข้อความแล้ว</p>
        <p className="mt-1 text-sm text-muted">ทีมงานจะตอบกลับทางอีเมลภายใน 24 ชั่วโมงทำการ</p>
        <button type="button" onClick={() => { setState('idle'); setLength(0) }} className={`${btn.secondary} mt-6`}>ส่งข้อความอีกครั้ง</button>
      </div>
    )
  }

  return (
    <form action={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="ชื่อ - นามสกุล">
          <input name="name" required maxLength={200} autoComplete="name" placeholder="คุณสมชาย สมบัติสุข" className={input} />
        </Field>
        <Field label="เบอร์โทรศัพท์">
          <input name="phone" type="tel" required maxLength={30} pattern="[0-9+\-\s]{8,30}" autoComplete="tel" placeholder="081-234-5678" className={input} />
        </Field>
        <Field label="อีเมล">
          <input name="email" type="email" required maxLength={320} autoComplete="email" placeholder="name@example.com" className={input} />
        </Field>
        <Field label="หัวข้อที่ต้องการติดต่อ">
          <select name="subject" required defaultValue="" className={input}>
            <option value="" disabled>กรุณาเลือกหัวข้อเรื่อง</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div>
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <label htmlFor="contact-message" className="text-sm font-medium">ข้อความ <span aria-hidden className="text-cinnabar">*</span></label>
          <span className="text-xs tabular-nums text-quiet">{length} / {MAX}</span>
        </div>
        <textarea
          id="contact-message"
          name="message"
          required
          maxLength={MAX}
          rows={5}
          onChange={(e) => setLength(e.target.value.length)}
          placeholder="เขียนรายละเอียดที่ต้องการสอบถาม เช่น รหัสสินค้าที่สนใจ จำนวนชิ้น หรือระบุคำถามเกี่ยวกับสินค้า"
          className={`${input} py-2`}
        />
      </div>
      <label className="flex items-start gap-3 text-sm leading-6 text-muted">
        <input type="checkbox" name="consent" required className="mt-1.5 size-4 shrink-0 accent-ink-soft" />
        ฉันยินยอมให้ KOKORO จัดเก็บและประมวลผลข้อมูลส่วนบุคคลข้างต้น เพื่อการติดต่อตอบกลับตามนโยบายความเป็นส่วนตัว
      </label>
      <Turnstile key={attempt} />
      {state === 'error' && (
        <p role="alert" className="rounded bg-cinnabar-soft px-4 py-3 text-sm text-cinnabar">ส่งไม่สำเร็จ ตรวจข้อมูลแล้วลองอีกครั้ง</p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <p className="flex items-center gap-2 text-xs text-quiet"><ClockIcon className="size-4" />ทีมงานตอบกลับภายใน 24 ชั่วโมงทำการ</p>
        <button type="submit" disabled={state === 'busy'} className={`${btn.primary} w-full sm:w-auto sm:min-w-48`}>
          {state === 'busy' ? 'กำลังส่ง...' : <>ส่งข้อความ <ArrowRightIcon className="size-4" /></>}
        </button>
      </div>
    </form>
  )
}
