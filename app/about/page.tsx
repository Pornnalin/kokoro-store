import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { ArrowRightIcon, ClockIcon, LeafIcon, PencilIcon } from '../icons'
import { Reveal, Stagger, StaggerItem } from '../motion'
import { SectionLabel, btn } from '../ui'

export const metadata: Metadata = { title: 'เรื่องราวของเรา · KOKORO' }

const values = [
  { icon: LeafIcon, title: 'วัสดุธรรมชาติ', body: 'กระดาษ ไม้ และโลหะ คัดวัสดุที่รู้สึกถึงเนื้อแท้ เพื่องานเขียนที่ลื่นไหลและสัมผัสที่ดี' },
  { icon: PencilIcon, title: 'ออกแบบเรียบง่าย', body: 'ตัดสิ่งที่ไม่จำเป็นออก เหลือเพียงรูปทรงที่ใช้งานได้จริงในทุกวัน และวางบนโต๊ะแล้วสงบตา' },
  { icon: ClockIcon, title: 'อยู่กับคุณได้นาน', body: 'ทนทาน เติมและเปลี่ยนไส้ได้ ใช้ได้นานโดยไม่ต้องซื้อซ้ำ' },
]

export default function AboutPage() {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <div>
        <nav aria-label="เส้นทาง" className="flex items-center gap-2 text-sm text-quiet">
          <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink">หน้าแรก</Link>
          <span aria-hidden>/</span>
          <span aria-current="page" className="text-ink">เรื่องราวของเรา</span>
        </nav>

        <header className="mt-2 max-w-2xl">
          <SectionLabel>ABOUT · เรื่องราวของเรา</SectionLabel>
          <h1 className="mt-3 text-3xl font-medium leading-snug tracking-tight lg:text-4xl">
            เราเลือกที่จะตัดสิ่งที่ไม่จำเป็น
            <br />
            เพื่อให้เหลือเพียงเนื้อแท้ของความคิด
          </h1>
          <p className="mt-5 leading-7 text-muted">
            KOKORO เริ่มจากความเชื่อง่าย ๆ ว่าเครื่องเขียนที่ดีควรทำให้ทุกการจดบันทึกเป็นเรื่องที่น่ายินดี
            เราจึงเลือกวัสดุอย่างพิถีพิถัน และออกแบบให้เรียบง่ายพอจะอยู่บนโต๊ะทำงานได้ทุกวัน
          </p>
        </header>

        <Reveal>
          <div className="relative mt-10 aspect-[16/9] lg:aspect-[21/9] overflow-hidden rounded-sm">
            <Image
              src="/img/craftsman.jpg"
              alt="ช่างทำกระดาษชาวญี่ปุ่นกำลังตักเยื่อกระดาษในบ่อน้ำ"
              fill
              sizes="(min-width: 1280px) 1184px, 100vw"
              loading="eager"
              className="object-cover object-center"
            />
          </div>
        </Reveal>

        <Reveal>
          <section className="mt-16 grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
            <h2 className="text-2xl font-medium tracking-tight">ปรัชญาเบื้องหลังการออกแบบ</h2>
            <div className="space-y-4 leading-7 text-muted">
              <p>
                ช่างกระดาษที่ทำงานด้วยมือรู้ดีว่าความงามไม่ได้มาจากการเติมแต่ง แต่มาจากการเลือกว่าจะเก็บอะไรไว้
                เราเอาแนวคิดนั้นมาใช้กับทุกชิ้นงาน ตั้งแต่รูปทรง สี ไปจนถึงน้ำหนักในมือ
              </p>
              <p>
                สินค้าของเราจึงมีไม่มาก แต่ทุกชิ้นถูกคัดมาแล้วว่าใช้งานได้จริง ปากกาที่เขียนลื่น สมุดที่รับหมึกได้ดี
                และอุปกรณ์จัดโต๊ะที่ทำให้พื้นที่ทำงานเป็นระเบียบโดยไม่ต้องพยายาม
              </p>
            </div>
          </section>
        </Reveal>

        <section className="mt-16">
          <h2 className="text-2xl font-medium tracking-tight">สิ่งที่เรายึดถือ</h2>
          <Stagger className="mt-8 grid gap-4 md:grid-cols-3">
            {values.map(({ icon: Icon, title, body }) => (
              <StaggerItem key={title} className="bg-surface-low p-6">
                <Icon className="size-6 text-cedar" />
                <h3 className="mt-4 font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <Reveal>
          <section className="mt-16 flex flex-wrap items-center justify-between gap-6 border-t border-ink-soft/10 pt-10">
            <p className="text-xl font-medium tracking-tight">พร้อมจัดโต๊ะทำงานให้สงบขึ้นหรือยัง</p>
            <Link href="/products" className={btn.primary}>
              เลือกชมสินค้า
              <ArrowRightIcon className="size-4" />
            </Link>
          </section>
        </Reveal>
      </div>
    </ViewTransition>
  )
}
