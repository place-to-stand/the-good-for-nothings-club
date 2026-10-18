#!/usr/bin/env node
/**
 * Minimal Shopify Storefront API stand-in so the /shop pages can build and
 * run offline (local checks, screenshots). Answers the queries in
 * lib/shopify/queries.ts by operation name, with a handful of products
 * shaped like the real store. Carts live in memory. Images point at photos
 * in /public so next/image can serve them.
 *
 * Usage (alongside scripts/convex-stub.mjs):
 *   node scripts/shopify-stub.mjs &
 *   SHOPIFY_STORE_DOMAIN=http://127.0.0.1:3998 npx next build
 */
import http from 'node:http'

const usd = amount => ({ amount, currencyCode: 'USD' })
const img = (name, alt = null) => ({
  url: `/facilities/${name}.jpg`,
  altText: alt,
  width: 1200,
  height: 800,
})
const edges = list => ({ edges: list.map(node => ({ node })) })

function product({ handle, title, type, price, sizes, soldOut = [], pics }) {
  const variants = (sizes ?? ['Default Title']).map((size, i) => ({
    id: `gid://shopify/ProductVariant/${handle}-${i}`,
    title: size,
    availableForSale: !soldOut.includes(size),
    selectedOptions: [{ name: sizes ? 'Size' : 'Title', value: size }],
    price: usd(price),
    compareAtPrice: null,
    image: null,
  }))
  const images = pics.map(p => img(p, title))
  return {
    id: `gid://shopify/Product/${handle}`,
    handle,
    title,
    productType: type,
    availableForSale: variants.some(v => v.availableForSale),
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    priceRange: { minVariantPrice: usd(price), maxVariantPrice: usd(price) },
    compareAtPriceRange: { minVariantPrice: usd('0.0') },
    featuredImage: images[0],
    images: edges(images.slice(0, 2)),
    allImages: edges(images),
    description: `${title}, from the club.`,
    descriptionHtml: `<p>${title}, from the club.</p><ul><li>100% cotton</li><li>Printed in Austin</li></ul>`,
    vendor: 'The Good for Nothings Club',
    tags: [],
    seo: { title: null, description: null },
    options: [
      {
        id: `${handle}-opt`,
        name: sizes ? 'Size' : 'Title',
        optionValues: (sizes ?? ['Default Title']).map(name => ({ name })),
      },
    ],
    variants: edges(variants),
  }
}

const products = [
  product({
    handle: 'so-many-cults-monster-t-shirt',
    title: 'So Many Cults Monster T-shirt',
    type: 'T-Shirt',
    price: '29.0',
    sizes: ['S', 'M', 'L', 'XL'],
    soldOut: ['XL'],
    pics: ['band-room', 'recording-studio'],
  }),
  product({
    handle: 'gfnc-skull-t-shirt-dark',
    title: 'GFNC Skull T-shirt - Dark',
    type: 'T-Shirt',
    price: '29.0',
    sizes: ['S', 'M', 'L'],
    pics: ['photo-studio', 'permanent-desk'],
  }),
  product({
    handle: 'plead-the-fifth-volume-02-issue-05',
    title: '"Plead the Fifth" - Volume 02 | Issue 05',
    type: 'Zine',
    price: '15.0',
    pics: ['online-store'],
  }),
  product({
    handle: 'gfnc-block-letters-dad-hat-light',
    title: 'GFNC Block Letters Dad Hat - Light',
    type: 'Hat',
    price: '25.0',
    pics: ['permanent-desk'],
  }),
  product({
    handle: 'headless-witches',
    title: '"Headless Witches" 35mm Halloween Print',
    type: 'Print',
    price: '20.0',
    soldOut: ['Default Title'],
    pics: ['photo-studio'],
  }),
]

const collection = (handle, title, list, description = '') => ({
  id: `gid://shopify/Collection/${handle}`,
  handle,
  title,
  description,
  descriptionHtml: description,
  updatedAt: '2026-10-01T00:00:00Z',
  image: img(
    list[0].allImages.edges[0].node.url.split('/').pop().replace('.jpg', ''),
    title
  ),
  seo: { title: null, description: null },
  products: edges(list),
})

