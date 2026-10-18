import type { ReactNode } from 'react'

import ShopBar from '@/components/shop/ShopBar'
import { HIDDEN_COLLECTION_TILES } from '@/data/shop'
import { getCollections } from '@/lib/shopify'

/** Shop pages get a second header row with collection links and search. */
export default async function ShopLayout({
  children,
}: {
  children: ReactNode
}) {
  // A Shopify outage shouldn't take the shop pages down with it: the bar
  // just shows fewer links.
  const collections = await getCollections().catch(error => {
    console.error('shop layout: collections failed', error)
    return []
  })

  return (
    <>
      <ShopBar
        collections={collections
          .filter(c => !HIDDEN_COLLECTION_TILES.includes(c.handle))
          .map(({ handle, title }) => ({ handle, title }))}
      />
      {children}
    </>
  )
}
