'use client'

import { useRouter } from 'next/navigation'

// เลือกแล้วไปที่ลิงก์ของตัวเลือกนั้นทันที (href สร้างจากหน้า server เก็บตัวกรองอื่นไว้ครบ)
export function SortSelect({
  current,
  options,
}: {
  current: string
  options: { value: string; label: string; href: string }[]
}) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="shrink-0 text-sm text-muted">เรียงตาม:</label>
      <select
        id="sort-select"
        value={current}
        onChange={(e) => {
          const next = options.find((o) => o.value === e.target.value)
          if (next) router.push(next.href, { scroll: false })
        }}
        className="min-h-11 cursor-pointer rounded bg-surface-low px-3 text-sm text-ink-soft"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
