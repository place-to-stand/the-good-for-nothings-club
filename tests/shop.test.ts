import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 'use cache' is a no-op string outside Next's compiler; cacheLife and
// cacheTag need the runtime, so stub them (see routes.test.ts).
vi.mock('next/cache', () => ({ cacheLife: () => {}, cacheTag: () => {} }))

import {
  collectionMarkdown,
  productMarkdown,
  shopIndexMarkdown,
} from '@/lib/markdown/shop'
import {
  getCollection,
  getProduct,
  isShopifyConfigured,
  predictiveSearch,
  searchProducts,
} from '@/lib/shopify'
import { compareAtLabel, formatMoney, priceLabel } from '@/lib/shopify/format'
import { clip, productJsonLd } from '@/lib/shopify/metadata'
import type { Product, ProductCard } from '@/lib/shopify/types'

const usd = (amount: string) => ({ amount, currencyCode: 'USD' })
const image = {
  url: 'https://cdn.shopify.com/a.jpg',
  altText: null,
  width: 1,
  height: 1,
}

const card: ProductCard = {
  id: 'gid://shopify/Product/1',
  handle: 'monster-tee',
  title: 'Monster T-shirt',
  productType: 'T-Shirt',
  availableForSale: true,
  createdAt: '2026-01-01T00:00:00Z',
  priceRange: { minVariantPrice: usd('29.0'), maxVariantPrice: usd('29.0') },
  compareAtPriceRange: { minVariantPrice: usd('0.0') },
  featuredImage: image,
  images: [image],
}

const product: Product = {
  ...card,
  description: 'Garment-dyed tee.',
  descriptionHtml: '<p>Garment-dyed tee.</p>',
  vendor: 'So Many Cults',
  tags: [],
  updatedAt: '2026-01-01T00:00:00Z',
  seo: { title: null, description: null },
  options: [
    { id: 'o1', name: 'Size', optionValues: [{ name: 'S' }, { name: 'M' }] },
  ],
  variants: [
    {
      id: 'v1',
      title: 'S',
      availableForSale: true,
      selectedOptions: [{ name: 'Size', value: 'S' }],
      price: usd('29.0'),
      compareAtPrice: null,
      image: null,
    },
    {
      id: 'v2',
      title: 'M',
      availableForSale: false,
      selectedOptions: [{ name: 'Size', value: 'M' }],
      price: usd('29.0'),
      compareAtPrice: null,
      image: null,
    },
  ],
}

describe('price formatting', () => {
  it('drops cents on whole dollars and keeps them otherwise', () => {
    expect(formatMoney(usd('29.0'))).toBe('$29')
    expect(formatMoney(usd('12.5'))).toBe('$12.50')
  })

  it('says "From" when variants differ in price', () => {
    expect(priceLabel(card)).toBe('$29')
    expect(
      priceLabel({
        priceRange: { minVariantPrice: usd('13'), maxVariantPrice: usd('32') },
      })
    ).toBe('From $13')
  })

  it('shows a compare-at price only when it is higher', () => {
    expect(compareAtLabel(card)).toBeNull()
    expect(
      compareAtLabel({
        ...card,
        compareAtPriceRange: { minVariantPrice: usd('35') },
      })
    ).toBe('$35')
  })
})

describe('shop metadata', () => {
  it('clips descriptions at a word, under 158 characters', () => {
    const long = 'word '.repeat(60)
    const out = clip(long)
    expect(out.length).toBeLessThanOrEqual(158)
    expect(out.endsWith('…')).toBe(true)
  })

  it('builds Product JSON-LD with one offer per variant', () => {
    const ld = productJsonLd(product)
    expect(ld.url).toBe(
      'https://thegoodfornothings.club/shop/products/monster-tee'
    )
    expect(ld.offers.map(o => o.availability)).toEqual([
      'https://schema.org/InStock',
      'https://schema.org/OutOfStock',
    ])
  })
})

