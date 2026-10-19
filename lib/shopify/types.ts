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
  vendor: string
  tags: string[]
  /** Just enough of each variant for quick add and the size filters. */
  quickVariants: QuickVariant[]
}

export type QuickVariant = {
  id: string
  title: string
  availableForSale: boolean
  selectedOptions: SelectedOption[]
}

/**
 * A filter group from Search & Discovery (or built from the products when
 * there is none), e.g. Size with S, M and L. The browser does the
 * filtering, so each value says how to match a product.
 */
export type ShopFilter = {
  /** Shopify's filter id, e.g. filter.v.option.size. Used in the URL. */
  id: string
  label: string
  type: 'LIST' | 'PRICE_RANGE'
  values: ShopFilterValue[]
}

export type ShopFilterValue = {
  /** Short key for the URL, e.g. "m" in filter.v.option.size=m. */
  key: string
  label: string
  match: FilterMatch
}

export type FilterMatch =
  | { kind: 'type'; value: string }
  | { kind: 'vendor'; value: string }
  | { kind: 'tag'; value: string }
  | { kind: 'option'; name: string; value: string }
  /** Anything else (metafields, categories): the products Shopify says match. */
  | { kind: 'ids'; ids: string[] }
  | { kind: 'none' }

export type Product = ProductCard & {
  description: string
  descriptionHtml: string
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
  /** Search & Discovery filters; empty when the store has none set. */
  filters: ShopFilter[]
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

/** Search-as-you-type results for the shop bar's search box. */
export type PredictiveResults = {
  queries: string[]
  products: ProductCard[]
  collections: { handle: string; title: string; image: ShopImage | null }[]
}
