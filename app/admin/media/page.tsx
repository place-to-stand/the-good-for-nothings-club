'use client'

import { Authenticated, useQuery } from 'convex/react'

import { api } from '@/convex/_generated/api'

const mb = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`

function Media() {
  const media = useQuery(api.admin.listMedia)

  if (media === undefined) {
    return <p className='font-sans text-sm text-black/60'>Loading…</p>
  }

  return (
    <div>
      <p className='mb-6 font-sans text-sm text-black/60'>
        {media.length} assets · {mb(media.reduce((sum, m) => sum + m.size, 0))} stored (
        {mb(media.reduce((sum, m) => sum + m.originalSize, 0))} original)
      </p>
      <ul className='grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6'>
        {media.map(item => (
          <li key={item._id} className='border border-black/20'>
            <a href={item.url} target='_blank' rel='noreferrer'>
              {item.kind === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.sanityAssetId}
                  loading='lazy'
                  className='aspect-square w-full object-cover'
                />
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
