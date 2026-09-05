import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import ArrowList from './ArrowList'

/**
 * The bordered list that holds MenuBoardRows: a 2px line top and bottom,
 * hairlines between rows. Used for services and membership tiers.
 */
export function MenuBoard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'divide-y divide-black/25 border-y-2 border-black',
        className
      )}
    >
      {children}
    </div>
  )
}

type MenuBoardRowProps = {
  /** Anchor id for deep links. */
  id?: string
  title: string
  /** Small-caps line under the title, e.g. "Monthly" or "Free". */
  meta?: string
  description: string
  /** What the offer covers, listed with arrow bullets. */
  items?: string[]
  /** Small-caps lead-in above the items, e.g. "Includes everything in friend, plus:". */
  itemsLabel?: string
  /** 'narrow' fits two-word items; 'wide' fits full phrases. Desktop only. */
  itemsWidth?: 'narrow' | 'wide'
  /** CTA, right-aligned on desktop. */
  cta?: ReactNode
}

/**
 * One line of a menu board: title, blurb, what it covers, optional CTA.
 * Phones stack everything; tablets put the title beside a stacked column;
 * desktops spread the column into its own tracks. The blurb widens into
 * the items track when there is nothing to list.
 */
export function MenuBoardRow({
  id,
  title,
  meta,
  description,
  items,
  itemsLabel,
  itemsWidth = 'narrow',
  cta,
}: MenuBoardRowProps) {
  const hasItems = Boolean(items && items.length > 0)
  const tracks = cta
    ? itemsWidth === 'wide'
      ? 'xl:grid-cols-[minmax(0,1fr)_20rem_11rem]'
      : 'xl:grid-cols-[minmax(0,1fr)_10rem_11rem]'
    : itemsWidth === 'wide'
      ? 'xl:grid-cols-[minmax(0,1fr)_20rem]'
      : 'xl:grid-cols-[minmax(0,1fr)_10rem]'

  return (
    <div
      id={id}
      className='grid scroll-mt-28 grid-cols-1 gap-y-4 py-6 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-x-8 xl:grid-cols-[16rem_minmax(0,1fr)]'
    >
      <div className='md:mt-[3px]'>
        <h3 className='text-[24px] leading-none font-extrabold tracking-[-0.03em] text-balance'>
          {title}
        </h3>
        {meta && (
          <p className='mt-2 font-sans text-xs font-semibold tracking-[0.08em] text-black/60 uppercase'>
            {meta}
          </p>
        )}
      </div>
      <div
        className={cn(
          'grid grid-cols-1 gap-4 xl:items-start xl:gap-x-8',
          tracks
        )}
      >
        <p
          className={cn(
            'max-w-[560px] font-sans leading-snug',
            !hasItems && (cta ? 'xl:col-span-2' : 'xl:col-span-full')
          )}
        >
          {description}
        </p>
        {hasItems && (
          <div className='xl:pt-0.5'>
            {itemsLabel && (
              <p className='mb-2.5 font-sans text-[11px] leading-none font-extrabold tracking-[0.08em] text-black/60 uppercase'>
                {itemsLabel}
              </p>
            )}
            <ArrowList items={items!} />
          </div>
        )}
        {cta && <div className='xl:flex xl:justify-end'>{cta}</div>}
      </div>
    </div>
  )
}
