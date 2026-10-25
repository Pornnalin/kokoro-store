import type { MetadataRoute } from 'next'

const base = 'https://nextjs-store-tan.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/cart', '/checkout'] },
    sitemap: `${base}/sitemap.xml`,
  }
}
