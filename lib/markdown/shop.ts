import { policyPath } from '@/data/policies'
import type { ResolvedPolicy } from '@/lib/policies'
import { SHOP_META, shopCopy } from '@/data/shop'
import { CONTACT_EMAIL } from '@/data/site'
import { formatMoney, priceLabel, shopPaths } from '@/lib/shopify/format'
import type {
  Collection,
  CollectionWithProducts,
  Product,
  ProductCard,
} from '@/lib/shopify/types'

import { abs, pageFooter } from './pages'

/**
 * Markdown views of the shop pages. Pure functions over the same Shopify
 * data the HTML pages get, so agents can read prices and stock without
 * running the page's scripts.
 */

const stock = (p: Pick<ProductCard, 'availableForSale'>) =>
  p.availableForSale ? 'in stock' : 'sold out'

const productLine = (p: ProductCard) =>
  `- [${p.title}](${abs(shopPaths.product(p.handle))}): ${priceLabel(p)}, ${stock(p)}`

export function shopIndexMarkdown(
  collections: Collection[],
  products: ProductCard[]
) {
  return [
    `# ${shopCopy.title}`,
    '',
    `> ${SHOP_META.description}`,
    '',
    `${shopCopy.lead} Checkout runs on Shopify; ask questions at ${CONTACT_EMAIL}.`,
    '',
    `## ${shopCopy.collectionsTitle}`,
    '',
    ...collections.map(
      c =>
        `- [${c.title}](${abs(shopPaths.collection(c.handle))})${c.description ? `: ${c.description}` : ''}`
    ),
    '',
    `## All products (${products.length})`,
    '',
    ...products.map(productLine),
    '',
    pageFooter(shopPaths.home),
  ].join('\n')
}

export function collectionMarkdown(collection: CollectionWithProducts) {
  return [
    `# ${collection.title}`,
    '',
    ...(collection.description ? [`> ${collection.description}`, ''] : []),
    `Part of the [shop](${abs(shopPaths.home)}).`,
    '',
    `## Products (${collection.products.length})`,
    '',
    ...collection.products.map(productLine),
    '',
    pageFooter(shopPaths.collection(collection.handle)),
  ].join('\n')
}

export function productMarkdown(product: Product) {
  const options = product.options.filter(
    o =>
      !(
        o.optionValues.length === 1 &&
        o.optionValues[0].name === 'Default Title'
      )
  )
  const lines = [
    `# ${product.title}`,
    '',
    `> ${priceLabel(product)}, ${stock(product)}.`,
    '',
    product.description,
    '',
  ]
  if (options.length) {
    lines.push(
      '## Options',
      '',
      ...options.map(
        o => `- **${o.name}:** ${o.optionValues.map(v => v.name).join(', ')}`
      ),
      '',
      '## Variants',
      '',
      ...product.variants.map(
        v =>
          `- ${v.title}: ${formatMoney(v.price)}, ${v.availableForSale ? 'in stock' : 'sold out'}`
      ),
      ''
    )
  }
  if (product.images.length) {
    lines.push(
      '## Images',
      '',
      ...product.images.map(
        i => `- ![${i.altText ?? product.title}](${i.url})`
      ),
      ''
    )
  }
  lines.push(
    `To buy, add it to the cart at ${abs(shopPaths.product(product.handle))}; checkout runs on Shopify.`,
    '',
    pageFooter(shopPaths.product(product.handle))
  )
  return lines.join('\n')
}

export function policyMarkdown(policy: ResolvedPolicy) {
  return [
    `# ${policy.title}`,
    '',
    `> ${policy.description}`,
    '',
    ...policy.paragraphs.flatMap(p => [p, '']),
    `Questions? Email ${CONTACT_EMAIL}.`,
    '',
    pageFooter(policyPath(policy.slug)),
    '',
  ].join('\n')
}
