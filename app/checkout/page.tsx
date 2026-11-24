'use client'

import { ViewTransition, useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import type { Cart } from '@/lib/types'
import { notifyCartChanged } from '../cart-link'
import { CheckIcon } from '../icons'
import { Turnstile } from '../turnstile'
import { Bone, SectionLabel, btn } from '../ui'

type Method = 'promptpay' | 'card' | 'cod'
type Order = { orderId: string; total: number; status: 'pending' | 'paid'; method?: Method }

const METHODS: { value: Method; label: string; hint: string }[] = [
  { value: 'promptpay', label: 'PromptPay QR', hint: 'สแกน QR จากแอปธนาคาร' },
  { value: 'card', label: 'บัตรเครดิต / เดบิต', hint: 'Visa, Mastercard, JCB' },
  { value: 'cod', label: 'เก็บเงินปลายทาง', hint: 'ชำระเงินสดเมื่อรับสินค้า' },
]

const CHECKOUT_ERRORS: Record<number, string> = {
  400: 'กรุณากรอกชื่อและที่อยู่ให้ครบ (หรือตะกร้าว่าง)',
  403: 'ยืนยันว่าไม่ใช่บอทไม่สำเร็จ ลองใหม่อีกครั้ง',
  409: 'สินค้าบางรายการสต็อกไม่พอ กรุณากลับไปแก้จำนวนในตะกร้า',
}

const STEPS = ['ตะกร้าสินค้า', 'ข้อมูลจัดส่ง', 'ชำระเงิน', 'เสร็จสิ้น']

const input = 'min-h-11 w-full rounded border border-ink-soft/15 bg-white px-3 text-base placeholder:text-quiet/60 focus:border-ink-soft'

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0) // เปลี่ยนแล้ว Turnstile ขอ token ใหม่

  useEffect(() => {
    fetch('/api/cart')
      .then((res) => res.json() as Promise<Cart>)
      .then(setCart)
      .catch(() => setError('โหลดตะกร้าไม่สำเร็จ ลองรีเฟรชหน้า'))
  }, [])

  async function placeOrder(form: FormData) {
    setBusy(true)
    setError(null)
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        customerName: form.get('customerName'),
        address: form.get('address'),
        'cf-turnstile-response': form.get('cf-turnstile-response'),
      }),
    }).catch(() => null)
    if (res?.ok) {
      setOrder((await res.json()) as Order)
      notifyCartChanged({ items: [], total: 0 })
    } else {
      setError((res && CHECKOUT_ERRORS[res.status]) ?? 'สั่งซื้อไม่สำเร็จ ลองใหม่อีกครั้ง')
      setAttempt((n) => n + 1)
    }
    setBusy(false)
  }

  async function pay(method: Method) {
    if (!order) return
    setBusy(true)
    setError(null)
    const res = await fetch(`/api/orders/${order.orderId}/pay`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ method }),
    }).catch(() => null)
    if (res?.ok) {
      const { status } = (await res.json()) as { status: Order['status'] }
      setOrder({ ...order, status, method })
    } else if (res?.status === 409) {
      // จ่ายไปแล้ว ถือว่าสำเร็จ
      setOrder({ ...order, status: 'paid', method })
    } else setError('ชำระเงินไม่สำเร็จ ลองกดอีกครั้ง')
    setBusy(false)
  }

  const step = order?.method ? 3 : order ? 2 : 1

  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <Steps current={step} />
      {error && <p role="alert" className="mx-auto mb-6 max-w-3xl rounded bg-cinnabar-soft px-4 py-3 text-sm text-cinnabar">{error}</p>}
      {order?.method ? (
        <Done order={order} />
      ) : order ? (
        <Pay order={order} busy={busy} onPay={pay} />
      ) : !cart ? (
        !error && <CheckoutSkeleton />
      ) : cart.items.length === 0 ? (
        <div className="border border-dashed border-line bg-surface-low px-6 py-16 text-center">
          <p className="text-lg font-medium">ตะกร้ายังว่างอยู่</p>
          <Link href="/#products" className={`${btn.primary} mt-6`}>เลือกดูสินค้า</Link>
        </div>
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <form action={placeOrder}>
            <SectionLabel>ขั้นตอน 2 · ข้อมูลจัดส่ง</SectionLabel>
            <h1 className="mb-6 mt-2 text-3xl font-medium tracking-tight">ข้อมูลจัดส่ง</h1>
            <div className="space-y-5">
              <div>
                <label htmlFor="customerName" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
                  ชื่อผู้รับ <span className="text-cinnabar" aria-hidden>*</span>
                </label>
                <input id="customerName" name="customerName" required maxLength={200} autoComplete="name" className={input} />
              </div>
              <div>
                <label htmlFor="address" className="mb-1.5 block text-xs font-medium tracking-wide text-muted">
                  ที่อยู่จัดส่ง <span className="text-cinnabar" aria-hidden>*</span>
                </label>
                <textarea id="address" name="address" required maxLength={1000} rows={4} autoComplete="street-address"
                  aria-describedby="address-help" className={`${input} py-2`} />
                <p id="address-help" className="mt-1.5 text-xs text-quiet">บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์</p>
              </div>
            </div>
            <div className="mt-6"><Turnstile key={attempt} /></div>
            <button type="submit" disabled={busy} className={`${btn.primary} mt-6 w-full`}>
              {busy ? 'กำลังสั่งซื้อ...' : `ยืนยันคำสั่งซื้อ (${formatPrice(cart.total)})`}
            </button>
            <Link href="/cart" className="mt-3 flex min-h-11 items-center justify-center text-sm text-muted underline-offset-4 hover:underline">← กลับไปแก้ไขตะกร้า</Link>
          </form>

          <aside className="bg-surface-low p-6 lg:sticky lg:top-32">
            <h2 className="text-lg font-medium">สรุปคำสั่งซื้อ</h2>
            <p className="text-[11px] tracking-[0.12em] text-quiet">ORDER SUMMARY</p>
            <ul className="mt-5 space-y-3 text-sm">
              {cart.items.map((item) => (
                <li key={item.product_id} className="flex justify-between gap-3">
                  <span className="text-ink-soft">{item.name} <span className="text-quiet">× {item.quantity}</span></span>
                  <span className="tabular-nums">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 flex items-baseline justify-between border-t border-ink-soft/10 pt-4">
              <span className="font-medium">ยอดชำระสุทธิ</span>
              <span className="text-2xl font-medium tabular-nums">{formatPrice(cart.total)}</span>
            </p>
          </aside>
        </div>
      )}
    </ViewTransition>
  )
}

function Steps({ current }: { current: number }) {
  return (
    <ol className="mx-auto mb-10 flex max-w-3xl items-center gap-2 text-sm">
      {STEPS.map((label, i) => {
        const done = i < current
        const now = i === current
        return (
          <li key={label} aria-current={now ? 'step' : undefined} className="flex flex-1 items-center gap-2">
            <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
              done ? 'bg-ink-soft text-surface' : now ? 'border-2 border-ink-soft text-ink-soft' : 'border border-line text-quiet'
            }`}>
              {done ? <CheckIcon className="size-4" /> : i + 1}
            </span>
            <span className={`hidden sm:inline ${now ? 'font-medium text-ink' : 'text-quiet'}`}>{label}</span>
            {i < STEPS.length - 1 && <span aria-hidden className={`h-px flex-1 ${done ? 'bg-ink-soft' : 'bg-line'}`} />}
          </li>
        )
      })}
    </ol>
  )
}

function Pay({ order, busy, onPay }: { order: Order; busy: boolean; onPay: (method: Method) => void }) {
  const [method, setMethod] = useState<Method>('promptpay')
  const cod = method === 'cod'

  return (
    <div className="mx-auto max-w-md bg-surface-low p-8">
      <SectionLabel>ขั้นตอน 3 · ชำระเงิน</SectionLabel>
      <h1 className="mt-2 text-2xl font-medium tracking-tight">เลือกวิธีชำระเงิน</h1>
      <p className="mt-2 break-all text-xs text-quiet">เลขที่คำสั่งซื้อ {order.orderId}</p>
      <p className="mt-4 text-4xl font-medium tabular-nums">{formatPrice(order.total)}</p>
      <fieldset className="mt-6 space-y-2">
        <legend className="sr-only">วิธีชำระเงิน</legend>
        {METHODS.map((m) => (
          <label key={m.value} className={`flex min-h-14 cursor-pointer items-center gap-3 border bg-white px-4 py-2 ${
            method === m.value ? 'border-ink-soft' : 'border-line/60'
          }`}>
            <input type="radio" name="method" value={m.value} checked={method === m.value}
              onChange={() => setMethod(m.value)} className="size-4 accent-ink-soft" />
            <span>
              <span className="block font-medium">{m.label}</span>
              <span className="block text-xs text-quiet">{m.hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      <p className="mt-4 rounded bg-kraft/60 px-3 py-2 text-sm text-cedar">ระบบจ่ายเงินจำลอง ไม่มีการตัดเงินจริง</p>
      <button onClick={() => onPay(method)} disabled={busy} className={`${btn.primary} mt-6 w-full`}>
        {busy ? 'กำลังดำเนินการ...' : cod ? 'ยืนยันคำสั่งซื้อ' : 'ชำระเงิน'}
      </button>
    </div>
  )
}

function Done({ order }: { order: Order }) {
  const paid = order.status === 'paid'
  return (
    <div role="status" className="mx-auto max-w-md bg-surface-low p-8 text-center">
      <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-moss-soft text-moss">
        <CheckIcon className="size-7" />
      </span>
      <h1 className="mt-4 text-2xl font-medium tracking-tight">{paid ? 'ชำระเงินสำเร็จ' : 'รับคำสั่งซื้อแล้ว'}</h1>
      <p className="mt-2 text-muted">{paid ? 'ขอบคุณที่สั่งซื้อกับ KOKORO' : 'ชำระเงินสดเมื่อได้รับสินค้า'}</p>
      <dl className="mt-6 space-y-2 border-t border-ink-soft/10 pt-4 text-left text-sm">
        <div className="flex justify-between gap-3"><dt className="text-quiet">เลขที่คำสั่งซื้อ</dt><dd className="break-all text-right font-mono text-xs">{order.orderId}</dd></div>
        <div className="flex justify-between"><dt className="text-quiet">วิธีชำระ</dt><dd>{METHODS.find((m) => m.value === order.method)?.label}</dd></div>
        <div className="flex justify-between"><dt className="text-quiet">{paid ? 'ยอดชำระ' : 'ยอดที่ต้องชำระ'}</dt><dd className="font-medium tabular-nums">{formatPrice(order.total)}</dd></div>
      </dl>
      <Link href="/#products" className={`${btn.primary} mt-6 w-full`}>เลือกซื้อสินค้าต่อ</Link>
    </div>
  )
}

function CheckoutSkeleton() {
  return (
    <div role="status" aria-label="กำลังโหลด" className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <Bone className="h-3 w-32" />
        <Bone className="mt-3 h-9 w-48" />
        <Bone className="mt-8 h-3 w-24" />
        <Bone className="mt-2 h-11 w-full" />
        <Bone className="mt-5 h-3 w-24" />
        <Bone className="mt-2 h-28 w-full" />
        <Bone className="mt-8 h-12 w-full" />
      </div>
      <div className="bg-surface-low p-6">
        <Bone className="h-5 w-32" />
        <Bone className="mt-5 h-4 w-full" />
        <Bone className="mt-3 h-4 w-full" />
        <Bone className="mt-6 h-8 w-1/2" />
      </div>
    </div>
  )
}
