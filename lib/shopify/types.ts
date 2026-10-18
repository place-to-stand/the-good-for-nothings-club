/**
 * Storefront API shapes, trimmed to the fields the shop pages read.
 * Connections (`{ edges: [{ node }] }`) are flattened to arrays by
 * lib/shopify/index.ts, so pages never see `edges`.
 */

export type Money = {
  amount: string
  currencyCode: string
}

export type ShopImage = {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export type SEO = {
  title: string | null
  description: string | null
}

export type SelectedOption = {
  name: string
  value: string
}

export type ProductOption = {
  id: string
  name: string
  optionValues: { name: string }[]
}

export type ProductVariant = {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: SelectedOption[]
  price: Money
  compareAtPrice: Money | null
  image: ShopImage | null
}

/** What a product card needs: enough for grids, sorting and filters. */
export type ProductCard = {
  id: string
  handle: string
  title: string
  productType: string
  availableForSale: boolean
  createdAt: string
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money }
  compareAtPriceRange: { minVariantPrice: Money }
  featuredImage: ShopImage | null
  /** First two images: the card swaps to the second on hover. */
  images: ShopImage[]
}

export type Product = ProductCard & {
  description: string
  descriptionHtml: string
  vendor: string
  tags: string[]
  updatedAt: string
  seo: SEO
  options: ProductOption[]
  variants: ProductVariant[]
}

export type Collection = {
  id: string
  handle: string
  title: string
  description: string
  descriptionHtml: string
  image: ShopImage | null
  seo: SEO
  updatedAt: string
}

export type CollectionWithProducts = Collection & {
  products: ProductCard[]
}

export type CartLine = {
  id: string
  quantity: number
  cost: { totalAmount: Money }
  merchandise: {
    id: string
    title: string
    selectedOptions: SelectedOption[]
    image: ShopImage | null
    product: {
      handle: string
      title: string
      featuredImage: ShopImage | null
    }
  }
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: Money
    totalAmount: Money
  }
  lines: CartLine[]
}
