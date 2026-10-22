import { cacheLife, cacheTag } from 'next/cache'

import {
  addToCartMutation,
  createCartMutation,
  getCartQuery,
  getCollectionFilterIdsQuery,
  getCollectionQuery,
  getCollectionsQuery,
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
  getShopPoliciesQuery,
  predictiveSearchQuery,
  removeFromCartMutation,
  searchProductsQuery,
  updateCartMutation,
} from './queries'
import type {
  Cart,
  Collection,
  CollectionWithProducts,
  PredictiveResults,
  Product,
  ProductCard,
  ShopFilter,
  ShopImage,
} from './types'
import { readFilters, type RawFilter } from './filters'
import { htmlToText } from './format'

/**
 * Shopify Storefront API client for the shop pages (/shop).
 *
 * The catalog lives in Shopify; this site only reads it. Checkout stays on
 * Shopify: the cart's checkoutUrl sends buyers to Shopify's own checkout,
 * so Printful, Up The Wall, Flow, Bundles and the rest keep working there.
 *
 * Env:
 *   SHOPIFY_STORE_DOMAIN               e.g. good-for-nothings.myshopify.com
 *   SHOPIFY_STOREFRONT_ACCESS_TOKEN    public token from the Headless app.
 *     Optional: without it the API runs tokenless, which covers products,
 *     collections, search and cart but caps each query's cost.
 */

export const SHOPIFY_TAG = 'shopify'
export const API_VERSION = '2026-10'

/** Synthetic collection handle that lists every product, like Shopify's /collections/all. */
export const ALL_PRODUCTS_HANDLE = 'all'

export function isShopifyConfigured() {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN)
}

function endpoint() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN!.replace(/\/+$/, '')
  // A full URL is allowed so scripts/shopify-stub.mjs can stand in locally.
  const origin = /^https?:\/\//.test(domain) ? domain : `https://${domain}`
  return `${origin}/api/${API_VERSION}/graphql.json`
}

type ShopifyError = { message: string }

export async function shopifyFetch<T>({
  query,
  variables,
  buyerIp,
}: {
  query: string
  variables?: Record<string, unknown>
  /** Shopify asks for the buyer's IP on server-side cart calls (bot checks). */
  buyerIp?: string | null
}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN
  if (token) headers['X-Shopify-Storefront-Access-Token'] = token
  if (buyerIp) headers['Shopify-Storefront-Buyer-IP'] = buyerIp

  const res = await fetch(endpoint(), {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  })

  const body = (await res.json().catch(() => null)) as {
    data?: T
    errors?: ShopifyError[]
  } | null

  if (!res.ok || !body || body.errors?.length) {
    const detail =
      body?.errors?.map(e => e.message).join('; ') ?? `HTTP ${res.status}`
    throw new Error(`Shopify Storefront API: ${detail}`)
  }

  return body.data as T
}

type Connection<T> = { edges: { node: T }[] }

const nodes = <T>(connection: Connection<T> | null | undefined): T[] =>
  connection?.edges?.map(edge => edge.node) ?? []

type Page<T> = Connection<T> & {
  pageInfo?: { hasNextPage: boolean; endCursor: string | null }
}

/** Safety stop so a cursor bug can't loop forever (20 × 100 = 2,000 items). */
const MAX_PAGES = 20

/**
 * Every node across a paginated connection. Takes the first page (callers
 * fetch it themselves so they keep its other fields) and fetches the rest
 * with `next(cursor)` until Shopify says there are no more.
 */
async function allNodes<T>(
  first: Page<T> | null | undefined,
  next: (after: string) => Promise<Page<T> | null | undefined>
): Promise<T[]> {
  const items = nodes(first)
  let page = first
  for (let i = 1; i < MAX_PAGES; i++) {
    const cursor = page?.pageInfo?.hasNextPage && page.pageInfo.endCursor
    if (!cursor) break
    page = await next(cursor)
    items.push(...nodes(page))
  }
  return items
}

type RawProductCard = Omit<ProductCard, 'images' | 'quickVariants'> & {
  images: Connection<ShopImage>
  quickVariants?: Connection<ProductCard['quickVariants'][number]>
}

type RawProduct = Omit<Product, 'images' | 'variants' | 'quickVariants'> & {
  quickVariants?: Connection<ProductCard['quickVariants'][number]>
  images: Connection<ShopImage>
  allImages: Connection<ShopImage>
  variants: Connection<Product['variants'][number]>
}

