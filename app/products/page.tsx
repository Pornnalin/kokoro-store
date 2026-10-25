import { Suspense, ViewTransition } from 'react'
import type { Metadata } from 'next'
import Form from 'next/form'
import Link from 'next/link'
import { getCategories, searchProducts, type Sort } from '@/lib/products'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'
import { GridIcon, ListIcon, SlidersIcon } from '../icons'
import { ProductThumb } from '../product-thumb'
import { CatalogSkeleton } from '../skeletons'
import { btn } from '../ui'
import { FilterPanel } from './filter-panel'
import { QuickAdd } from './quick-add'
import { SortSelect } from './sort-select'

export const metadata: Metadata = { title: 'สินค้าทั้งหมด · KOKORO' }

const SORTS: Record<Sort, string> = {
  newest: 'สินค้าล่าสุด',
  price_asc: 'ราคา: ต่ำ-สูง',
  price_desc: 'ราคา: สูง-ต่ำ',
}

type State = {
  category: string | null
  q: string | null
  min: string | null
  max: string | null
  sort: Sort
  view: 'grid' | 'list'
  inStock: boolean
}

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)

// ราคาที่กรอกเป็นบาท -> สตางค์ ค่าที่ไม่ใช่ตัวเลข/ติดลบ/ใหญ่เกินถือว่าไม่กรอก
function toSatang(v: string | null) {
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 && n <= 1_000_000 ? Math.round(n * 100) : null
}

function parse(sp: Record<string, string | string[] | undefined>): State {
  const sort = first(sp.sort)
  return {
    category: first(sp.category) || null,
    q: first(sp.q)?.trim().slice(0, 80) || null,
    min: first(sp.min) || null,
    max: first(sp.max) || null,
    sort: sort === 'price_asc' || sort === 'price_desc' ? sort : 'newest',
    view: first(sp.view) === 'list' ? 'list' : 'grid',
    inStock: first(sp.stock) === '1',
  }
}

function href(s: State, o: Partial<State> = {}) {
  const n = { ...s, ...o }
  const p = new URLSearchParams()
  if (n.category) p.set('category', n.category)
  if (n.q) p.set('q', n.q)
  if (n.min) p.set('min', n.min)
  if (n.max) p.set('max', n.max)
  if (n.sort !== 'newest') p.set('sort', n.sort)
  if (n.view === 'list') p.set('view', 'list')
  if (n.inStock) p.set('stock', '1')
  const qs = p.toString()
  return `/products${qs ? `?${qs}` : ''}`
}

export default function ProductsPage({ searchParams }: PageProps<'/products'>) {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <Suspense fallback={<CatalogSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </ViewTransition>
  )
}

