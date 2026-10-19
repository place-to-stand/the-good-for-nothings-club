import type { Metadata, ResolvingMetadata } from 'next'

import { SITE_NAME, SITE_URL, TITLE_SUFFIX } from '@/data/site'

import { shopPaths } from './format'
import type { Collection, Product } from './types'

/** Search titles stay ≤ 60 characters with the suffix, like every other page. */
function fitTitle(title: string) {
  return title.length + TITLE_SUFFIX.length <= 60 ? title : { absolute: title }
}

/** Trim to a meta description: ≤ 158 characters, cut at a word. */
export function clip(text: string, max = 158) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…'
}

export async function collectionMetadata(
  collection: Collection,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const url = shopPaths.collection(collection.handle)
  return {
    title: fitTitle(collection.seo.title ?? collection.title),
    description: clip(
      collection.seo.description ||
        collection.description ||
        `${collection.title} at the ${SITE_NAME} shop.`
    ),
    alternates: { canonical: url },
    openGraph: {
      ...openGraph,
      url,
      ...(collection.image && { images: [collection.image.url] }),
    },
  }
}

export async function productMetadata(
  product: Product,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const url = shopPaths.product(product.handle)
  return {
    title: fitTitle(product.seo.title ?? product.title),
    description: clip(product.seo.description || product.description),
    alternates: { canonical: url },
    openGraph: {
      ...openGraph,
      url,
      ...(product.featuredImage && { images: [product.featuredImage.url] }),
    },
  }
}

/**
 * schema.org Product with one Offer per variant, for Google's product
 * results and AI shopping answers.
 */
export function productJsonLd(product: Product) {
  const url = `${SITE_URL}${shopPaths.product(product.handle)}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    url,
    image: product.images.map(image => image.url),
    brand: { '@type': 'Brand', name: product.vendor || SITE_NAME },
    offers: product.variants.map(variant => ({
      '@type': 'Offer',
      name: variant.title === 'Default Title' ? product.title : variant.title,
      // Google Merchant Center links each variant this way.
      url: `${url}?variant=${variant.id.split('/').pop()}`,
      ...(variant.sku && { sku: variant.sku }),
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      availability: variant.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@id': `${SITE_URL}/#organization` },
    })),
  }
}
