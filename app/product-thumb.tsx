'use client'

import { useState } from 'react'
import Image from 'next/image'

// แสดงรูปสินค้าจาก image_url ถ้าไม่มี/โหลดไม่ได้ (ยังไม่มีไฟล์ใน public/img) ให้แสดงกล่องสีกระดาษกับตัวอักษรแรกแทน
export function ProductThumb({
  name,
  src,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  eager = false,
  className = '',
}: {
  name: string
  src?: string | null
  sizes?: string
  eager?: boolean
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  return (
    <div className={`relative aspect-square overflow-hidden rounded-sm bg-surface-mid ${className}`}>
      {src && !failed ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <div aria-hidden className="flex size-full items-center justify-center font-medium text-cedar/70">
          {name.charAt(0)}
        </div>
      )}
    </div>
  )
}
