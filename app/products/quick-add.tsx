'use client'

import { useState } from 'react'
import type { Cart } from '@/lib/types'
import { notifyCartChanged } from '../cart-link'
import { CartIcon, CheckIcon } from '../icons'

type State = 'idle' | 'busy' | 'done' | 'error'

// ปุ่ม "เพิ่มลงตะกร้า" บนการ์ดสินค้า เพิ่มทีละ 1 ชิ้น
export function QuickAdd({ productId, stock, name }: { productId: number; stock: number; name: string }) {
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')

  async function add() {
    setState('busy')
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
    }).catch(() => null)
    if (res?.ok) {
      notifyCartChanged((await res.json()) as Cart)
      setState('done')
    } else {
      setError(res?.status === 409 ? 'สต็อกไม่พอ' : 'ลองใหม่อีกครั้ง')
      setState('error')
    }
    setTimeout(() => setState('idle'), 2000)
  }

  const label =
    stock === 0 ? 'สินค้าหมด' : state === 'busy' ? 'กำลังเพิ่ม...' : state === 'done' ? 'เพิ่มแล้ว' : state === 'error' ? error : 'เพิ่มลงตะกร้า'

  return (
    <button
      type="button"
      onClick={add}
      disabled={stock === 0 || state === 'busy'}
      aria-label={`เพิ่ม ${name} ลงตะกร้า`}
      className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded px-4 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
        state === 'error' ? 'bg-cinnabar-soft text-cinnabar' : 'bg-ink-soft text-surface hover:bg-ink'
      }`}
    >
      {state === 'done' ? <CheckIcon className="size-4" /> : <CartIcon className="size-4" />}
      <span aria-live="polite">{label}</span>
    </button>
  )
}
