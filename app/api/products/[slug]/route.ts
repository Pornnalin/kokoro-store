import { getProduct } from '@/lib/products'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }

  return Response.json(product)
}
