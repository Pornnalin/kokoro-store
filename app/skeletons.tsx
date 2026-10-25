import { Bone } from './ui'

// โครงหน้าระหว่างโหลด ขนาดเท่าของจริง จะได้ไม่กระตุกตอนข้อมูลมา

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-label="กำลังโหลดสินค้า">
      <div className="mb-8 flex flex-wrap gap-2">
        {['w-20', 'w-32', 'w-36', 'w-28'].map((w) => <Bone key={w} className={`h-11 rounded-full ${w}`} />)}
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <Bone className="aspect-square w-full" />
            <Bone className="mt-4 h-3 w-1/3" />
            <Bone className="mt-2 h-5 w-4/5" />
            <Bone className="mt-3 h-5 w-1/4" />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div role="status" aria-label="กำลังโหลดสินค้า" className="mt-6 grid gap-10 md:grid-cols-2 lg:gap-16">
      <Bone className="aspect-square w-full" />
      <div>
        <Bone className="h-3 w-40" />
        <Bone className="mt-4 h-9 w-3/4" />
        <Bone className="mt-6 h-9 w-1/4" />
        <Bone className="mt-5 h-7 w-40" />
        <Bone className="mt-10 h-px w-full" />
        <div className="mt-8 flex gap-3">
          <Bone className="h-12 w-32" />
          <Bone className="h-12 flex-1" />
        </div>
      </div>
    </div>
  )
}

export function CartSkeleton() {
  return (
    <div role="status" aria-label="กำลังโหลดตะกร้า" className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <ul className="divide-y divide-ink-soft/10 border-y border-ink-soft/10">
        {Array.from({ length: 3 }, (_, i) => (
          <li key={i} className="flex gap-5 py-6">
            <Bone className="size-24 shrink-0" />
            <div className="flex-1">
              <Bone className="h-3 w-24" />
              <Bone className="mt-2 h-5 w-1/2" />
              <Bone className="mt-2 h-4 w-1/4" />
              <Bone className="mt-4 h-11 w-32" />
            </div>
          </li>
        ))}
      </ul>
      <div className="bg-surface-low p-6">
        <Bone className="h-5 w-1/2" />
        <Bone className="mt-6 h-4 w-full" />
        <Bone className="mt-3 h-8 w-2/3" />
        <Bone className="mt-6 h-12 w-full" />
      </div>
    </div>
  )
}

export function CatalogSkeleton() {
  return (
    <div role="status" aria-label="กำลังโหลดสินค้า" className="-mt-8">
      <div className="-mx-4 bg-surface-low/70 px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12">
        <Bone className="h-3 w-48" />
        <Bone className="mt-4 h-10 w-72" />
        <Bone className="mt-3 h-4 w-96 max-w-full" />
      </div>
      <div className="flex flex-col items-start gap-6 py-8 lg:flex-row lg:gap-8">
        <div className="w-full shrink-0 border border-line/60 bg-white p-5 lg:w-70">
          <Bone className="h-5 w-32" />
          <Bone className="mt-6 h-11 w-full" />
          <Bone className="mt-4 h-11 w-full" />
          <Bone className="mt-6 h-11 w-full" />
          <Bone className="mt-2 h-11 w-full" />
          <Bone className="mt-2 h-11 w-full" />
        </div>
        <div className="w-full flex-1">
          <Bone className="h-17 w-full" />
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="border border-line/60 bg-white">
                <Bone className="aspect-square w-full rounded-none" />
                <div className="p-4">
                  <Bone className="h-3 w-1/3" />
                  <Bone className="mt-2 h-5 w-4/5" />
                  <Bone className="mt-6 h-11 w-full" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
