import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { getCategories } from "@/lib/products";
import { Noto_Sans_Thai } from "next/font/google";
import { CartLink } from "./cart-link";
import { NavLinks } from "./nav-links";
import "./globals.css";

const font = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "KOKORO · เครื่องเขียนธรรมชาติ",
  description: "ร้านขายอุปกรณ์เครื่องเขียน สัมผัสความเรียบง่ายแบบญี่ปุ่น",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th">
      <body className={`${font.className} flex min-h-dvh flex-col bg-surface text-ink antialiased`}>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-PW8PS8G5W1" strategy="afterInteractive" />
        <Analytics />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-PW8PS8G5W1');`}
        </Script>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2">
          ข้ามไปเนื้อหา
        </a>
        <header style={{ viewTransitionName: 'site-header' }} className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md">
          <p className="bg-surface-high px-4 py-1.5 text-center text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
            ระบบชำระเงินจำลอง ไม่มีการตัดเงินจริง
          </p>
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 border-b border-ink-soft/10 px-4 sm:px-6 lg:px-12">
            <Link href="/" className="flex min-h-11 select-none items-baseline gap-2">
              <span className="text-2xl font-medium tracking-tight text-ink">KOKORO</span>
              <span className="text-sm font-medium text-quiet">文具</span>
            </Link>
            <div className="flex items-center gap-1 sm:gap-4">
              <NavLinks />
              <CartLink />
            </div>
          </nav>
        </header>
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-12">{children}</main>
        <footer className="mt-8 border-t border-ink-soft/10 bg-surface-low">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-12">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
              <div>
                <p className="text-lg font-medium tracking-tight">เกี่ยวกับ KOKORO</p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  สรรค์สร้างเครื่องเขียนจากความเคารพในธรรมชาติ ความสมถะ และแก่นแท้แห่งศิลปะระดับญี่ปุ่น เพื่อพื้นที่ทำงานที่สงบนิ่งและเป็นระเบียบ
                </p>
              </div>
              <nav aria-label="บริการลูกค้า">
                <p className="text-lg font-medium tracking-tight">บริการลูกค้า</p>
                <ul className="mt-2 text-sm text-muted">
                  {[['/products', 'สินค้าทั้งหมด'], ['/about', 'เรื่องราวของเรา'], ['/cart', 'ตะกร้าสินค้า'], ['/contact#faq', 'ข้อสงสัยที่พบบ่อย'], ['/contact', 'ติดต่อเรา']].map(([href, label]) => (
                    <li key={href}>
                      <Link href={href} className="inline-flex min-h-11 items-center hover:text-ink">{label}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav aria-label="คอลเลกชันแนะนำ">
                <p className="text-lg font-medium tracking-tight">คอลเลกชันแนะนำ</p>
                <Suspense fallback={null}>
                  <FooterCategories />
                </Suspense>
              </nav>
              <div>
                <p className="text-lg font-medium tracking-tight">พูดคุยกับเรา</p>
                <ul className="mt-2 text-sm text-muted">
                  <li><a href="mailto:hello@kokoro.example" className="inline-flex min-h-11 items-center hover:text-ink">hello@kokoro.example</a></li>
                  <li><a href="tel:020000000" className="inline-flex min-h-11 items-center hover:text-ink">02-000-0000</a></li>
                  <li className="flex min-h-11 items-center">จันทร์–ศุกร์ 09:00–18:00 น.</li>
                </ul>
              </div>
            </div>
            <p className="mt-10 border-t border-ink-soft/10 pt-6 text-xs text-quiet">
              © 2025 KOKORO 文具 STORE · โปรเจ็คตัวอย่างสำหรับพอร์ตโฟลิโอ ชำระเงินจำลอง ไม่มีการตัดเงินจริง
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

async function FooterCategories() {
  const categories = await getCategories()
  return (
    <ul className="mt-2 text-sm text-muted">
      {categories.map((c) => (
        <li key={c.id}>
          <Link href={`/products?category=${c.slug}`} className="inline-flex min-h-11 items-center hover:text-ink">{c.name}</Link>
        </li>
      ))}
    </ul>
  )
}
