import { getProducts } from '@/lib/products'

// ?category=<slug> กรองตามหมวด ไม่ส่งมา = ทุกหมวด, slug ที่ไม่มีอยู่ = []
export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get('category')
  return Response.json(await getProducts(category))
}
