'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Cart } from '@/lib/types'
import { CartIcon } from './icons'

const EVENT = 'cart-updated'
const countItems = (cart: Cart) => cart.items.reduce((n, i) => n + i.quantity, 0)

// เรียกหลังแก้ตะกร้าทุกครั้ง ให้ตัวเลขบน header อัปเดตทันที
export function notifyCartChanged(cart: Cart) {
  window.dispatchEvent(new CustomEvent<number>(EVENT, { detail: countItems(cart) }))
}

export function CartLink() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    fetch('/api/cart')
      .then((res) => res.json() as Promise<Cart>)
      .then((cart) => setCount(countItems(cart)))
      .catch(() => {})
    const onChange = (e: Event) => setCount((e as CustomEvent<number>).detail)
    window.addEventListener(EVENT, onChange)
    return () => window.removeEventListener(EVENT, onChange)
  }, [])

  return (
    <Link
      href="/cart"
      className="relative inline-flex min-h-11 items-center gap-2 rounded px-3 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-surface-mid"
    >
      <CartIcon />
      <span className="hidden sm:inline">ตะกร้า</span>
      {count > 0 && (
        <span className="min-w-5 rounded-full bg-cinnabar px-1.5 text-center text-[11px] font-semibold leading-5 text-white tabular-nums">
          {count}
          <span className="sr-only"> ชิ้นในตะกร้า</span>
        </span>
      )}
    </Link>
  )
}
