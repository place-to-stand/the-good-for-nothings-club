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

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  times: '×',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
  deg: '°',
  reg: '®',
  copy: '©',
  trade: '™',
}

/**
 * Plain text from Shopify's description HTML. Shopify's own `description`
 * field glues block elements together ("sidesOVERALL SIZE"), so tags become
 * spaces here before they're stripped.
 */
export function htmlToText(html: string) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? match
      const n =
        code[1] === 'x' || code[1] === 'X'
          ? parseInt(code.slice(2), 16)
          : parseInt(code.slice(1), 10)
      return Number.isFinite(n) ? String.fromCodePoint(n) : match
    })
    .replace(/\s+/g, ' ')
    .trim()
}
