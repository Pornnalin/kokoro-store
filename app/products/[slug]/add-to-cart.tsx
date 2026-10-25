'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Cart } from '@/lib/types'
import { notifyCartChanged } from '../../cart-link'
import { CartIcon, CheckIcon } from '../../icons'
import { QuantityStepper, btn } from '../../ui'

const ERRORS: Record<number, string> = {
  404: 'ไม่พบสินค้านี้ ลองรีเฟรชหน้า',
  409: 'สต็อกไม่พอ (นับรวมกับที่อยู่ในตะกร้าแล้ว) ลองลดจำนวนลง',
}

export function AddToCart({ productId, stock }: { productId: number; stock: number }) {
  const [quantity, setQuantity] = useState(1)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  if (stock === 0) return null

  async function add() {
    setBusy(true)
    setMessage(null)
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    }).catch(() => null)
    if (res?.ok) {
      notifyCartChanged((await res.json()) as Cart)
      setMessage({ ok: true, text: `เพิ่ม ${quantity} ชิ้นลงตะกร้าแล้ว` })
    } else {
      setMessage({ ok: false, text: (res && ERRORS[res.status]) ?? 'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง' })
    }
    setBusy(false)
  }

  return (
    <div className="mt-8 border-t border-ink-soft/10 pt-6">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-quiet">จำนวน</p>
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper label="จำนวนสินค้า" value={quantity} max={stock} onChange={setQuantity} disabled={busy} />
        <button onClick={add} disabled={busy} className={`${btn.primary} flex-1 sm:flex-none sm:px-10`}>
          <CartIcon className="size-4" />
          {busy ? 'กำลังเพิ่ม...' : 'เพิ่มลงตะกร้า'}
        </button>
      </div>
      {message && (
        <div
          role="status"
          className={`mt-4 flex flex-wrap items-center gap-2 rounded px-4 py-3 text-sm ${
            message.ok ? 'bg-moss-soft text-moss' : 'bg-cinnabar-soft text-cinnabar'
          }`}
        >
          {message.ok && <CheckIcon className="size-4" />}
          {message.text}
          {message.ok && (
            <Link href="/cart" className="ml-auto font-medium underline underline-offset-4">ไปที่ตะกร้า</Link>
          )}
        </div>
      )}
    </div>
  )
}
