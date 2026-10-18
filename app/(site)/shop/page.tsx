import type { Metadata, ResolvingMetadata } from 'next'
import Link from 'next/link'

import PageShell, { PageShellSection } from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import CollectionTiles from '@/components/shop/CollectionTiles'
import { ProductGrid } from '@/components/shop/ProductCard'
import ShopOffline from '@/components/shop/ShopOffline'
import { Button } from '@/components/ui/Button'
import { HIDDEN_COLLECTION_TILES, SHOP_META, shopCopy } from '@/data/shop'
import {
  getCollection,
  getCollections,
  getProducts,
  isShopifyConfigured,
} from '@/lib/shopify'
import { shopPaths } from '@/lib/shopify/format'

export const ensureStatic = 'navigation'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  return {
    title: SHOP_META.searchTitle,
    description: SHOP_META.description,
    alternates: { canonical: shopPaths.home },
    openGraph: { ...openGraph, url: shopPaths.home },
  }
}

export default async function ShopHome() {
  if (!isShopifyConfigured()) {
    return (
      <PageShell title={shopCopy.title} lead={shopCopy.lead}>
        <ShopOffline />
      </PageShell>
    )
  }

  const [featured, collections] = await Promise.all([
    getCollection(shopCopy.featuredCollection),
    getCollections(),
  ])
  // No bestsellers collection? Show the newest products instead.
  const products = (
    featured?.products.length ? featured.products : await getProducts()
  ).slice(0, 8)

  return (
    <PageShell
      title={shopCopy.title}
      lead={shopCopy.lead}
      after={
        <PageShellSection>
          <SectionHeading
            title={shopCopy.collectionsTitle}
            className='mt-0 md:mt-0'
          />
          <div className='mt-6'>
            <CollectionTiles
              collections={collections.filter(
                c => !HIDDEN_COLLECTION_TILES.includes(c.handle)
              )}
            />
          </div>
        </PageShellSection>
      }
    >
      <p className='text-center font-sans text-sm font-semibold tracking-[0.06em] uppercase'>
        {shopCopy.sublead}
      </p>
      <SectionHeading
        title={featured?.products.length ? shopCopy.featuredTitle : 'New'}
        className='mt-8 md:mt-12'
      />
      <ProductGrid products={products} className='mt-6' />
      <div className='mt-10 flex justify-center'>
        <Button asChild size='lg'>
          <Link href={shopPaths.all}>{shopCopy.shopAll}</Link>
        </Button>
      </div>
    </PageShell>
  )
}
