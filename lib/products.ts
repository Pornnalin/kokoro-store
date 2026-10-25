import { sql } from '@/lib/db'
import type { Category, Product } from '@/lib/types'

// ใช้ร่วมกันทั้ง API route และหน้าเว็บ (server component)

// category = slug, null = ทุกหมวด, slug ที่ไม่มีอยู่ = []
export async function getProducts(category: string | null) {
  return (await sql`
    select p.id, p.slug, p.sku, p.name, p.price, p.image_url, p.stock, p.category_id
    from products p
    left join categories c on c.id = p.category_id
    where ${category}::text is null or c.slug = ${category}
    order by p.id
  `) as Product[]
}

export async function getProduct(slug: string) {
  const [product] = (await sql`
    select id, slug, sku, name, price, image_url, stock, category_id
    from products
    where slug = ${slug}
  `) as Product[]
  return product ?? null
}

export async function getCategories() {
  return (await sql`
    select id, slug, name
    from categories
    order by array_position(array['notebooks', 'fountain-pens', 'gel-pens', 'organizers', 'planners', 'accessories'], slug), name
  `) as Category[]
}

export type Sort = 'newest' | 'price_asc' | 'price_desc'

// หน้า /products: ค้นชื่อ ช่วงราคา (สตางค์) เฉพาะที่มีสต็อก และเรียงลำดับ กรองหมวดทำฝั่งหน้าเว็บเพื่อนับจำนวนต่อหมวดได้
export async function searchProducts(f: {
  q: string | null
  min: number | null
  max: number | null
  inStock: boolean
  sort: Sort
}) {
  const like = f.q ? `%${f.q.replace(/[\\%_]/g, '\\$&')}%` : null
  return (await sql`
    select id, slug, sku, name, price, image_url, stock, category_id
    from products
    where (${like}::text is null or name ilike ${like})
      and (${f.min}::int is null or price >= ${f.min})
      and (${f.max}::int is null or price <= ${f.max})
      and (not ${f.inStock}::boolean or stock > 0)
    order by
      case when ${f.sort}::text = 'price_asc' then price end asc,
      case when ${f.sort}::text = 'price_desc' then price end desc,
      id desc
  `) as Product[]
}
