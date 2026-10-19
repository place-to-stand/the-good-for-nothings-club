import type { Metadata } from 'next'
import { Suspense } from 'react'

import PageShell from '@/components/PageShell'
import CollectionBrowser from '@/components/shop/CollectionBrowser'
import { shopCopy } from '@/data/shop'
import { searchProducts } from '@/lib/shopify'

export const metadata: Metadata = {
  title: 'Search the Shop',
  robots: { index: false, follow: true },
  alternates: { canonical: '/shop/search' },
}

/** Results come from Shopify's search, so Search & Discovery settings apply. */
export default function ShopSearch(props: PageProps<'/shop/search'>) {
  return (
    <PageShell title={shopCopy.search.title}>
      <Suspense
        fallback={
          <p className='py-12 text-center font-serif text-2xl'>
            {shopCopy.search.searching}
          </p>
        }
      >
        <Results searchParams={props.searchParams} />
      </Suspense>
    </PageShell>
  )
}

async function Results({
  searchParams,
}: Pick<PageProps<'/shop/search'>, 'searchParams'>) {
  const { q } = await searchParams
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? ''

  if (!query) {
    return (
      <p className='py-12 text-center font-serif text-2xl'>
        {shopCopy.search.empty}
      </p>
    )
  }

  const products = await searchProducts(query)

  return (
    <>
      <p className='pt-4 font-sans text-sm font-semibold tracking-[0.06em] uppercase'>
        {products.length} {products.length === 1 ? 'result' : 'results'} for “
        {query}”
      </p>
      {products.length ? (
        <CollectionBrowser products={products} />
      ) : (
        <p className='py-12 text-center font-serif text-2xl'>
          {shopCopy.search.noResults}
        </p>
      )}
    </>
  )
}
