import type { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'

const base = 'https://kokoro-store.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts(null)
  return [
    ...['', '/products', '/about', '/contact'].map((path) => ({ url: `${base}${path}` })),
    ...products.map((p) => ({ url: `${base}/products/${p.slug}` })),
  ]
}
