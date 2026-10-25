'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'หน้าแรก', hideOnMobile: false },
  { href: '/products', label: 'สินค้าทั้งหมด', hideOnMobile: false },
  { href: '/about', label: 'เรื่องราวของเรา', hideOnMobile: true },
  { href: '/contact', label: 'ติดต่อเรา', hideOnMobile: false },
]

// เมนูหลักของ header ขีดเส้นใต้หน้าปัจจุบัน
export function NavLinks() {
  // usePathname ต้องอยู่ใน Suspense (หน้า dynamic) ระหว่างรอแสดงเมนูเดิมแบบยังไม่ขีดเส้นใต้
  return (
    <Suspense fallback={<Links pathname={null} />}>
      <CurrentLinks />
    </Suspense>
  )
}

function CurrentLinks() {
  return <Links pathname={usePathname()} />
}

function Links({ pathname }: { pathname: string | null }) {
  return (
    <ul className="flex items-center sm:gap-2">
      {links.map(({ href, label, hideOnMobile }) => {
        const active = !href.includes('#') && pathname !== null && (href === '/' ? pathname === '/' : pathname.startsWith(href))
        return (
          <li key={href} className={hideOnMobile ? 'hidden md:block' : ''}>
            <Link
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative inline-flex min-h-11 items-center px-2 text-sm transition-colors duration-150 after:absolute after:inset-x-2 after:bottom-1.5 after:h-0.5 after:origin-left after:bg-cedar after:transition-transform after:duration-200 sm:px-3 ${
                active ? 'font-medium text-ink after:scale-x-100' : 'text-muted after:scale-x-0 hover:text-ink hover:after:scale-x-100'
              }`}
            >
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
