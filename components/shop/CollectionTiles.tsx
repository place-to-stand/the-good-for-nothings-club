import Image from 'next/image'
import Link from 'next/link'

import { shopPaths } from '@/lib/shopify/format'
import type { Collection } from '@/lib/shopify/types'

/** Collection tile: square image, title bar under it. */
export function CollectionTile({ collection }: { collection: Collection }) {
  return (
    <Link
      href={shopPaths.collection(collection.handle)}
      className='group flex w-full flex-col border-2 border-black bg-white hover:no-underline'
    >
      <div className='relative flex aspect-square items-center justify-center overflow-hidden border-b-2 border-black bg-black'>
        {collection.image ? (
          <Image
            src={collection.image.url}
            alt={collection.image.altText ?? collection.title}
            fill
            sizes='(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'
            className='object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <span className='p-4 text-center text-2xl font-black text-white uppercase'>
            {collection.title}
          </span>
        )}
      </div>
      <h3 className='p-3 text-base font-extrabold md:p-4 md:text-lg'>
        <span className='link-line'>{collection.title}</span>
      </h3>
    </Link>
  )
}

/** Collection tiles in a grid. */
export default function CollectionTiles({
  collections,
}: {
  collections: Collection[]
}) {
  return (
    <ul className='grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4'>
      {collections.map(collection => (
        <li key={collection.id} className='flex'>
          <CollectionTile collection={collection} />
        </li>
      ))}
    </ul>
  )
}