function reshapeCard(raw: RawProductCard): ProductCard {
  return {
    id: raw.id,
    handle: raw.handle,
    title: raw.title,
    productType: raw.productType,
    availableForSale: raw.availableForSale,
    createdAt: raw.createdAt,
    priceRange: raw.priceRange,
    compareAtPriceRange: raw.compareAtPriceRange,
    featuredImage: raw.featuredImage,
    images: nodes(raw.images),
    vendor: raw.vendor ?? '',
    tags: raw.tags ?? [],
    quickVariants: nodes(raw.quickVariants),
  }
}

function reshapeProduct(raw: RawProduct): Product {
  return {
    ...reshapeCard(raw),
    description: htmlToText(raw.descriptionHtml ?? '') || raw.description,
    descriptionHtml: raw.descriptionHtml,
    updatedAt: raw.updatedAt,
    seo: raw.seo,
    options: raw.options,
    images: nodes(raw.allImages),
    variants: nodes(raw.variants),
  }
}

/**
 * Catalog reads are cached and shared by every visitor. The 'minutes'
 * profile refreshes them about once a minute, so price, stock and new
 * products show up without a deploy or a webhook.
 */
function cached() {
  cacheLife('minutes')
  cacheTag(SHOPIFY_TAG)
}

export type ShopPolicy = { title: string; body: string }
export type ShopPolicies = Partial<
  Record<
    'refundPolicy' | 'shippingPolicy' | 'privacyPolicy' | 'termsOfService',
    ShopPolicy | null
  >
>

/** Store policies from Settings > Policies. Empty when Shopify isn't configured. */
export async function getShopPolicies(): Promise<ShopPolicies> {
  'use cache'
  cached()
  if (!isShopifyConfigured()) return {}
  const data = await shopifyFetch<{ shop: ShopPolicies }>({
    query: getShopPoliciesQuery,
  })
  return data.shop
}

/** Every collection, A to Z. Empty when Shopify isn't configured. */
export async function getCollections(): Promise<Collection[]> {
  'use cache'
  cached()
  if (!isShopifyConfigured()) return []
  const page = (after?: string) =>
    shopifyFetch<{ collections: Page<Collection> }>({
      query: getCollectionsQuery,
      variables: { after },
    }).then(data => data.collections)
  return allNodes(await page(), page)
}

/** A collection and its products in the order set in Shopify. */
export async function getCollection(
  handle: string
): Promise<CollectionWithProducts | null> {
  'use cache'
  cached()
  if (!isShopifyConfigured()) return null

  if (handle === ALL_PRODUCTS_HANDLE) {
    return {
      id: ALL_PRODUCTS_HANDLE,
      handle: ALL_PRODUCTS_HANDLE,
      title: 'All Products',
      description: 'Everything in the shop, all in one place.',
      descriptionHtml: '',
      image: null,
      seo: { title: null, description: null },
      updatedAt: new Date().toISOString(),
      products: await getProducts(),
      filters: [],
    }
  }

  const fetchCollection = (after?: string) =>
    shopifyFetch<{
      collection:
        | (Collection & {
            products: Page<RawProductCard> & { filters?: RawFilter[] }
          })
        | null
    }>({ query: getCollectionQuery, variables: { handle, after } })

  const data = await fetchCollection()
  if (!data.collection) return null
  const { products, ...collection } = data.collection
  const allProducts = await allNodes(products, after =>
    fetchCollection(after).then(next => next.collection?.products)
  )
  return {
    ...collection,
    products: allProducts.map(reshapeCard),
    filters: await readFilters(products.filters ?? [], input =>
      collectionIdsMatching(handle, input)
    ),
  }
}

/** Product ids in a collection that match one filter input. */
async function collectionIdsMatching(handle: string, input: unknown) {
  'use cache'
  cached()
  const page = (after?: string) =>
    shopifyFetch<{
      collection: { products: Page<{ id: string }> } | null
    }>({
      query: getCollectionFilterIdsQuery,
      variables: { handle, filters: [input], after },
    }).then(data => data.collection?.products)
  return (await allNodes(await page(), page)).map(p => p.id)
}

export type { ShopFilter }

/** Every product, newest first. */
export async function getProducts(): Promise<ProductCard[]> {
  'use cache'
  cached()
  if (!isShopifyConfigured()) return []
  const page = (after?: string) =>
    shopifyFetch<{ products: Page<RawProductCard> }>({
      query: getProductsQuery,
      variables: { sortKey: 'CREATED_AT', reverse: true, after },
    }).then(data => data.products)
  return (await allNodes(await page(), page)).map(reshapeCard)
}

export async function getProduct(handle: string): Promise<Product | null> {
  'use cache'
  cached()
  if (!isShopifyConfigured()) return null
  const data = await shopifyFetch<{ product: RawProduct | null }>({
    query: getProductQuery,
    variables: { handle },
  })
  return data.product ? reshapeProduct(data.product) : null
}

