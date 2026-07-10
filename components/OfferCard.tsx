import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type OfferCardProps = {
  /** Anchor id for deep links. */
  id?: string
  /** Extra classes on the article, e.g. subgrid alignment across a row. */
  className?: string
  title: string
  /** Headline price, set on the title line with a dotted leader. */
  price?: string
  /** Small-caps line under the title, e.g. "8 desks total" or "Two-hour minimum." */
  meta?: string
  description?: string
  /** Extra content, e.g. a PriceMenu. */
  children?: ReactNode
  /** CTA area, pinned to the bottom of the card. */
  footer?: ReactNode
}

/**
 * A bordered offer card: one structural frame, menu-style interior.
 * Used for facilities, services, and anything else with a price tag.
 */
export default function OfferCard({
  id,
  className,
  title,
  price,
  meta,
  description,
  children,
  footer,
}: OfferCardProps) {
  return (
    <article
      id={id}
      className={cn(
        'flex scroll-mt-28 flex-col border-2 border-black p-6 md:p-8',
        className
      )}
    >
      <div className='flex items-center justify-between gap-2'>
        <h3 className='text-[24px] leading-none font-extrabold tracking-[-0.03em] md:text-[28px]'>
          {title}
        </h3>
        {price && (
          <>
            <span className='font-sans text-base font-bold tracking-tight whitespace-nowrap uppercase'>
              {price}
            </span>
          </>
        )}
      </div>

      {meta && (
        <p className='mt-1.5 font-sans text-xs font-semibold tracking-[0.08em] text-black/60 uppercase'>
          {meta}
        </p>
      )}

      {description && (
        <p className='mt-4 font-sans leading-snug'>{description}</p>
      )}

      {children && <div className='mt-6'>{children}</div>}

      {footer && <div className='mt-auto pt-8'>{footer}</div>}
    </article>
  )
}
