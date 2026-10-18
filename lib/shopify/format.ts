import type { Money, ProductCard } from './types'

/** "$29.00" → "$29", "$12.50" stays "$12.50". */
export function formatMoney({ amount, currencyCode }: Money) {
  const value = Number(amount)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)
}

/** Card price: "$29", or "From $13" when variants differ in price. */
export function priceLabel(product: Pick<ProductCard, 'priceRange'>) {
  const { minVariantPrice, maxVariantPrice } = product.priceRange
  const min = formatMoney(minVariantPrice)
  return Number(maxVariantPrice.amount) > Number(minVariantPrice.amount)
    ? `From ${min}`
    : min
}

/** The struck-out "was" price, only when it's higher than the price. */
export function compareAtLabel(
  product: Pick<ProductCard, 'priceRange' | 'compareAtPriceRange'>
) {
  const compareAt = product.compareAtPriceRange.minVariantPrice
  return Number(compareAt.amount) >
    Number(product.priceRange.minVariantPrice.amount)
    ? formatMoney(compareAt)
    : null
}

/** First-party cookie holding the Shopify cart id (lib/shopify/cartActions). */
export const CART_COOKIE = 'gfnc_cart'

export const shopPaths = {
  home: '/shop',
  all: '/shop/collections/all',
  collection: (handle: string) => `/shop/collections/${handle}`,
  product: (handle: string) => `/shop/products/${handle}`,
  search: (query?: string) =>
    query ? `/shop/search?q=${encodeURIComponent(query)}` : '/shop/search',
}