const collections = [
  collection('bestsellers', 'Bestsellers', products.slice(0, 4)),
  collection(
    'so-many-cults',
    'So Many Cults',
    [products[0]],
    'Merch from Austin band So Many Cults.'
  ),
  collection(
    'the-good-for-nothings-club',
    'The Good for Nothings Club',
    [products[1], products[3]],
    'Official merch for the Good for Nothings Club'
  ),
  collection('limo-zine', 'LIMO zine', [products[2]]),
  collection('chris-donahue-photo', 'Chris Donahue Photo', [products[4]]),
]

const variants = new Map(
  products.flatMap(p =>
    p.variants.edges.map(({ node }) => [node.id, { variant: node, product: p }])
  )
)
const carts = new Map()

function cartView(id) {
  const lines = carts.get(id)
  if (!lines) return null
  const view = lines.map(line => {
    const { variant, product: p } = variants.get(line.merchandiseId)
    return {
      id: line.id,
      quantity: line.quantity,
      cost: {
        totalAmount: usd(String(Number(variant.price.amount) * line.quantity)),
      },
      merchandise: {
        id: variant.id,
        title: variant.title,
        selectedOptions: variant.selectedOptions,
        image: null,
        product: {
          handle: p.handle,
          title: p.title,
          featuredImage: p.featuredImage,
        },
      },
    }
  })
  const total = usd(
    String(view.reduce((s, l) => s + Number(l.cost.totalAmount.amount), 0))
  )
  return {
    id,
    checkoutUrl: 'https://shop.thegoodfornothings.club/cart/c/stub',
    totalQuantity: lines.reduce((s, l) => s + l.quantity, 0),
    cost: { subtotalAmount: total, totalAmount: total },
    lines: edges(view),
  }
}

function addLines(id, lines) {
  const current = carts.get(id)
  for (const line of lines) {
    const existing = current.find(l => l.merchandiseId === line.merchandiseId)
    if (existing) existing.quantity += line.quantity
    else
      current.push({
        id: `line-${Math.random().toString(36).slice(2)}`,
        ...line,
      })
  }
}

const payload = id => ({ cart: cartView(id), userErrors: [] })

const answers = {
  getCollections: () => ({
    collections: edges(collections.map(c => ({ ...c, products: undefined }))),
  }),
  getCollection: v => ({
    collection: collections.find(c => c.handle === v.handle) ?? null,
  }),
  getProducts: () => ({ products: edges(products) }),
  getProduct: v => ({
    product: products.find(p => p.handle === v.handle) ?? null,
  }),
  getProductRecommendations: v => ({
    productRecommendations:
      v.intent === 'RELATED'
        ? products.filter(p => p.id !== v.productId).slice(0, 4)
        : [],
  }),
  searchProducts: v => {
    const hits = products.filter(p =>
      p.title.toLowerCase().includes(v.query.toLowerCase())
    )
    return { search: { totalCount: hits.length, ...edges(hits) } }
  },
  getCart: v => ({ cart: cartView(v.cartId) }),
  createCart: v => {
    const id = `gid://shopify/Cart/stub-${Date.now()}`
    carts.set(id, [])
    addLines(id, v.lines ?? [])
    return { cartCreate: payload(id) }
  },
  addToCart: v => {
    addLines(v.cartId, v.lines)
    return { cartLinesAdd: payload(v.cartId) }
  },
  updateCart: v => {
    for (const update of v.lines) {
      const line = carts.get(v.cartId).find(l => l.id === update.id)
      if (line) line.quantity = update.quantity
    }
    return { cartLinesUpdate: payload(v.cartId) }
  },
  removeFromCart: v => {
    carts.set(
      v.cartId,
      carts.get(v.cartId).filter(l => !v.lineIds.includes(l.id))
    )
    return { cartLinesRemove: payload(v.cartId) }
  },
}

http
  .createServer((req, res) => {
    let body = ''
    req.on('data', c => (body += c))
    req.on('end', () => {
      const { query = '', variables = {} } = JSON.parse(body || '{}')
      const name = query.match(/(?:query|mutation)\s+(\w+)/)?.[1]
      const fn = answers[name]
      console.log('shopify stub', name)
      res.setHeader('content-type', 'application/json')
      res.end(
        JSON.stringify(
          fn
            ? { data: fn(variables) }
            : { errors: [{ message: `stub: unknown ${name}` }] }
        )
      )
    })
  })
  .listen(3998, () => console.log('shopify stub on :3998'))
