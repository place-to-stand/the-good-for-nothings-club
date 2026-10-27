'use client'

import Link from 'next/link'
import { FaCaretRight } from 'react-icons/fa'
import { FaArrowUpRightFromSquare } from 'react-icons/fa6'

import { Button } from '@/components/ui/Button'
import { CONTACT_EMAIL, notFoundCopy } from '@/data/site'

export type NotFoundTile = {
  href: string
  title: string
  description: string
  external: boolean
}

/**
 * Body of the HTML 404 (see app/(site)/not-found.tsx). A client component
 * because Next serializes the not-found UI into every page's RSC payload
 * (twice, with Partial Prefetching): as a server tree its icon-laden tile
 * grid cost about 20 KB on every page, as a client reference it's the
 * tile data alone.
 */
const card = 'bg-background border-2 border-black'
// md:min-h-48 fits the longest description at the narrowest tile, so a
// tile opening never pushes the rows around.
const tile =
  'group flex h-full min-h-28 flex-col justify-center px-5 py-4 transition-colors hover:bg-black/10 hover:no-underline active:bg-black/20 md:min-h-48 md:px-7'
// Collapsed row (0fr) keeps the title centered; it opens to the text's
// own height without a fixed size.
const reveal =
  'hidden grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-300 group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-visible:grid-rows-[1fr] group-focus-visible:opacity-100 motion-reduce:transition-none md:grid [@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100'

export default function SiteNotFound({ tiles }: { tiles: NotFoundTile[] }) {
  return (
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='mx-auto grid max-w-(--page-max-width) grid-cols-1 gap-8 xl:grid-cols-2'>
          <div
            className={`${card} flex flex-col gap-8 border-x-0 px-4 py-6 md:border-x-2 md:px-12 md:py-10 lg:max-xl:flex-row lg:max-xl:items-end lg:max-xl:gap-16`}
          >
            <h1 className='shrink-0 text-[112px] leading-[0.8] font-black tracking-[-0.04em] md:text-[200px]'>
              {notFoundCopy.title}
            </h1>
            <div className='flex min-w-0 flex-col gap-6'>
              <p className='max-w-xl font-serif text-[22px] leading-tight italic md:text-[30px]'>
                {notFoundCopy.lead}
              </p>
              <div className='flex flex-col gap-2.5 sm:flex-row sm:flex-wrap'>
                <Button asChild className='h-12 px-7 hover:no-underline'>
                  <Link href='/'>{notFoundCopy.backHome}</Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  className='h-12 px-7 hover:no-underline'
                >
                  <a href={`mailto:${CONTACT_EMAIL}`}>{notFoundCopy.emailUs}</a>
                </Button>
              </div>
            </div>
          </div>

          <div className={`${card} flex flex-col border-x-0 md:border-x-2`}>
            <h2 className='border-b-2 border-black px-4 py-4 font-serif text-xl font-normal normal-case italic md:px-8 md:py-5 md:text-2xl'>
              {notFoundCopy.nextTitle}
            </h2>
            <ul className='grid flex-1 auto-rows-fr grid-cols-2 font-sans'>
              {tiles.map((entry, index) => (
                <li
                  key={entry.href}
                  className={[
                    'border-black',
                    index % 2 === 0 ? 'border-r-2' : '',
                    index < tiles.length - 2 ? 'border-b-2' : '',
                  ].join(' ')}
                >
                  <Link
                    href={entry.href}
                    className={tile}
                    {...(entry.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    <span className='flex items-center justify-between text-lg font-black tracking-[-0.04em] uppercase md:text-[26px]'>
                      <span>{entry.title}</span>
                      {entry.external ? (
                        <FaArrowUpRightFromSquare className='size-3.5 md:size-4' />
                      ) : (
                        <FaCaretRight className='size-4 transition-transform duration-300 group-hover:translate-x-1 md:size-5' />
                      )}
                    </span>
                    <span className={reveal}>
                      <span className='overflow-hidden text-sm leading-snug'>
                        <span className='block pt-1.5'>
                          {entry.description}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className='flex items-center justify-between gap-4 border-t-2 border-black px-4 py-3.5 font-sans text-xs font-semibold tracking-[0.06em] uppercase md:px-8 md:text-[13px]'>
              <span className='text-black/60'>{notFoundCopy.robotsLabel}</span>
              <span className='flex gap-4'>
                <a href='/llms.txt'>llms.txt</a>
                <a href='/sitemap.xml'>sitemap.xml</a>
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
