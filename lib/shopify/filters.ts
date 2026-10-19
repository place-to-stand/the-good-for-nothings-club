import type {
  FilterMatch,
  ProductCard,
  ShopFilter,
  ShopFilterValue,
} from './types'

/**
 * Shop filters. Search & Discovery decides which filters a collection
 * shows (Size, Colour, Product type...); the browser then filters the
 * collection's products itself, so the page stays static and quick.
 * Safe to import from client components.
 */

/** A filter as the Storefront API returns it. */
export type RawFilter = {
  id: string
  label: string
  type: string
  values: { id: string; label: string; input: string }[]
}

/** Availability has its own "In stock" checkbox, so it's left out here. */
const AVAILABILITY = /availability$/

const lower = (s: string) => s.trim().toLowerCase()

const slug = (s: string) =>
  lower(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** "filter.v.option.size.m" under "filter.v.option.size" becomes "m". */
const keyOf = (filterId: string, valueId: string, label: string) =>
  valueId.startsWith(`${filterId}.`)
    ? valueId.slice(filterId.length + 1)
    : slug(label)

function matchOf(input: Record<string, unknown>): FilterMatch | null {
  if (typeof input.productType === 'string')
    return { kind: 'type', value: input.productType }
  if (typeof input.productVendor === 'string')
    return { kind: 'vendor', value: input.productVendor }
  if (typeof input.tag === 'string') return { kind: 'tag', value: input.tag }
  const option = input.variantOption as
    { name?: string; value?: string } | undefined
  if (option?.name && option.value)
    return { kind: 'option', name: option.name, value: option.value }
  return null
}

/**
 * Turns Search & Discovery's filters into ones the browser can apply.
 * Simple kinds (type, vendor, tag, option) match on product fields; the
 * rest (metafields, categories) ask Shopify once which products match.
 */
export async function readFilters(
  raw: RawFilter[],
  idsMatching: (input: unknown) => Promise<string[]>
): Promise<ShopFilter[]> {
  const filters = await Promise.all(
    raw
      .filter(f => !AVAILABILITY.test(f.id) && f.type !== 'BOOLEAN')
      .map(async (f): Promise<ShopFilter> => {
        if (f.type === 'PRICE_RANGE')
          return { id: f.id, label: f.label, type: 'PRICE_RANGE', values: [] }
        const values = await Promise.all(
          f.values.map(async (v): Promise<ShopFilterValue> => {
            let input: Record<string, unknown> = {}
            try {
              input = JSON.parse(v.input)
            } catch {}
            const match: FilterMatch = matchOf(input) ?? {
              kind: 'ids',
              ids: await idsMatching(input).catch(() => []),
            }
            return { key: keyOf(f.id, v.id, v.label), label: v.label, match }
          })
        )
        return { id: f.id, label: f.label, type: 'LIST', values }
      })
  )
  return filters
}

/**
 * Filters built from the products themselves, for lists Search &
 * Discovery doesn't cover (all products, search results): product type,
 * each option such as Size, maker when there's more than one, and price.
 */
export function deriveFilters(products: ProductCard[]): ShopFilter[] {
  const list = (
    id: string,
    label: string,
    entries: [string, FilterMatch][]
  ): ShopFilter => ({
    id,
    label,
    type: 'LIST',
    values: entries.map(([value, match]) => ({
      key: slug(value),
      label: value,
      match,
    })),
  })
  const unique = (xs: string[]) => [...new Set(xs.filter(Boolean))]

  const types = unique(products.map(p => p.productType)).sort()
  const vendors = unique(products.map(p => p.vendor)).sort()
  const optionNames = unique(
    products.flatMap(p =>
      p.quickVariants.flatMap(v => v.selectedOptions.map(o => o.name))
    )
  ).filter(name => name !== 'Title')

  const filters: ShopFilter[] = [
    list(
      'filter.p.product_type',
      'Product type',
      types.map(t => [t, { kind: 'type', value: t }])
    ),
    ...optionNames.map(name => {
      // Keep the shop's own order (S, M, L), not A to Z.
      const values = unique(
        products.flatMap(p =>
          p.quickVariants.flatMap(v =>
            v.selectedOptions.filter(o => o.name === name).map(o => o.value)
          )
        )
      )
      return list(
        `filter.v.option.${slug(name)}`,
        name,
        values.map(value => [value, { kind: 'option', name, value }])
      )
    }),
    list(
      'filter.p.vendor',
      'Brand',
      vendors.map(v => [v, { kind: 'vendor', value: v }])
    ),
  ].filter(f => f.values.length > 1)

  const prices = products.map(p => Number(p.priceRange.minVariantPrice.amount))
  if (new Set(prices).size > 1)
    filters.push({
      id: 'filter.v.price',
      label: 'Price',
      type: 'PRICE_RANGE',
      values: [],
    })
  return filters
}

export function matches(product: ProductCard, match: FilterMatch) {
  switch (match.kind) {
    case 'type':
      return lower(product.productType) === lower(match.value)
    case 'vendor':
      return lower(product.vendor) === lower(match.value)
    case 'tag':
      return product.tags.some(t => lower(t) === lower(match.value))
    case 'option':
      return product.quickVariants.some(v =>
        v.selectedOptions.some(
          o =>
            lower(o.name) === lower(match.name) &&
            lower(o.value) === lower(match.value)
        )
      )
    case 'ids':
      return match.ids.includes(product.id)
    default:
      return false
  }
}
