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

// Small pages so local runs go through the client's page-following loop.
// The cursor is just the index to start from.
const PAGE_SIZE = 4
const paged = (list, after) => {
  const start = after ? Number(after) : 0
  const end = start + PAGE_SIZE
  return {
    ...edges(list.slice(start, end)),
    pageInfo: {
      hasNextPage: end < list.length,
      endCursor: String(Math.min(end, list.length)),
    },
  }
}

// Copied from the live store so tables and spacing render as they will.
const realDescriptions = {
  'so-many-cults-monster-t-shirt':
    '<ul>\n<li>Comfort Colors styles are garment dyed for that lived in feel and almost no shrinkage at home</li>\n<li>Made with 100% soft ring spun U.S. cotton fabric and cotton threads</li>\n<li>Topstitched, classic width, rib collar</li>\n<li>Relaxed fit, seamless body</li>\n<li>Signature twill label and shoulder to shoulder twill tape</li>\n<li>Proud member of the U.S. Cotton Trust Protocol</li>\n<li>Made with OEKO-TEX certified low-impact dyes</li>\n<li>Clean pigment dye colors are salt free</li>\n<li>Reduce plastic waste by the removal of polybags from all products except color White</li>\n</ul>\n<p><br></p>\n<p><strong class="size-guide-title">Size guide</strong></p>\n<table style="width: 97.7625%; height: 225px;">\n<colgroup>\n<col style="width: 11.9217%;">\n<col style="width: 16.548%;">\n<col style="width: 19.2171%;">\n<col style="width: 51.2456%;">\n</colgroup>\n<thead class="silk-table-thead">\n<tr style="height: 35.5938px;">\n<th class="silk-table-cell" style="width: 9.21739%; height: 35.5938px;">\n<p>Size</p>\n</th>\n<th class="silk-table-cell" style="width: 12.8696%; height: 35.5938px;">\n<p>Width\u00a0(in)</p>\n</th>\n<th class="silk-table-cell" style="width: 14.9565%; height: 35.5938px;">\n<p>Length\u00a0(in)</p>\n</th>\n<th class="silk-table-cell" style="width: 39.6522%; height: 35.5938px;">\n<p>Sleeve center back\u00a0(in)</p>\n</th>\n</tr>\n</thead>\n<tbody class="silk-table-tbody">\n<tr class="silk-table-row silk-table-row-level-0" style="height: 19.5938px;">\n<td class="silk-table-cell" style="width: 9.21739%; height: 19.5938px;">S</td>\n<td class="silk-table-cell" style="width: 12.8696%; height: 19.5938px;">18.25</td>\n<td class="silk-table-cell" style="width: 14.9565%; height: 19.5938px;">26.625</td>\n<td class="silk-table-cell" style="width: 39.6522%; height: 19.5938px;">16.25</td>\n</tr>\n<tr class="silk-table-row silk-table-row-level-0" style="height: 19.5938px;">\n<td class="silk-table-cell" style="width: 9.21739%; height: 19.5938px;">M</td>\n<td class="silk-table-cell" style="width: 12.8696%; height: 19.5938px;">20.25</td>\n<td class="silk-table-cell" style="width: 14.9565%; height: 19.5938px;">28</td>\n<td class="silk-table-cell" style="width: 39.6522%; height: 19.5938px;">17.75</td>\n</tr>\n<tr class="silk-table-row silk-table-row-level-0" style="height: 19.5938px;">\n<td class="silk-table-cell" style="width: 9.21739%; height: 19.5938px;">L</td>\n<td class="silk-table-cell" style="width: 12.8696%; height: 19.5938px;">22</td>\n<td class="silk-table-cell" style="width: 14.9565%; height: 19.5938px;">29.375</td>\n<td class="silk-table-cell" style="width: 39.6522%; height: 19.5938px;">19</td>\n</tr>\n<tr class="silk-table-row silk-table-row-level-0" style="height: 19.5938px;">\n<td class="silk-table-cell" style="width: 9.21739%; height: 19.5938px;">XL</td>\n<td class="silk-table-cell" style="width: 12.8696%; height: 19.5938px;">24</td>\n<td class="silk-table-cell" style="width: 14.9565%; height: 19.5938px;">30.75</td>\n<td class="silk-table-cell" style="width: 39.6522%; height: 19.5938px;">20.5</td>\n</tr>\n<tr class="silk-table-row silk-table-row-level-0" style="height: 19.5938px;">\n<td class="silk-table-cell" style="width: 9.21739%; height: 19.5938px;">2XL</td>\n<td class="silk-table-cell" style="width: 12.8696%; height: 19.5938px;">26</td>\n<td class="silk-table-cell" style="width: 14.9565%; height: 19.5938px;">31.625</td>\n<td class="silk-table-cell" style="width: 39.6522%; height: 19.5938px;">21.75</td>\n</tr>\n<tr class="silk-table-row silk-table-row-level-0" style="height: 19.5938px;">\n<td class="silk-table-cell" style="width: 9.21739%; height: 19.5938px;">3XL</td>\n<td class="silk-table-cell" style="width: 12.8696%; height: 19.5938px;">27.75</td>\n<td class="silk-table-cell" style="width: 14.9565%; height: 19.5938px;">32.5</td>\n<td class="silk-table-cell" style="width: 39.6522%; height: 19.5938px;">23.25</td>\n</tr>\n<tr class="silk-table-row silk-table-row-level-0" style="height: 19.5938px;">\n<td class="silk-table-cell" style="width: 9.21739%; height: 19.5938px;">4XL</td>\n<td class="silk-table-cell" style="width: 12.8696%; height: 19.5938px;">29.75</td>\n<td class="silk-table-cell" style="width: 14.9565%; height: 19.5938px;">33.5</td>\n<td class="silk-table-cell" style="width: 39.6522%; height: 19.5938px;">24.625</td>\n</tr>\n</tbody>\n</table>',
}