/**
 * "Goes well with" picks. Complementary products are the ones set by hand
 * in Search & Discovery; when there are none, fall back to Shopify's
 * automatic related products.
 */
export async function getProductRecommendations(
  productId: string
): Promise<{ intent: 'COMPLEMENTARY' | 'RELATED'; products: ProductCard[] }> {
  'use cache'
  cached()
  if (!isShopifyConfigured()) return { intent: 'RELATED', products: [] }

  for (const intent of ['COMPLEMENTARY', 'RELATED'] as const) {
    const data = await shopifyFetch<{
      productRecommendations: RawProductCard[] | null
    }>({
      query: getProductRecommendationsQuery,
      variables: { productId, intent },
    })
    const products = (data.productRecommendations ?? [])
      .map(reshapeCard)
      .slice(0, 4)
    if (products.length) return { intent, products }
  }
  return { intent: 'RELATED', products: [] }
}

/** Shopify search, which honours Search & Discovery synonyms and boosts. */
export async function searchProducts(query: string): Promise<ProductCard[]> {
  'use cache'
  cached()
  if (!isShopifyConfigured() || !query.trim()) return []
  const page = (after?: string) =>
    shopifyFetch<{
      search: Page<RawProductCard | Record<string, never>>
    }>({ query: searchProductsQuery, variables: { query, after } }).then(
      data => data.search
    )
  return (await allNodes(await page(), page))
    .filter((node): node is RawProductCard => 'handle' in node)
    .map(reshapeCard)
}

/**
 * Search-as-you-type suggestions: matching searches, products and
 * collections. Uses Shopify's predictive search, so Search & Discovery
 * synonyms apply here too.
 */
export async function predictiveSearch(
  query: string
): Promise<PredictiveResults> {
  'use cache'
  cached()
  const empty = { queries: [], products: [], collections: [] }
  if (!isShopifyConfigured() || !query.trim()) return empty
  const data = await shopifyFetch<{
    predictiveSearch: {
      queries: { text: string }[]
      products: RawProductCard[]
      collections: PredictiveResults['collections']
    } | null
  }>({ query: predictiveSearchQuery, variables: { query } })
  const result = data.predictiveSearch
  if (!result) return empty
  return {
    queries: result.queries.map(q => q.text),
    products: result.products.map(reshapeCard),
    collections: result.collections,
  }
}

// Cart. Never cached: each cart belongs to one buyer.

type RawCart = Omit<Cart, 'lines'> & {
  lines: Connection<Cart['lines'][number]>
}

const reshapeCart = (raw: RawCart): Cart => ({
  ...raw,
  lines: nodes(raw.lines),
})

type CartPayload = { cart: RawCart | null; userErrors: ShopifyError[] }

function cartFrom(payload: CartPayload): Cart {
  if (payload.userErrors.length || !payload.cart) {
    throw new Error(
      payload.userErrors.map(e => e.message).join('; ') || 'No cart returned'
    )
  }
  return reshapeCart(payload.cart)
}

type Line = { merchandiseId: string; quantity: number }

export async function getCart(
  cartId: string,
  buyerIp?: string | null
): Promise<Cart | null> {
  const data = await shopifyFetch<{ cart: RawCart | null }>({
    query: getCartQuery,
    variables: { cartId },
    buyerIp,
  })
  return data.cart ? reshapeCart(data.cart) : null
}

export async function createCart(lines: Line[], buyerIp?: string | null) {
  const data = await shopifyFetch<{ cartCreate: CartPayload }>({
    query: createCartMutation,
    variables: { lines },
    buyerIp,
  })
  return cartFrom(data.cartCreate)
}

export async function addToCart(
  cartId: string,
  lines: Line[],
  buyerIp?: string | null
) {
  const data = await shopifyFetch<{ cartLinesAdd: CartPayload }>({
    query: addToCartMutation,
    variables: { cartId, lines },
    buyerIp,
  })
  return cartFrom(data.cartLinesAdd)
}

export async function updateCartLine(
  cartId: string,
  line: { id: string; quantity: number },
  buyerIp?: string | null
) {
  const data = await shopifyFetch<{ cartLinesUpdate: CartPayload }>({
    query: updateCartMutation,
    variables: { cartId, lines: [line] },
    buyerIp,
  })
  return cartFrom(data.cartLinesUpdate)
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
  buyerIp?: string | null
) {
  const data = await shopifyFetch<{ cartLinesRemove: CartPayload }>({
    query: removeFromCartMutation,
    variables: { cartId, lineIds: [lineId] },
    buyerIp,
  })
  return cartFrom(data.cartLinesRemove)
}
