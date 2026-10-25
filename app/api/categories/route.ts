import { getCategories } from '@/lib/products'

export async function GET() {
  return Response.json(await getCategories())
}
