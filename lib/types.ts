export type Category = {
  id: number
  slug: string
  name: string
}

export type Product = {
  id: number
  slug: string
  sku: string
  name: string
  price: number
  image_url: string | null
  stock: number
  category_id: number | null
}

export type CartItem = {
  product_id: number
  slug: string
  name: string
  price: number
  image_url: string | null
  stock: number
  quantity: number
}

export type Cart = {
  items: CartItem[]
  total: number
}
