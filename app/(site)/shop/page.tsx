import type { Metadata, ResolvingMetadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import PageShell, { PageShellSection } from '@/components/PageShell'
import Carousel from '@/components/shop/Carousel'
import { CollectionTile } from '@/components/shop/CollectionTiles'
import ProductCard from '@/components/shop/ProductCard'
import ShopOffline from '@/components/shop/ShopOffline'
import { Button } from '@/components/ui/Button'
import { HIDDEN_COLLECTION_TILES, SHOP_META, shopCopy } from '@/data/shop'
import {
  getCollection,
  getCollections,
  getProduct,
  getProducts,
  isShopifyConfigured,
} from '@/lib/shopify'
import { priceLabel, shopPaths } from '@/lib/shopify/format'
import type { Product } from '@/lib/shopify/types'

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

  const [featured, collections, newest] = await Promise.all([
    getCollection(shopCopy.featuredCollection),
    getCollections(),
    getProducts(),
  ])
  // The newest thing in stock gets the spotlight.
  const spotlightCard = newest.find(p => p.availableForSale) ?? newest[0]
  const spotlight = spotlightCard
    ? await getProduct(spotlightCard.handle)
    : null
  const bestsellers = featured?.products ?? []
  const arrivals = newest
    .filter(p => p.handle !== spotlight?.handle)
    .slice(0, 12)
  const tiles = collections.filter(
    c => !HIDDEN_COLLECTION_TILES.includes(c.handle)
  )

  return (
    <PageShell
      title={shopCopy.title}
      lead={shopCopy.lead}
      after={
        tiles.length > 0 && (
          <PageShellSection>
            <Carousel title={shopCopy.collectionsTitle}>
              {tiles.map(c => (
                <CollectionTile key={c.id} collection={c} />
              ))}
            </Carousel>
          </PageShellSection>
        )
      }
    >
      <p className='text-center font-sans text-sm font-semibold tracking-[0.06em] uppercase'>
        {shopCopy.sublead}
      </p>

      {spotlight && <Spotlight product={spotlight} />}

      {bestsellers.length > 0 && (
        <Carousel
          title={shopCopy.featuredTitle}
          link={{
            href: shopPaths.collection(shopCopy.featuredCollection),
            text: shopCopy.seeAll,
          }}
          className='mt-14 md:mt-20'
        >
          {bestsellers.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Carousel>
      )}

      {arrivals.length > 0 && (
        <Carousel
          title={shopCopy.newTitle}
          link={{ href: shopPaths.all, text: shopCopy.seeAll }}
          className='mt-14 md:mt-20'
        >
          {arrivals.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Carousel>
      )}

      <div className='mt-12 flex justify-center'>
        <Button asChild size='lg'>
          <Link href={shopPaths.all}>{shopCopy.shopAll}</Link>
        </Button>
      </div>
    </PageShell>
  )
}

/** The newest product, big: photo, name, price and a way in. */
function Spotlight({ product }: { product: Product }) {
  const image = product.images[0] ?? product.featuredImage
  const href = shopPaths.product(product.handle)

  return (
    <section className='mt-8 grid items-center gap-6 md:mt-12 md:grid-cols-2 md:gap-12'>
      <Link
        href={href}
        className='group relative block aspect-square overflow-hidden border-2 border-black bg-white'
      >
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? product.title}
            fill
            priority
            sizes='(min-width: 768px) 45vw, 100vw'
            className='object-cover transition-transform duration-700 ease-out group-hover:scale-105'
          />
        )}
      </Link>
      <div>
        <p className='inline-block bg-black px-2 py-1 text-xs font-bold tracking-[0.1em] text-white uppercase'>
          {shopCopy.justDropped}
        </p>
        <h2 className='mt-4 text-[36px] font-black tracking-[-0.04em] md:text-[56px]'>
          <Link href={href}>{product.title}</Link>
        </h2>
        <p className='mt-3 text-xl font-bold'>{priceLabel(product)}</p>
        {product.description && (
          <p className='mt-4 line-clamp-4 max-w-prose font-sans leading-snug'>
            {product.description}
          </p>
        )}
        <Button asChild size='lg' className='mt-6'>
          <Link href={href}>{shopCopy.shopIt}</Link>
        </Button>
      </div>
    </section>
  )
}