describe('shop markdown', () => {
  it('lists collections and products with price and stock', () => {
    const md = shopIndexMarkdown(
      [
        {
          id: 'c1',
          handle: 'so-many-cults',
          title: 'So Many Cults',
          description: '',
          descriptionHtml: '',
          image: null,
          seo: { title: null, description: null },
          updatedAt: '2026-01-01T00:00:00Z',
        },
      ],
      [card]
    )
    expect(md.startsWith('# Shop')).toBe(true)
    expect(md).toContain(
      '- [So Many Cults](https://thegoodfornothings.club/shop/collections/so-many-cults)'
    )
    expect(md).toContain(
      '- [Monster T-shirt](https://thegoodfornothings.club/shop/products/monster-tee): $29, in stock'
    )
  })

  it('renders a collection', () => {
    const md = collectionMarkdown({
      id: 'c1',
      handle: 'so-many-cults',
      title: 'So Many Cults',
      description: 'Band merch.',
      descriptionHtml: '',
      image: null,
      seo: { title: null, description: null },
      updatedAt: '2026-01-01T00:00:00Z',
      products: [card],
    })
    expect(md).toContain('> Band merch.')
    expect(md).toContain('## Products (1)')
  })

  it('renders a product with options and per-variant stock', () => {
    const md = productMarkdown(product)
    expect(md).toContain('- **Size:** S, M')
    expect(md).toContain('- M: $29, sold out')
    expect(md).toContain('/shop/products/monster-tee.md')
  })
})

describe('Storefront API client', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', 'gfnc.myshopify.com')
    vi.stubEnv('SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'token')
    fetchMock.mockReset()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  const respond = (data: unknown) =>
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ data }), { status: 200 })
    )

  it('is off without a store domain', async () => {
    vi.stubEnv('SHOPIFY_STORE_DOMAIN', '')
    expect(isShopifyConfigured()).toBe(false)
    expect(await getProduct('x')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('posts to the versioned endpoint with the token and flattens connections', async () => {
    respond({
      product: {
        ...product,
        images: { edges: [{ node: image }] },
        allImages: { edges: [{ node: image }, { node: image }] },
        variants: { edges: product.variants.map(node => ({ node })) },
      },
    })
    const result = await getProduct('monster-tee')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://gfnc.myshopify.com/api/2026-10/graphql.json')
    expect(init.headers['X-Shopify-Storefront-Access-Token']).toBe('token')
    expect(result?.images).toHaveLength(2)
    expect(result?.variants.map(v => v.id)).toEqual(['v1', 'v2'])
  })

  it('throws on GraphQL errors', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ message: 'Throttled' }] }), {
        status: 200,
      })
    )
    await expect(getProduct('x')).rejects.toThrow('Throttled')
  })

  it('serves the synthetic "all" collection from the product list', async () => {
    respond({
      products: { edges: [{ node: { ...card, images: { edges: [] } } }] },
    })
    const all = await getCollection('all')
    expect(all?.title).toBe('All Products')
    expect(all?.products.map(p => p.handle)).toEqual(['monster-tee'])
  })

  it('flattens predictive search and skips blank queries', async () => {
    expect(await predictiveSearch('  ')).toEqual({
      queries: [],
      products: [],
      collections: [],
    })
    expect(fetchMock).not.toHaveBeenCalled()
    respond({
      predictiveSearch: {
        queries: [{ text: 'tee shirt' }],
        products: [{ ...card, images: { edges: [] } }],
        collections: [
          { handle: 'so-many-cults', title: 'So Many Cults', image: null },
        ],
      },
    })
    const result = await predictiveSearch('tee')
    expect(result.queries).toEqual(['tee shirt'])
    expect(result.products.map(p => p.handle)).toEqual(['monster-tee'])
    expect(result.collections[0].handle).toBe('so-many-cults')
  })

  it('keeps only products from search results', async () => {
    respond({
      search: {
        totalCount: 2,
        edges: [{ node: { ...card, images: { edges: [] } } }, { node: {} }],
      },
    })
    expect((await searchProducts('tee')).map(p => p.handle)).toEqual([
      'monster-tee',
    ])
  })
})
