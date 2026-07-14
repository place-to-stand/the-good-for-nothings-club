'use client'

import type { PaginationStatus } from 'convex/react'

/**
 * "Load more" button for the admin's paginated lists. Renders nothing once the
 * query is `Exhausted`, so callers can drop it in unconditionally.
 */
export default function LoadMore({
  status,
  onClick,
}: {
  status: PaginationStatus
  onClick: () => void
}) {
  if (status === 'Exhausted' || status === 'LoadingFirstPage') {
    return null
  }

  return (
    <div className='mt-8 flex justify-center'>
      <button
        type='button'
        onClick={onClick}
        disabled={status === 'LoadingMore'}
        className='rounded-full border-2 border-black px-6 py-2.5 font-sans text-sm leading-tight font-black uppercase transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-black'
      >
        {status === 'LoadingMore' ? 'Loading…' : 'Load more'}
      </button>
    </div>
  )
}