// Vendors as on the live store ("Brand" filter).
const vendors = {
  'so-many-cults-monster-t-shirt': 'So many cults',
  'plead-the-fifth-volume-02-issue-05': 'LIMO zine',
  'headless-witches': 'Chris Donahue Photo',
}

function product({
  handle,
  title,
  type,
  price,
  sizes,
  colors,
  soldOut = [],
  pics,
}) {
  // Colour x size when colours are given, like the band tees.
  const combos = (sizes ?? ['Default Title']).flatMap(size =>
    (colors ?? [null]).map(color => ({ size, color }))
  )
  const variants = combos.map(({ size, color }, i) => ({
    id: `gid://shopify/ProductVariant/${handle}-${i}`,
    title: color ? `${color} / ${size}` : size,
    sku: `${handle}-${color ?? ''}-${size}`.toUpperCase(),
    availableForSale: !soldOut.includes(color ? `${color} / ${size}` : size),
    selectedOptions: [
      ...(color ? [{ name: 'Color', value: color }] : []),
      { name: sizes ? 'Size' : 'Title', value: size },
    ],
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
    descriptionHtml:
      realDescriptions[handle] ??
      `<p>${title}, from the club.</p><p>Art by <a href="https://somanycults.com">So Many Cults</a>.</p><ul><li>100% cotton</li><li>Printed in Austin</li></ul><h4>Size guide</h4><table><thead><tr><th></th><th>WIDTH (inches)</th><th>LENGTH (inches)</th></tr></thead><tbody><tr><td><strong>S</strong></td><td>18 ¼</td><td>26 ⅝</td></tr><tr><td><strong>M</strong></td><td>20 ¼</td><td>28</td></tr><tr><td><strong>L</strong></td><td>22</td><td>29 ⅜</td></tr></tbody></table>`,
    vendor: vendors[handle] ?? 'The Good for Nothings Club',
    tags: [],
    seo: { title: null, description: null },
    options: [
      ...(colors
        ? [
            {
              id: `${handle}-color`,
              name: 'Color',
              optionValues: colors.map(name => ({ name })),
            },
          ]
        : []),
      {
        id: `${handle}-opt`,
        name: sizes ? 'Size' : 'Title',
        optionValues: (sizes ?? ['Default Title']).map(name => ({ name })),
      },
    ],
    variants: edges(variants),
    quickVariants: edges(
      variants.map(
        ({ id, title, availableForSale, selectedOptions, price }) => ({
          id,
          title,
          availableForSale,
          selectedOptions,
          price,
        })
      )
    ),
  }
}

const products = [
  product({
    handle: 'so-many-cults-monster-t-shirt',
    title: 'So Many Cults Monster T-shirt',
    type: 'T-Shirt',
    price: '29.0',
    sizes: ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'],
    colors: ['Black', 'Crimson'],
    soldOut: ['Black / XL', 'Crimson / S'],
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

// Shaped like Search & Discovery's filters on the real store.
const stubFilters = [
  {
    id: 'filter.v.availability',
    label: 'Availability',
    type: 'LIST',
    values: [
      {
        id: 'filter.v.availability.1',
        label: 'In stock',
        input: '{"available":true}',
      },
    ],
  },
  {
    id: 'filter.v.price',
    label: 'Price',
    type: 'PRICE_RANGE',
    values: [
      {
        id: 'filter.v.price',
        label: 'Price',
        input: '{"price":{"min":0,"max":29}}',
      },
    ],
  },
  {
    id: 'filter.p.product_type',
    label: 'Product type',
    type: 'LIST',
    values: ['T-Shirt', 'Hat', 'Zine', 'Print'].map(t => ({
      id: `filter.p.product_type.${t}`,
      label: t,
      input: JSON.stringify({ productType: t }),
    })),
  },
  {
    id: 'filter.v.option.size',
    label: 'Size',
    type: 'LIST',
    values: ['S', 'M', 'L', 'XL'].map(v => ({
      id: `filter.v.option.size.${v}`,
      label: v,
      input: JSON.stringify({ variantOption: { name: 'size', value: v } }),
    })),
  },
  {
    id: 'filter.p.m.custom.color',
    label: 'Color',
    type: 'LIST',
    values: [
      {
        id: 'filter.p.m.custom.color.black',
        label: 'Black',
        input:
          '{"productMetafield":{"namespace":"custom","key":"color","value":"Black"}}',
      },
    ],
  },
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
  products: { ...edges(list), filters: stubFilters },
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
  getCollectionFilterIds: () => ({
    // Stub: the black things are the dark tee and the hat.
    collection: {
      products: edges([products[1], products[3]].map(p => ({ id: p.id }))),
    },
  }),
  getCollection: v => {
    const c = collections.find(c => c.handle === v.handle)
    if (!c) return { collection: null }
    const list = c.products.edges.map(e => e.node)
    return {
      collection: {
        ...c,
        products: { ...paged(list, v.after), filters: stubFilters },
      },
    }
  },
  getProducts: v => ({ products: paged(products, v.after) }),
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
  predictiveSearch: v => {
    const q = v.query.toLowerCase()
    return {
      predictiveSearch: {
        queries: [{ text: v.query }],
        products: products
          .filter(p => p.title.toLowerCase().includes(q))
          .slice(0, 5),
        collections: collections
          .filter(c => c.title.toLowerCase().includes(q))
          .map(({ handle, title, image }) => ({ handle, title, image })),
      },
    }
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
