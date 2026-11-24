'use client'

import { ViewTransition, useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import { MAX_PER_ITEM, type Cart } from '@/lib/types'
import { notifyCartChanged } from '../cart-link'
import { CartIcon, TrashIcon } from '../icons'
import { ProductThumb } from '../product-thumb'
import { CartSkeleton } from '../skeletons'
import { QuantityStepper, SectionLabel, btn } from '../ui'

const ERRORS: Record<number, string> = {
  404: 'ไม่พบสินค้านี้ในตะกร้า ลองรีเฟรชหน้า',
  409: `สต็อกไม่พอ หรือเกิน ${MAX_PER_ITEM} ชิ้นต่อรายการ`,
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/cart')
      .then((res) => res.json() as Promise<Cart>)
      .then(setCart)
      .catch(() => setError('โหลดตะกร้าไม่สำเร็จ ลองรีเฟรชหน้า'))
  }, [])

  async function send(method: 'PATCH' | 'DELETE', body: { productId: number; quantity?: number }) {
    setBusyId(body.productId)
    setError(null)
    const res = await fetch('/api/cart', {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => null)
    if (res?.ok) {
      const next = (await res.json()) as Cart
      setCart(next)
      notifyCartChanged(next)
    } else {
      setError((res && ERRORS[res.status]) ?? 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง')
    }
    setBusyId(null)
  }

  const pieces = cart?.items.reduce((n, i) => n + i.quantity, 0) ?? 0

  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      {cart?.items.length !== 0 && <SectionLabel>ขั้นตอนการสั่งซื้อ · 1 / 3</SectionLabel>}
      <h1 className="mb-8 mt-2 text-3xl font-medium tracking-tight">ตะกร้าสินค้า</h1>
      {error && <p role="alert" className="mb-4 rounded bg-cinnabar-soft px-4 py-3 text-sm text-cinnabar">{error}</p>}
      {!cart ? (
        !error && <CartSkeleton />
      ) : cart.items.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="mb-2 text-sm text-quiet">ทั้งหมด {cart.items.length} รายการ ({pieces} ชิ้น)</p>
            <ul className="divide-y divide-ink-soft/10 border-y border-ink-soft/10">
              {cart.items.map((item) => {
                const busy = busyId === item.product_id
                return (
                  <li key={item.product_id} className={`flex gap-4 py-6 transition-opacity duration-150 sm:gap-5 ${busy ? 'opacity-60' : ''}`}>
                    <ProductThumb name={item.name} src={item.image_url} sizes="96px" className="size-20 shrink-0 border border-line/60 text-2xl sm:size-24" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <Link href={`/products/${item.slug}`} className="font-medium hover:underline hover:underline-offset-4">{item.name}</Link>
                        <p className="font-medium tabular-nums">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                      <p className="mt-0.5 text-sm tabular-nums text-quiet">{formatPrice(item.price)} / ชิ้น</p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <QuantityStepper
                          label={`จำนวน ${item.name}`}
                          value={item.quantity}
                          max={Math.min(item.stock, MAX_PER_ITEM)}
                          disabled={busyId !== null}
                          onChange={(quantity) => send('PATCH', { productId: item.product_id, quantity })}
                        />
                        <button
                          disabled={busyId !== null}
                          onClick={() => send('DELETE', { productId: item.product_id })}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded px-3 text-sm text-quiet transition-colors duration-150 hover:bg-cinnabar-soft hover:text-cinnabar disabled:opacity-40"
                        >
                          <TrashIcon className="size-4" /> ลบรายการ<span className="sr-only"> {item.name}</span>
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
              <Link href="/#products" className="inline-flex min-h-11 items-center text-muted underline-offset-4 hover:underline">← เลือกซื้อสินค้าชิ้นอื่นต่อ</Link>
              <span className="text-quiet">บันทึกตะกร้าอัตโนมัติแล้ว</span>
            </div>
          </div>

          <aside className="bg-surface-low p-6 lg:sticky lg:top-32">
            <h2 className="text-lg font-medium">สรุปคำสั่งซื้อ</h2>
            <p className="text-[11px] tracking-[0.12em] text-quiet">ORDER SUMMARY</p>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">ยอดรวมสินค้า ({cart.items.length} รายการ)</dt>
                <dd className="tabular-nums">{formatPrice(cart.total)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-ink-soft/10 pt-4">
                <dt className="font-medium">ยอดชำระสุทธิ</dt>
                <dd className="text-2xl font-medium tabular-nums">{formatPrice(cart.total)}</dd>
              </div>
            </dl>
            <Link href="/checkout" className={`${btn.primary} mt-6 w-full`}>ดำเนินการชำระเงิน</Link>
          </aside>
        </div>
      )}
    </ViewTransition>
  )
}

function EmptyCart() {
  return (
    <div className="border border-dashed border-line bg-surface-low px-6 py-16 text-center">
      <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-surface-high text-cedar">
        <CartIcon className="size-6" />
      </span>
      <p className="mt-4 text-lg font-medium">ตะกร้ายังว่างอยู่</p>
      <p className="mt-1 text-muted">เลือกสินค้าที่ถูกใจแล้วกดเพิ่มลงตะกร้าได้เลย</p>
      <Link href="/#products" className={`${btn.primary} mt-6`}>เลือกดูสินค้า</Link>
    </div>
  )
}
