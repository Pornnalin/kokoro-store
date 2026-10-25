import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ViewTransition, type ComponentType, type SVGProps } from 'react'
import { ClockIcon, GiftIcon, MailIcon, MapPinIcon, MessageIcon, PencilIcon, PhoneIcon } from '../icons'
import { Reveal } from '../motion'
import { SectionLabel } from '../ui'
import { ContactForm } from './contact-form'

export const metadata: Metadata = { title: 'ติดต่อเรา · KOKORO' }

// ข้อมูลตัวอย่างสำหรับพอร์ตโฟลิโอ (ไม่ใช่ร้านจริง)
const FAQ = [
  { q: 'จัดส่งกี่วัน?', a: 'ทั่วประเทศภายใน 2–4 วันทำการหลังชำระเงิน' },
  { q: 'เปลี่ยนหรือคืนสินค้าได้ไหม?', a: 'ภายใน 7 วันหลังได้รับของ หากสินค้ายังไม่ได้ใช้งานและอยู่ในสภาพเดิม' },
  { q: 'ชำระเงินได้ทางไหนบ้าง?', a: 'PromptPay QR, บัตรเครดิต/เดบิต และเก็บเงินปลายทาง (ระบบนี้เป็นการจำลอง ไม่มีการตัดเงินจริง)' },
  { q: 'แวะมาดูสินค้าที่หน้าร้านได้ไหม?', a: 'ได้ จันทร์–ศุกร์ 09:00–18:00 น. ร้านนี้เป็นตัวอย่างสำหรับพอร์ตโฟลิโอ จึงยังไม่มีหน้าร้านจริง' },
]

function Photo({ src, alt, tag, title }: { src: string; alt: string; tag: string; title: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-sm lg:aspect-auto lg:min-h-56">
      <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 28vw, 100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
      <p className="absolute bottom-4 left-4 right-4 text-surface">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] opacity-80">{tag}</span>
        <span className="mt-1 block font-medium">{title}</span>
      </p>
    </div>
  )
}

function Channel({ icon: Icon, label, value, href }: { icon: ComponentType<SVGProps<SVGSVGElement>>; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center gap-3 bg-surface-low p-4">
      <Icon className="size-5 text-cedar" />
      <div className="min-w-0">
        <p className="text-[11px] text-quiet">{label}</p>
        <p className="break-words text-sm text-ink-soft">
          {href ? <a href={href} className="underline-offset-4 hover:underline">{value}</a> : value}
        </p>
      </div>
    </div>
  )
}

