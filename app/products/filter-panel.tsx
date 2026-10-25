'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDownIcon, SlidersIcon } from '../icons'

// แถบกรองสินค้า: บนมือถือพับเก็บได้ (เริ่มต้นพับ) บนจอใหญ่แสดงตลอด
export function FilterPanel({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <aside className="w-full shrink-0 border border-line/60 bg-white lg:sticky lg:top-28 lg:w-70">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="product-filters"
        className="flex min-h-14 w-full items-center justify-between gap-3 px-5 lg:hidden"
      >
        <span className="flex items-center gap-2 font-medium">
          <SlidersIcon className="size-4" /> ตัวกรองสินค้า
          {activeCount > 0 && (
            <span className="min-w-5 rounded-full bg-cinnabar px-1.5 text-center text-[11px] font-semibold leading-5 text-white tabular-nums">
              {activeCount}
              <span className="sr-only"> ตัวกรองที่ใช้อยู่</span>
            </span>
          )}
        </span>
        <ChevronDownIcon className={`size-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id="product-filters"
        className={`space-y-6 p-5 lg:block lg:border-t-0 ${open ? 'block border-t border-line/60' : 'hidden'}`}
      >
        {children}
      </div>
    </aside>
  )
}
