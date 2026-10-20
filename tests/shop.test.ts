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
import {
  deriveFilters,
  matches,
  mergeFilters,
  readFilters,
} from '@/lib/shopify/filters'
import {
  brandName,
  breadcrumbJsonLd,
  clip,
  productJsonLd,
} from '@/lib/shopify/metadata'
import { htmlToText } from '@/lib/shopify/format'
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
  vendor: 'So Many Cults',
  tags: [],
  quickVariants: [],
}

const product: Product = {
  ...card,
  description: 'Garment-dyed tee.',
  descriptionHtml: '<p>Garment-dyed tee.</p>',
  updatedAt: '2026-01-01T00:00:00Z',
  seo: { title: null, description: null },
  options: [
    { id: 'o1', name: 'Size', optionValues: [{ name: 'S' }, { name: 'M' }] },
  ],
  variants: [
    {
      id: 'gid://shopify/ProductVariant/11',
      title: 'S',
      sku: 'MONSTER-S',
      availableForSale: true,
      selectedOptions: [{ name: 'Size', value: 'S' }],
      price: usd('29.0'),
      compareAtPrice: null,
      image: null,
    },
    {
      id: 'gid://shopify/ProductVariant/12',
      title: 'M',
      sku: null,
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
    // Each offer links to its variant, as Google Merchant Center does.
    expect(ld.offers[0]).toMatchObject({
      url: 'https://thegoodfornothings.club/shop/products/monster-tee?variant=11',
      sku: 'MONSTER-S',
    })
    expect(ld.offers[1]).not.toHaveProperty('sku')
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
      filters: [],
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
    expect(result?.variants.map(v => v.id)).toEqual([
      'gid://shopify/ProductVariant/11',
      'gid://shopify/ProductVariant/12',
    ])
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

  it('follows pages until Shopify says there are no more', async () => {
    const node = (handle: string) => ({
      node: { ...card, handle, images: { edges: [] } },
    })
    respond({
      products: {
        pageInfo: { hasNextPage: true, endCursor: 'c1' },
        edges: [node('one'), node('two')],
      },
    })
    respond({
      products: {
        pageInfo: { hasNextPage: false, endCursor: 'c2' },
        edges: [node('three')],
      },
    })
    const all = await getCollection('all')
    expect(all?.products.map(p => p.handle)).toEqual(['one', 'two', 'three'])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const second = JSON.parse(fetchMock.mock.calls[1][1].body)
    expect(second.variables.after).toBe('c1')
  })

  it('keeps the first page of a collection for its title and filters', async () => {
    const page = (handle: string, hasNextPage: boolean) => ({
      collection: {
        handle: 'tees',
        title: 'Tees',
        products: {
          pageInfo: { hasNextPage, endCursor: 'c1' },
          filters: [],
          edges: [{ node: { ...card, handle, images: { edges: [] } } }],
        },
      },
    })
    respond(page('one', true))
    respond(page('two', false))
    const tees = await getCollection('tees')
    expect(tees?.title).toBe('Tees')
    expect(tees?.products.map(p => p.handle)).toEqual(['one', 'two'])
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

describe('shop filters', () => {
  const tee = {
    ...card,
    quickVariants: ['S', 'M'].map(size => ({
      id: `v-${size}`,
      title: size,
      availableForSale: true,
      selectedOptions: [{ name: 'Size', value: size }],
      price: usd('29.0'),
    })),
  }
  const hat = { ...card, id: 'hat', productType: 'Hat', vendor: 'GFNC' }

  it('builds type, size and brand filters from products', () => {
    const ids = deriveFilters([tee, hat]).map(f => f.id)
    expect(ids).toEqual([
      'filter.p.product_type',
      'filter.v.option.size',
      'filter.p.vendor',
    ])
  })

  it('matches option values without caring about case', () => {
    expect(matches(tee, { kind: 'option', name: 'size', value: 'm' })).toBe(
      true
    )
    expect(matches(hat, { kind: 'option', name: 'Size', value: 'M' })).toBe(
      false
    )
  })

  it('reads Search & Discovery filters, dropping availability', async () => {
    const filters = await readFilters(
      [
        {
          id: 'filter.v.availability',
          label: 'Availability',
          type: 'LIST',
          values: [],
        },
        {
          id: 'filter.v.option.size',
          label: 'Size',
          type: 'LIST',
          values: [
            {
              id: 'filter.v.option.size.m',
              label: 'M',
              input: '{"variantOption":{"name":"size","value":"M"}}',
            },
          ],
        },
        {
          id: 'filter.p.m.custom.color',
          label: 'Color',
          type: 'LIST',
          values: [
            {
              id: 'filter.p.m.custom.color.black',
              label: 'Black',
              input: '{"productMetafield":{}}',
            },
          ],
        },
      ],
      async () => ['hat']
    )
    expect(filters.map(f => f.id)).toEqual([
      'filter.v.option.size',
      'filter.p.m.custom.color',
    ])
    expect(filters[0].values[0].key).toBe('m')
    expect(filters[1].values[0].match).toEqual({ kind: 'ids', ids: ['hat'] })
  })
})

describe('merging filters', () => {
  it('adds derived filters Shopify left out and keeps one price, last', () => {
    const price = {
      id: 'filter.v.price',
      label: 'Price',
      type: 'PRICE_RANGE' as const,
      values: [],
    }
    const size = {
      id: 'filter.v.option.size',
      label: 'Size',
      type: 'LIST' as const,
      values: [],
    }
    const merged = mergeFilters([price], [size, { ...price }])
    expect(merged.map(f => f.id)).toEqual([
      'filter.v.option.size',
      'filter.v.price',
    ])
  })
})

describe('shop search text', () => {
  it('keeps words apart when Shopify description HTML has block tags', () => {
    expect(
      htmlToText(
        '<p>PRINT SIZE: 8&quot; &times; 12&quot;</p><p>OVERALL SIZE: 10&#8243;</p>'
      )
    ).toBe('PRINT SIZE: 8" × 12" OVERALL SIZE: 10″')
  })

  it('uses the club as the brand for print-on-demand vendors', () => {
    expect(brandName('Up The Wall')).toBe('The Good for Nothings Club')
    expect(brandName('Printful')).toBe('The Good for Nothings Club')
    expect(brandName('')).toBe('The Good for Nothings Club')
    expect(brandName('So Many Cults')).toBe('So Many Cults')
  })

  it('builds breadcrumbs from the shop home', () => {
    const ld = breadcrumbJsonLd([
      { name: 'Monster T-shirt', path: '/shop/products/monster-tee' },
    ])
    expect(ld.itemListElement).toEqual([
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Shop',
        item: 'https://thegoodfornothings.club/shop',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Monster T-shirt',
        item: 'https://thegoodfornothings.club/shop/products/monster-tee',
      },
    ])
  })
})
