import { Suspense, ViewTransition, cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getCategories, getProducts } from '@/lib/products'
import { formatPrice } from '@/lib/format'
import { ArrowRightIcon, CheckIcon, ClockIcon, LeafIcon, PencilIcon, ShieldCheckIcon } from './icons'
import { Reveal, Rise, Stagger, StaggerItem } from './motion'
import { ProductThumb } from './product-thumb'
import { QuickAdd } from './products/quick-add'
import { Bone, SectionLabel, btn } from './ui'

const allProducts = cache(() => getProducts(null))

export default function Home() {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <Hero />

      <Reveal>
        <section id="categories" className="scroll-mt-28 py-16">
          <Suspense fallback={<Bone className="h-72 w-full" />}>
            <Categories />
          </Suspense>
        </section>
      </Reveal>

      <Reveal>
        <section className="pb-16">
          <Suspense fallback={<Bone className="h-[28rem] w-full" />}>
            <Collection />
          </Suspense>
        </section>
      </Reveal>

      <Reveal>
        <section id="products" className="scroll-mt-28 py-16">
          <Suspense fallback={<Bone className="h-96 w-full" />}>
            <BestSellers />
          </Suspense>
        </section>
      </Reveal>

      <Reveal>
        <Craft />
      </Reveal>

      <Reveal>
        <Testimonials />
      </Reveal>
    </ViewTransition>
  )
}

