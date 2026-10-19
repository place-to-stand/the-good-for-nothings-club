import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import ShopFallback from '@/components/shop/ShopFallback'
import PageShell from '@/components/PageShell'
import CollectionBrowser from '@/components/shop/CollectionBrowser'
import {
  ALL_PRODUCTS_HANDLE,
  getCollection,
  getCollections,
} from '@/lib/shopify'
import { shopPaths } from '@/lib/shopify/format'
import { breadcrumbJsonLd, collectionMetadata } from '@/lib/shopify/metadata'

/**
 * The standard collection page. A collection that wants its own branded
 * landing page gets a folder next to this one named after its Shopify
 * handle (start from docs/examples/collection-landing-page.tsx); Next
 * serves that folder instead.
 */

export const ensureStatic = 'navigation'

export async function generateStaticParams() {
  const collections = await getCollections().catch(() => [])
  // 'all' is always there, which also keeps this list from being empty
  // (Cache Components needs at least one entry).
  return [
    { handle: ALL_PRODUCTS_HANDLE },
    ...collections.map(c => ({ handle: c.handle })),
  ]
}

type Props = PageProps<'/shop/collections/[handle]'>

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { handle } = await props.params
  const collection = await getCollection(handle)
  if (!collection) notFound()
  return collectionMetadata(collection, parent)
}

export default function CollectionPage(props: Props) {
  return (
    <Suspense fallback={<ShopFallback />}>
      <CollectionContent params={props.params} />
    </Suspense>
  )
}

async function CollectionContent({ params }: Pick<Props, 'params'>) {
  const { handle } = await params
  const collection = await getCollection(handle)
  if (!collection) notFound()

  return (
    <PageShell
      title={collection.title}
      lead={collection.description || undefined}
    >
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              {
                name: collection.title,
                path: shopPaths.collection(collection.handle),
              },
            ])
          ).replace(/</g, '\\u003c'),
        }}
      />
      <CollectionBrowser
        products={collection.products}
        filters={collection.filters}
      />
    </PageShell>
  )
}
