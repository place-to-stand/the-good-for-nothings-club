import { cacheLife, cacheTag } from 'next/cache'

import {
  addToCartMutation,
  createCartMutation,
  getCartQuery,
  getCollectionQuery,
  getCollectionsQuery,
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
  removeFromCartMutation,
  searchProductsQuery,
  updateCartMutation,
} from './queries'
import type {
  Cart,
  Collection,
  CollectionWithProducts,
  Product,
  ProductCard,
  ShopImage,
} from './types'

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
  connection?.edges.map(edge => edge.node) ?? []

type RawProductCard = Omit<ProductCard, 'images'> & {
  images: Connection<ShopImage>
}

type RawProduct = Omit<Product, 'images' | 'variants'> & {
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
  }
}

function reshapeProduct(raw: RawProduct): Product {
  return {
    ...reshapeCard(raw),
    description: raw.description,
    descriptionHtml: raw.descriptionHtml,
    vendor: raw.vendor,
    tags: raw.tags,
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

/** Every collection, A to Z. Empty when Shopify isn't configured. */
export async function getCollections(): Promise<Collection[]> {
  'use cache'
  cached()
  if (!isShopifyConfigured()) return []
  const data = await shopifyFetch<{ collections: Connection<Collection> }>({
    query: getCollectionsQuery,
  })
  return nodes(data.collections)
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
      description: 'Everything in the shop, newest first.',
      descriptionHtml: '',
      image: null,
      seo: { title: null, description: null },
      updatedAt: new Date().toISOString(),
      products: await getProducts(),
    }
  }

  const data = await shopifyFetch<{
    collection: (Collection & { products: Connection<RawProductCard> }) | null
  }>({ query: getCollectionQuery, variables: { handle } })

  if (!data.collection) return null
  return {
    ...data.collection,
    products: nodes(data.collection.products).map(reshapeCard),
  }
}

/** Every product, newest first. */
export async function getProducts(): Promise<ProductCard[]> {
  'use cache'
  cached()
  if (!isShopifyConfigured()) return []
  const data = await shopifyFetch<{ products: Connection<RawProductCard> }>({
    query: getProductsQuery,
    variables: { sortKey: 'CREATED_AT', reverse: true },
  })
  return nodes(data.products).map(reshapeCard)
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
  const data = await shopifyFetch<{
    search: Connection<RawProductCard | Record<string, never>>
  }>({ query: searchProductsQuery, variables: { query } })
  return nodes(data.search)
    .filter((node): node is RawProductCard => 'handle' in node)
    .map(reshapeCard)
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