function SectionHead({ label, title, children }: { label: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <SectionLabel>{label}</SectionLabel>
        <h2 className="mt-2 text-2xl font-medium tracking-tight lg:text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  )
}

const textLink = 'inline-flex min-h-11 shrink-0 items-center text-sm font-medium text-ink-soft underline-offset-4 hover:underline'

function Hero() {
  return (
    <section className="relative -mx-4 -mt-8 overflow-hidden bg-surface-low px-4 py-20 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12 lg:py-32">
      <Image src="/img/hero.jpg" alt="" fill sizes="100vw" loading="eager" className="object-cover object-right" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-surface/10 lg:via-surface/60" />
      <div className="relative max-w-xl">
        <Rise><SectionLabel>SPRING 2025 · คอลเลกชันฤดูใบไม้ผลิ</SectionLabel></Rise>
        <Rise delay={0.1}>
        <h1 className="mt-4 text-[2rem] font-medium leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          ชีวิตที่เรียบง่าย
          <br />
          ด้วยเครื่องเขียนธรรมชาติ
        </h1>
        </Rise>
        <Rise delay={0.2}>
        <p className="mt-5 leading-7 text-muted">
          สัมผัสเครื่องเขียนประณีตของกระดาษวาชิ ไซเซและปากกาหมึกซึมคลาสสิกที่เขียนลื่น
          อุปกรณ์จัดโต๊ะที่สร้างสรรค์ให้ทุกวันของคุณสงบและเป็นระเบียบ
        </p>
        </Rise>
        <Rise delay={0.3} className="mt-8 flex flex-wrap gap-3">
          <Link href="/products" className={btn.primary}>สำรวจคอลเลกชันใหม่<ArrowRightIcon className="size-4" /></Link>
          <Link href="/about" className={btn.secondary}>อ่านเรื่องราวของเรา</Link>
        </Rise>
        <Rise delay={0.4}>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
          <li className="flex items-center gap-2"><LeafIcon className="size-4 text-moss" />วัสดุธรรมชาติ 100%</li>
          <li className="flex items-center gap-2"><ShieldCheckIcon className="size-4 text-moss" />ทนทาน ใช้ได้ทุกวัน</li>
        </ul>
        </Rise>
      </div>
    </section>
  )
}

async function Categories() {
  const [categories, products] = await Promise.all([getCategories(), allProducts()])
  return (
    <>
      <SectionHead label="หมวดสินค้า" title="ค้นหาตามความต้องการทำงาน">
        <Link href="/products" className={textLink}>ดูสินค้าทั้งหมด →</Link>
      </SectionHead>
      <Stagger className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
        {categories.map((c) => {
          const inCategory = products.filter((p) => p.category_id === c.id)
          const cover = inCategory.find((p) => p.image_url) ?? inCategory[0]
          return (
            <StaggerItem key={c.id}>
              <Link href={`/products?category=${c.slug}`} className="zoom group block">
                <ProductThumb
                  name={c.name}
                  src={cover?.image_url}
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
                  className="border border-line/60 text-3xl"
                />
                <p className="mt-3 flex items-center justify-between gap-2 text-sm font-medium">
                  <span className="group-hover:underline group-hover:underline-offset-4">{c.name}</span>
                  <span aria-hidden className="text-quiet">↗</span>
                </p>
                <p className="text-xs text-quiet">{inCategory.length} รายการ</p>
              </Link>
            </StaggerItem>
          )
        })}
      </Stagger>
    </>
  )
}

async function Collection() {
  const products = (await allProducts()).filter((p) => p.stock > 0).slice(0, 3)
  if (products.length < 3) return null
  const [main, ...side] = products
  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>คัดสรร · ประจำฤดูกาล</SectionLabel>
          <h2 className="mt-2 text-2xl font-medium tracking-tight lg:text-3xl">คอลเลกชันธรรมชาติ: ผืนป่าและหมึกดำ</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted">
          คัดสรรเครื่องเขียนที่ผลิตจากวัสดุธรรมชาติ ใช้งานได้จริง และสวยงามเมื่อวางบนโต๊ะทำงานของคุณ
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="zoom flex flex-col gap-4 border border-line/60 bg-white p-4 sm:p-6 lg:col-span-2">
          <Link href={`/products/${main.slug}`} className="block">
            <ProductThumb name={main.name} src={main.image_url} sizes="(min-width: 1024px) 60vw, 100vw" className="aspect-4/3! text-5xl" />
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-cedar">สินค้าแนะนำ</p>
              <Link href={`/products/${main.slug}`} className="mt-1 block text-xl font-medium hover:underline hover:underline-offset-4">{main.name}</Link>
              <p className="mt-1 tabular-nums text-ink-soft">{formatPrice(main.price)}</p>
            </div>
            <QuickAdd productId={main.id} stock={main.stock} name={main.name} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6">
          {side.map((p) => (
            <div key={p.id} className="zoom border border-line/60 bg-white p-4">
              <Link href={`/products/${p.slug}`} className="block">
                <ProductThumb name={p.name} src={p.image_url} sizes="(min-width: 1024px) 30vw, 50vw" className="aspect-4/3! text-4xl" />
              </Link>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/products/${p.slug}`} className="line-clamp-2 font-medium hover:underline hover:underline-offset-4">{p.name}</Link>
                  <p className="mt-1 text-sm tabular-nums text-ink-soft">{formatPrice(p.price)}</p>
                </div>
                <Link href={`/products/${p.slug}`} className="inline-flex min-h-11 shrink-0 items-center rounded border border-ink-soft px-4 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-surface-mid">
                  ดูสินค้า
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const features = [
  { icon: CheckIcon, title: 'วัสดุธรรมชาติ', body: 'กระดาษ ไม้ และโลหะ คัดวัสดุที่รู้สึกถึงเนื้อแท้ เพื่องานเขียนที่ลื่นไหล' },
  { icon: PencilIcon, title: 'ออกแบบเรียบง่าย', body: 'ตัดสิ่งที่ไม่จำเป็นออก เหลือเพียงรูปทรงที่ใช้งานได้จริงในทุกวัน' },
  { icon: ClockIcon, title: 'อยู่กับคุณได้นาน', body: 'ทนทาน ซ่อมและเติมได้ ใช้ได้นานโดยไม่ต้องซื้อซ้ำ' },
]

function Craft() {
  return (
    <section id="craft" className="grid scroll-mt-28 items-center gap-8 bg-surface-low py-16 lg:grid-cols-2 lg:gap-16 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12">
      <div className="relative aspect-4/5 overflow-hidden rounded-sm">
        <Image
          src="/img/craftsman.jpg"
          alt="ช่างทำกระดาษชาวญี่ปุ่นกำลังตักเยื่อกระดาษในบ่อน้ำ"
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
        <p className="absolute inset-x-3 bottom-3 rounded bg-surface/95 p-3 text-xs leading-5 text-muted backdrop-blur sm:right-auto sm:max-w-xs">
          <span className="block font-semibold uppercase tracking-[0.1em] text-ink-soft">WASHI CRAFT</span>
          งานกระดาษวาชิที่ทำด้วยมือแบบดั้งเดิม
        </p>
      </div>
      <div>
        <SectionLabel>PHILOSOPHY · ปรัชญาเบื้องหลังการออกแบบ</SectionLabel>
        <h2 className="mt-2 text-2xl font-medium leading-snug tracking-tight lg:text-3xl">
          เราเลือกที่จะตัดสิ่งที่ไม่จำเป็น
          <br />
          เพื่อให้เหลือเพียงเนื้อแท้ของความคิด
        </h2>
        <p className="mt-5 max-w-lg leading-7 text-muted">
          ที่ Kokoro เราเชื่อว่าเครื่องเขียนที่ดีควรทำให้ทุกการจดบันทึกเป็นเรื่องที่น่ายินดี
          จึงเลือกวัสดุอย่างพิถีพิถัน และออกแบบให้เรียบง่ายพอจะอยู่บนโต๊ะทำงานได้ทุกวัน
        </p>
        <Stagger className="mt-8 grid gap-3 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title} className="bg-white p-4">
              <Icon className="size-5 text-cedar" />
              <p className="mt-3 text-sm font-medium">{title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{body}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <Link href="/about" className={`${textLink} mt-6`}>อ่านเรื่องราวของเรา <ArrowRightIcon className="ml-1 size-4" /></Link>
      </div>
    </section>
  )
}

// ข้อมูลตัวอย่าง (ยังไม่มีระบบรีวิวใน DB) ใช้สลับเรียงตามลำดับสินค้า
const sampleRatings = [
  { score: 4.9, count: 128 },
  { score: 5.0, count: 342 },
  { score: 4.8, count: 205 },
  { score: 4.9, count: 164 },
]

const Star = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden className={className}>
    <path d="m10 1.5 2.5 5.3 5.8.8-4.2 4.1 1 5.8L10 14.7l-5.1 2.8 1-5.8L1.7 7.6l5.8-.8z" />
  </svg>
)

async function BestSellers() {
  const [categories, all] = await Promise.all([getCategories(), allProducts()])
  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  const products = all.filter((p) => p.stock > 0).slice(0, 4)

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionLabel>สินค้าขายดี · BEST SELLERS</SectionLabel>
          <h2 className="mt-2 text-2xl font-medium tracking-tight lg:text-3xl">เครื่องเขียนที่ได้รับความไว้วางใจสูงสุด</h2>
        </div>
        <nav aria-label="กรองตามหมวดหมู่" className="flex flex-wrap gap-2">
          <span aria-current="page" className="inline-flex min-h-11 items-center rounded-full bg-ink-soft px-5 text-sm font-medium text-surface">ทั้งหมด</span>
          {categories.slice(0, 3).map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="inline-flex min-h-11 items-center rounded-full bg-surface-mid px-5 text-sm font-medium text-ink-soft transition-colors duration-150 hover:bg-surface-high"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-6">
        {products.map((p, i) => {
          const r = sampleRatings[i % sampleRatings.length]
          return (
            <StaggerItem lift key={p.id} className="zoom flex flex-col border border-line/60 bg-white">
              <Link href={`/products/${p.slug}`} className="block">
                <ProductThumb name={p.name} src={p.image_url} className="rounded-none text-4xl" />
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <p className="flex items-center gap-1 text-xs text-quiet">
                  <Star className="size-3.5 text-cedar" />
                  <span className="tabular-nums">{r.score.toFixed(1)} ({r.count} รีวิว)</span>
                </p>
                <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-quiet">
                  {(p.category_id !== null && categoryName.get(p.category_id)) || 'เครื่องเขียน'}
                </p>
                <Link href={`/products/${p.slug}`} className="mt-1 line-clamp-2 min-h-12 font-medium leading-6 hover:underline hover:underline-offset-4">{p.name}</Link>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="tabular-nums text-ink-soft">{formatPrice(p.price)}</span>
                  <QuickAdd productId={p.id} stock={p.stock} name={p.name} />
                </div>
              </div>
            </StaggerItem>
          )
        })}
      </Stagger>
    </>
  )
}

// รีวิวตัวอย่างสำหรับพอร์ตโฟลิโอ ไม่ใช่ลูกค้าจริง
const reviews = [
  { name: 'พลอย ว.', role: 'นักเรียนออกแบบ', quote: 'ปากกาหมึกซึมเขียนลื่นมาก กระดาษสมุดรับหมึกได้ดีไม่ซึมทะลุ ใช้ทุกวันแล้วโต๊ะทำงานดูสงบขึ้นจริง ๆ' },
  { name: 'มยุรา ก.', role: 'Calligrapher', quote: 'กระดาษสมุดโน้ตเนื้อละเอียด ไม่ติดปากกา ชอบวัสดุไม้กับทองเหลืองที่จับแล้วรู้สึกถึงคุณภาพ' },
  { name: 'ณฤดล ช.', role: 'Creative Director', quote: 'ดีไซน์เรียบแต่ใส่ใจรายละเอียด ซื้อเป็นของขวัญให้ทีมแล้วทุกคนชอบ แพ็กเกจก็สวยมาก' },
]

function Testimonials() {
  return (
    <section className="-mx-4 bg-surface-low px-4 py-16 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12">
      <div className="mb-10 text-center">
        <SectionLabel className="justify-center">เสียงจากผู้ใช้</SectionLabel>
        <h2 className="mt-2 text-2xl font-medium tracking-tight lg:text-3xl">เสียงสะท้อนจากคนรักเครื่องเขียน</h2>
      </div>
      <Stagger className="grid gap-4 md:grid-cols-3 lg:gap-6">
        {reviews.map((r) => (
          <StaggerItem lift key={r.name} className="flex flex-col bg-white p-6">
            <p role="img" aria-label="5 ดาวเต็ม" className="flex gap-0.5 text-cedar">
              {Array.from({ length: 5 }, (_, i) => <Star key={i} className="size-4" />)}
            </p>
            <blockquote className="mt-4 flex-1 text-sm leading-6 text-muted">“{r.quote}”</blockquote>
            <div className="mt-5 flex items-center gap-3">
              <span aria-hidden className="flex size-10 items-center justify-center rounded-full bg-kraft text-sm font-medium text-cedar">{r.name.charAt(0)}</span>
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                <p className="text-xs text-quiet">{r.role}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
