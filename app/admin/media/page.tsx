'use client'

import { Authenticated, useQuery, usePaginatedQuery } from 'convex/react'
import Image from 'next/image'

import LoadMore from '@/components/admin/LoadMore'
import { api } from '@/convex/_generated/api'

const mb = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`
const PAGE_SIZE = 24

function Media() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.admin.listMedia,
    {},
    { initialNumItems: PAGE_SIZE }
  )
  const totals = useQuery(api.admin.mediaTotals)

  if (status === 'LoadingFirstPage') {
    return <p className='font-sans text-sm text-black/60'>Loading…</p>
  }

  return (
    <div>
      <p className='mb-6 font-sans text-sm text-black/60'>
        {totals
          ? `${results.length} of ${totals.count} assets · ${mb(totals.bytes)} stored`
          : `${results.length} asset${results.length === 1 ? '' : 's'} loaded`}
        {status === 'Exhausted' ? '' : ' · largest first'}
      </p>
      <ul className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
        {results.map(item => (
          <li key={item._id} className='border border-black/20'>
            <a href={item.url} target='_blank' rel='noreferrer'>
              {item.kind === 'image' && item.width && item.height ? (
                <div className='relative aspect-square w-full'>
                  <Image
                    src={item.url}
                    alt={item.sanityAssetId}
                    fill
                    sizes='(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw'
                    className='object-cover'
                  />
                </div>
              ) : (
                <div className='flex aspect-square w-full items-center justify-center bg-black font-sans text-xs uppercase tracking-[1px] text-white'>
                  {item.extension}
                </div>
              )}
            </a>
            <div className='p-2 font-sans text-xs text-black/60'>
              {item.extension}
              {item.width && item.height && ` · ${item.width}×${item.height}`}
              <br />
              {mb(item.size)} <span className='text-black/40'>({mb(item.originalSize)})</span>
            </div>
          </li>
        ))}
      </ul>
      <LoadMore status={status} onClick={() => loadMore(PAGE_SIZE)} />
    </div>
  )
}

export default function AdminMediaPage() {
  return (
    <Authenticated>
      <Media />
    </Authenticated>
  )
}