export default function ContactPage() {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <div>
        <nav aria-label="เส้นทาง" className="flex items-center gap-2 text-sm text-quiet">
          <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink">หน้าแรก</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-ink">ติดต่อเรา</span>
        </nav>

        <header className="mt-2 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <SectionLabel>INQUIRIES</SectionLabel>
            <h1 className="mt-3 text-3xl font-medium tracking-tight lg:text-4xl">มีอะไรให้เราช่วย</h1>
            <p className="mt-3 leading-7 text-muted">
              ถามเรื่องสินค้า การสั่งซื้อ หรือการจัดส่ง ส่งข้อความผ่านแบบฟอร์ม หรือใช้ช่องทางด้านข้าง เราตอบกลับภายใน 24 ชั่วโมงทำการ
            </p>
          </div>
          <p className="flex items-center gap-2 bg-surface-low px-4 py-2 text-xs text-muted">
            <span aria-hidden className="size-2 rounded-full bg-moss" />
            เปิดทำการ จันทร์–ศุกร์ 09:00–18:00 น.
          </p>
        </header>

        <Reveal>
          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr_0.8fr]">
            <Photo src="/img/hero.jpg" alt="เครื่องเขียนวางบนโต๊ะไม้" tag="ATELIER STUDIO" title="สัมผัสความประณีตแห่งกระดาษทำมือ" />
            <Photo src="/img/craftsman.jpg" alt="ช่างทำกระดาษชาวญี่ปุ่นกำลังตักเยื่อกระดาษ" tag="MATERIAL HONESTY" title="ความเคารพในธรรมชาติและเส้นใย" />
            <div className="flex flex-col justify-between gap-6 bg-surface-mid p-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-quiet">DIRECT HOTLINE</p>
                <h2 className="mt-2 text-xl font-medium tracking-tight">พร้อมดูแลทุกการสนทนา</h2>
                <p className="mt-2 text-sm leading-6 text-muted">หากต้องการคำแนะนำสำหรับของขวัญหรือการสั่งซื้อจำนวนมาก โทรหาทีมงานได้โดยตรง</p>
              </div>
              <a href="tel:020000000" className="flex items-center justify-between gap-3 text-lg font-medium tabular-nums">
                02-000-0000
                <span className="flex size-10 items-center justify-center bg-ink-soft text-surface"><PhoneIcon className="size-4" /></span>
                <span className="sr-only">โทรหาเรา</span>
              </a>
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
          <section aria-labelledby="form-title" className="border border-line/60 bg-white p-5 sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-2">
              <div>
                <SectionLabel>MESSAGE</SectionLabel>
                <h2 id="form-title" className="mt-2 text-2xl font-medium tracking-tight">ส่งข้อความถึง KOKORO</h2>
                <p className="mt-1 text-sm text-muted">กรอกข้อมูลให้ครบถ้วน เพื่อให้เราจัดสรรทีมงานที่เหมาะสมที่สุดในการประสานงานกลับ</p>
              </div>
            </div>
            <ContactForm />
          </section>

          <aside className="space-y-4">
            <section className="border border-line/60 bg-white p-6">
              <SectionLabel>ATELIER & STORE</SectionLabel>
              <h2 className="mt-2 text-xl font-medium tracking-tight">KOKORO Store & Atelier</h2>
              <ul className="mt-4 space-y-4 text-sm leading-6 text-muted">
                <li className="flex gap-3">
                  <MapPinIcon className="mt-0.5 size-5 text-cedar" />
                  <span>123 ถนนตัวอย่าง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10000</span>
                </li>
                <li className="flex gap-3">
                  <ClockIcon className="mt-0.5 size-5 text-cedar" />
                  <span>จันทร์–ศุกร์ 09:00–18:00 น.<br /><span className="text-xs text-cinnabar">หยุดเสาร์–อาทิตย์และวันหยุดนักขัตฤกษ์</span></span>
                </li>
              </ul>
            </section>

            <section className="border border-line/60 bg-white p-6">
              <h2 className="text-lg font-medium tracking-tight">ช่องทางด่วน</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Channel icon={MailIcon} label="อีเมล" value="hello@kokoro.example" href="mailto:hello@kokoro.example" />
                <Channel icon={MessageIcon} label="LINE Official" value="@kokoro.example" />
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <section className="bg-kraft/40 p-5">
                <h2 className="flex items-center gap-2 font-medium"><PencilIcon className="size-4 text-cedar" />บริการสลักชื่อ</h2>
                <p className="mt-2 text-xs leading-5 text-muted">สลักชื่อบนปากกาและสมุด เหมาะเป็นของขวัญ สอบถามรายละเอียดผ่านแบบฟอร์ม</p>
              </section>
              <section className="bg-surface-mid p-5">
                <h2 className="flex items-center gap-2 font-medium"><GiftIcon className="size-4 text-cedar" />ของขวัญองค์กร</h2>
                <p className="mt-2 text-xs leading-5 text-muted">ชุดของขวัญสำหรับองค์กร ห่อกระดาษพร้อมการ์ด สอบถามจำนวนและราคาได้</p>
              </section>
            </div>
          </aside>
        </div>

        <Reveal>
          <section id="faq" aria-labelledby="faq-title" className="mx-auto mt-16 max-w-3xl scroll-mt-28">
            <div className="text-center">
              <SectionLabel className="justify-center">FAQ</SectionLabel>
              <h2 id="faq-title" className="mt-2 text-2xl font-medium tracking-tight">ข้อสงสัยที่พบบ่อย</h2>
            </div>
            <div className="mt-6 space-y-2">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group bg-white px-5">
                  <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 font-medium">
                    {q}
                    <span aria-hidden className="text-quiet transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-4 leading-7 text-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </Reveal>
      </div>
    </ViewTransition>
  )
}
