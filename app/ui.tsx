import { MinusIcon, PlusIcon } from './icons'

// ปุ่มตามดีไซน์ KOKORO: สี่เหลี่ยมมุมเล็ก ไม่มีเงา สูง 48px กดง่ายบนมือถือ
const base =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded px-6 text-sm font-medium tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50'

export const btn = {
  primary: `${base} bg-ink-soft text-surface hover:bg-ink`,
  secondary: `${base} border border-ink-soft bg-transparent text-ink-soft hover:bg-surface-mid`,
}

// ป้ายหัวข้อเล็กเหนือหัวข้อหลัก มีเส้นสั้นสีซีดาร์นำหน้า คั่นข้อความด้วย "·"
export function SectionLabel({ children, className = '' }: { children: string; className?: string }) {
  return (
    <p className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-cedar ${className}`}>
      <span aria-hidden className="h-px w-6 bg-cedar/60" />
      {children}
    </p>
  )
}

// แท่งเทาวิ่ง (skeleton) ปิดแอนิเมชันถ้าผู้ใช้ตั้ง reduced motion
export function Bone({ className = '' }: { className?: string }) {
  return <div aria-hidden className={`rounded-sm bg-surface-high motion-safe:animate-pulse ${className}`} />
}

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled = false,
  label,
}: {
  value: number
  max: number
  onChange: (next: number) => void
  disabled?: boolean
  label: string
}) {
  const stepBtn =
    'inline-flex size-11 items-center justify-center text-ink-soft transition-colors duration-150 hover:bg-surface-mid disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded border border-line bg-white">
      <button type="button" aria-label="ลดจำนวน" disabled={disabled || value <= 1} onClick={() => onChange(value - 1)} className={`${stepBtn} rounded-l`}>
        <MinusIcon className="size-4" />
      </button>
      <span aria-live="polite" className="w-10 text-center text-sm font-medium tabular-nums">{value}</span>
      <button type="button" aria-label="เพิ่มจำนวน" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} className={`${stepBtn} rounded-r`}>
        <PlusIcon className="size-4" />
      </button>
    </div>
  )
}