async function Catalog({ searchParams }: Pick<PageProps<'/products'>, 'searchParams'>) {
  const s = parse(await searchParams)
  const [categories, all] = await Promise.all([
    getCategories(),
    searchProducts({ q: s.q, min: toSatang(s.min), max: toSatang(s.max), inStock: s.inStock, sort: s.sort }),
  ])

  const active = categories.find((c) => c.slug === s.category) ?? null
  const products = s.category ? all.filter((p) => p.category_id === active?.id) : all
  const countOf = (id: number) => all.filter((p) => p.category_id === id).length
  const categoryName = new Map(categories.map((c) => [c.id, c.name]))
  const activeCount = [s.category, s.q, s.min || s.max, s.inStock].filter(Boolean).length

  const rowClass = (selected: boolean) =>
    `flex min-h-11 items-center justify-between rounded px-3 text-sm transition-colors duration-150 ${
      selected ? 'bg-surface-mid font-medium text-ink' : 'text-muted hover:bg-surface-low hover:text-ink'
    }`

  return (
    <div className="-mt-8">
      <div className="-mx-4 bg-surface-low/70 px-4 py-10 sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12">
        <div className="flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <nav aria-label="เส้นทาง" className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              <Link href="/" className="hover:text-ink">หน้าแรก</Link>
              <span aria-hidden className="text-muted/40">/</span>
              <Link href="/products" className={active ? 'hover:text-ink' : 'font-medium text-ink'}>สินค้าทั้งหมด</Link>
              {active && (
                <>
                  <span aria-hidden className="text-muted/40">/</span>
                  <span className="font-medium text-ink">{active.name}</span>
                </>
              )}
            </nav>
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-3xl font-medium tracking-tight lg:text-4xl">
                สินค้าทั้งหมด{' '}
                <span className="ml-1 text-lg font-normal text-muted">(ALL PRODUCTS)</span>
              </h1>
            </div>
            <p className="mt-2 text-sm tracking-wide text-muted">
              ความเรียบง่ายที่ตอบโจทย์ทุกการใช้งาน ออกแบบจากเนื้อแท้ของวัตถุดิบ
            </p>
          </div>
          <div aria-hidden className="hidden select-none items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Ecology &amp; Craft</p>
              <p className="text-sm font-medium text-cedar">สัมผัสเนื้อแท้แห่งธรรมชาติ</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 py-8 lg:flex-row lg:gap-8">
        <FilterPanel activeCount={activeCount}>
          <div className="flex items-center justify-between border-b border-ink-soft/10 pb-3">
            <h2 className="hidden items-center gap-2 font-medium lg:flex">
              <SlidersIcon className="size-4" /> ตัวกรองสินค้า
            </h2>
            {activeCount > 0 && (
              <Link scroll={false} href={href(s, { category: null, q: null, min: null, max: null, inStock: false })} className="ml-auto inline-flex min-h-11 items-center text-xs text-muted underline underline-offset-2 hover:text-ink">
                ล้างทั้งหมด
              </Link>
            )}
          </div>

          <Form action="/products" scroll={false} className="space-y-4">
            {s.category && <input type="hidden" name="category" value={s.category} />}
            {s.sort !== 'newest' && <input type="hidden" name="sort" value={s.sort} />}
            {s.view === 'list' && <input type="hidden" name="view" value="list" />}
            {s.inStock && <input type="hidden" name="stock" value="1" />}
            <div>
              <label htmlFor="q" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">ค้นหาสินค้า</label>
              <input id="q" name="q" type="search" defaultValue={s.q ?? ''} maxLength={80} placeholder="ชื่อสินค้า..."
                className="min-h-11 w-full rounded border border-ink-soft/15 bg-surface-low px-3 text-sm placeholder:text-quiet/60 focus:border-ink-soft" />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">ช่วงราคา (บาท)</p>
              <div className="flex items-center gap-2">
                <input name="min" type="number" inputMode="numeric" min={0} defaultValue={s.min ?? ''} placeholder="ต่ำสุด" aria-label="ราคาต่ำสุด (บาท)"
                  className="min-h-11 w-full min-w-0 rounded border border-ink-soft/15 bg-surface-low px-3 text-center text-sm focus:border-ink-soft" />
                <span aria-hidden className="text-muted">—</span>
                <input name="max" type="number" inputMode="numeric" min={0} defaultValue={s.max ?? ''} placeholder="สูงสุด" aria-label="ราคาสูงสุด (บาท)"
                  className="min-h-11 w-full min-w-0 rounded border border-ink-soft/15 bg-surface-low px-3 text-center text-sm focus:border-ink-soft" />
              </div>
            </div>
            <button type="submit" className={`${btn.secondary} w-full`}>นำตัวกรองไปใช้</button>
          </Form>

          <div>
            <h2 className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">
              หมวดหมู่ <span className="font-normal text-muted">({categories.length})</span>
            </h2>
            <ul>
              <li>
                <Link scroll={false} href={href(s, { category: null })} aria-current={!s.category ? 'page' : undefined} className={rowClass(!s.category)}>
                  <span>ทั้งหมด</span>
                  <span className="text-xs text-muted tabular-nums">{all.length}</span>
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link scroll={false} href={href(s, { category: c.slug })} aria-current={s.category === c.slug ? 'page' : undefined} className={rowClass(s.category === c.slug)}>
                    <span>{c.name}</span>
                    <span className="text-xs text-muted tabular-nums">{countOf(c.id)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </FilterPanel>

        <div className="w-full min-w-0 flex-1 space-y-6">
          <div className="flex flex-col items-center justify-between gap-3 border border-line/60 bg-white p-3 sm:flex-row">
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <span className="mr-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">คัดสรร:</span>
              <Link
                scroll={false}
                href={href(s, { inStock: !s.inStock })}
                aria-pressed={s.inStock}
                className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition-colors duration-150 ${
                  s.inStock ? 'bg-ink-soft text-surface' : 'bg-surface-mid text-ink-soft hover:bg-surface-high'
                }`}
              >
                มีสินค้าในสต็อก
              </Link>
            </div>
            <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
              <SortSelect
                current={s.sort}
                options={(Object.keys(SORTS) as Sort[]).map((value) => ({ value, label: SORTS[value], href: href(s, { sort: value }) }))}
              />
              <div className="flex items-center rounded bg-surface-low p-0.5" role="group" aria-label="มุมมองสินค้า">
                {(['grid', 'list'] as const).map((v) => (
                  <Link
                    scroll={false}
                    key={v}
                    href={href(s, { view: v })}
                    aria-label={v === 'grid' ? 'มุมมองตาราง' : 'มุมมองรายการ'}
                    aria-current={s.view === v ? 'true' : undefined}
                    className={`inline-flex size-10 items-center justify-center rounded transition-colors duration-150 ${
                      s.view === v ? 'bg-white text-ink' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {v === 'grid' ? <GridIcon className="size-4" /> : <ListIcon className="size-4" />}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <ul aria-label="ตัวกรองที่ใช้อยู่" className="flex flex-wrap items-center gap-2">
              {[
                active && { key: 'category', label: active.name, to: href(s, { category: null }) },
                s.q && { key: 'q', label: `ค้นหา: ${s.q}`, to: href(s, { q: null }) },
                (s.min || s.max) && { key: 'price', label: `ราคา ${s.min ?? '0'}–${s.max ?? 'ขึ้นไป'} บาท`, to: href(s, { min: null, max: null }) },
                s.inStock && { key: 'stock', label: 'มีสินค้าในสต็อก', to: href(s, { inStock: false }) },
              ].flatMap((c) => (c ? [c] : [])).map((c) => (
                <li key={c.key}>
                  <Link scroll={false} href={c.to} aria-label={`ล้างตัวกรอง ${c.label}`} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-mid px-4 text-sm text-ink-soft transition-colors duration-150 hover:bg-surface-high">
                    {c.label}
                    <span aria-hidden className="text-quiet">✕</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {products.length === 0 ? (
            <div className="border border-dashed border-line bg-surface-low px-6 py-16 text-center">
              <p className="text-lg font-medium">ไม่พบสินค้าที่ตรงกับตัวกรอง</p>
              <p className="mt-1 text-muted">ลองปรับคำค้นหา ช่วงราคา หรือเลือกหมวดอื่น</p>
              <Link scroll={false} href="/products" className={`${btn.primary} mt-6`}>ล้างตัวกรองทั้งหมด</Link>
            </div>
          ) : (
            <ViewTransition key={href(s)} enter="auto" exit="auto" default="none">
            <ul className={s.view === 'grid' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-6' : 'space-y-4'}>
              {products.map((p) => (
                <li key={p.id}>
                  <ProductCard p={p} category={(p.category_id !== null && categoryName.get(p.category_id)) || 'เครื่องเขียน'} view={s.view} />
                </li>
              ))}
            </ul>
            </ViewTransition>
          )}
        </div>
      </div>
    </div>
  )
}

function ProductCard({ p, category, view }: { p: Product; category: string; view: 'grid' | 'list' }) {
  const list = view === 'list'
  const badge = p.stock === 0 ? { text: 'สินค้าหมด', cls: 'bg-ink-soft' } : p.stock <= 5 ? { text: `เหลือ ${p.stock} ชิ้น`, cls: 'bg-cinnabar' } : null

  return (
    <article className={`group zoom flex overflow-hidden border border-line/60 bg-white transition-[transform,box-shadow,border-color] duration-200 hover:border-ink-soft/30 motion-safe:hover:-translate-y-1 hover:shadow-[0_8px_24px_rgb(23_23_21/0.08)] ${list ? 'flex-row' : 'h-full flex-col'}`}>
      <Link href={`/products/${p.slug}`} transitionTypes={['nav-forward']} className={`relative block shrink-0 ${list ? 'w-32 sm:w-48' : 'w-full'}`} tabIndex={-1} aria-hidden>
        <ViewTransition name={`product-${p.id}`} share={{ 'nav-forward': 'morph', default: 'none' }} default="none">
          <ProductThumb
            name={p.name}
            src={p.image_url}
            sizes={list ? '192px' : '(min-width: 1280px) 28vw, (min-width: 640px) 40vw, 100vw'}
            className={`h-full rounded-none text-4xl ${p.stock === 0 ? 'opacity-50' : ''} ${list ? '!aspect-auto min-h-32' : ''}`}
          />
        </ViewTransition>
        {badge && (
          <span className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white ${badge.cls}`}>{badge.text}</span>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-4">
        <div>
          <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-quiet">{category}</p>
          <h3 className="line-clamp-2 min-h-12 text-base font-medium leading-6">
            <Link href={`/products/${p.slug}`} transitionTypes={['nav-forward']} className="hover:text-cedar">{p.name}</Link>
          </h3>
        </div>
        <div className={`flex items-center justify-between gap-3 border-t border-ink-soft/5 pt-3 ${list ? 'flex-wrap' : ''}`}>
          <span className="text-xl font-medium tabular-nums">{formatPrice(p.price)}</span>
          <QuickAdd productId={p.id} stock={p.stock} name={p.name} />
        </div>
      </div>
    </article>
  )
}
