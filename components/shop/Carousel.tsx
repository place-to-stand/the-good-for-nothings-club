'use client'

import Link from 'next/link'
import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

import { slideFillClassName } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

import { ArrowIcon } from './icons'

/**
 * One row of cards that scrolls sideways, with arrow buttons by the
 * heading. Swipe on touch; cards snap into place.
 */
export default function Carousel({
  title,
  link,
  children,
  className,
}: {
  title: string
  /** Optional "see all" link shown by the arrows. */
  link?: { href: string; text: string }
  children: ReactNode
  className?: string
}) {
  const track = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      observer.disconnect()
    }
  }, [measure])

  const items = Children.toArray(children)
  const scrolls = !(edges.start && edges.end)

  return (
    <section className={className}>
      <div className='flex items-end justify-between gap-4'>
        <h2 className='text-[28px] font-black tracking-[-0.03em] md:text-[40px]'>
          {title}
        </h2>
        <div className='flex shrink-0 items-center gap-2'>
          {link && (
            <Link
              href={link.href}
              className='mr-2 hidden text-sm font-extrabold tracking-[0.06em] uppercase sm:inline'
            >
              {link.text}
            </Link>
          )}
          {scrolls &&
            ([-1, 1] as const).map(direction => (
              <button
                key={direction}
                type='button'
                onClick={() => {
                  const el = track.current
                  el?.scrollBy({
                    left: direction * el.clientWidth,
                    behavior: 'smooth',
                  })
                }}
                disabled={direction === -1 ? edges.start : edges.end}
                aria-label={direction === -1 ? 'Scroll back' : 'Scroll on'}
                className={cn(
                  slideFillClassName,
                  'flex size-10 cursor-pointer items-center justify-center border-2 border-black bg-white disabled:cursor-default disabled:border-black/20 disabled:bg-transparent disabled:text-black/30'
                )}
              >
                <ArrowIcon
                  direction={direction === -1 ? 'left' : 'right'}
                  size={20}
                />
              </button>
            ))}
        </div>
      </div>
      <ul
        ref={track}
        className='-mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:scroll-px-0 md:gap-5 md:px-0 [&::-webkit-scrollbar]:hidden'
      >
        {items.map((item, i) => (
          <li
            key={i}
            className={cn(
              'flex shrink-0 snap-start',
              // Peek at the next card so it's clear the row scrolls.
              'w-[calc((100%-0.75rem)/1.6)] sm:w-[calc((100%-1.5rem)/2.5)] md:w-[calc((100%-3.75rem)/4)]'
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
