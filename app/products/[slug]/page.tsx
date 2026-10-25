import { Suspense, ViewTransition } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/products'
import { formatPrice } from '@/lib/format'
import { ProductThumb } from '../../product-thumb'
import { ProductDetailSkeleton } from '../../skeletons'
import { SectionLabel } from '../../ui'
import { AddToCart } from './add-to-cart'

export default function ProductPage({ params }: PageProps<'/products/[slug]'>) {
  return (
    <ViewTransition enter="auto" exit="auto" default="none">
      <nav aria-label="เส้นทาง" className="flex items-center gap-2 text-sm text-quiet">
        <Link href="/" className="inline-flex min-h-11 items-center hover:text-ink">หน้าแรก</Link>
        <span aria-hidden>/</span>
        <Link href="/#products" className="inline-flex min-h-11 items-center hover:text-ink">สินค้าทั้งหมด</Link>
      </nav>
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </ViewTransition>
  )
}

async function ProductDetail({ params }: Pick<PageProps<'/products/[slug]'>, 'params'>) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  const inStock = product.stock > 0

  return (
    <div className="mt-2 grid gap-10 md:grid-cols-2 lg:gap-16">
      <ViewTransition name={`product-${product.id}`} share={{ 'nav-forward': 'morph', default: 'none' }} default="none">
        <ProductThumb name={product.name} src={product.image_url} sizes="(min-width: 768px) 50vw, 100vw" eager className="border border-line/60 text-8xl" />
      </ViewTransition>
      <div>
        <SectionLabel>{`SKU: ${product.sku}`}</SectionLabel>
        <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight">{product.name}</h1>
        <p className="mt-5 text-3xl tabular-nums text-ink-soft">{formatPrice(product.price)}</p>
        <p className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
          inStock ? 'bg-moss-soft text-moss' : 'bg-cinnabar-soft text-cinnabar'
        }`}>
          <span aria-hidden className={`size-2 rounded-full ${inStock ? 'bg-moss' : 'bg-cinnabar'}`} />
          {inStock ? `มีสินค้า เหลือ ${product.stock} ชิ้น` : 'สินค้าหมด'}
        </p>
        <AddToCart productId={product.id} stock={product.stock} />
      </div>
    </div>
  )
}
