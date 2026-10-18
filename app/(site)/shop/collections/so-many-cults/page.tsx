import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'

import CollectionBrowser from '@/components/shop/CollectionBrowser'
import { getCollection } from '@/lib/shopify'
import { collectionMetadata } from '@/lib/shopify/metadata'

/**
 * Example of a custom collection landing page.
 *
 * Any folder in app/(site)/shop/collections/ named after a Shopify
 * collection handle replaces the standard page (../[handle]) for that one
 * collection. Copy this folder, rename it to the handle (the last part of
 * the collection's URL in Shopify), and design the page however you like.
 * Products, prices and stock still come from Shopify.
 *
 * Delete this folder to put So Many Cults back on the standard page.
 */

const HANDLE = 'so-many-cults'

export const ensureStatic = 'navigation'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const collection = await getCollection(HANDLE)
  if (!collection) notFound()
  return collectionMetadata(collection, parent)
}

export default async function SoManyCultsLanding() {
  const collection = await getCollection(HANDLE)
  if (!collection) notFound()

  return (
    <main>
      {/* Branded hero: glitch type in the site's card. */}
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto flex min-h-[50vh] max-w-(--page-max-width) flex-col items-center justify-center border-y-2 border-black px-4 py-16 text-center md:border-x-2'>
          <p className='text-sm font-bold tracking-[0.2em] uppercase'>
            Official merch
          </p>
          <h1 className='font-sans-glitch mt-4 text-[56px] leading-[0.9] font-normal md:text-[120px]'>
            {collection.title}
          </h1>
          {collection.description && (
            <p className='mt-6 max-w-2xl font-serif text-xl sm:text-2xl'>
              {collection.description}
            </p>
          )}
        </div>
      </section>

      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <CollectionBrowser products={collection.products} />
        </div>
      </section>
    </main>
  )
}
