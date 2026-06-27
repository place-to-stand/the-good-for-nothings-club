import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'

import { events } from '@/data/events'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/events'

  return {
    title: 'Events',
    description:
      'Upcoming events at The Good for Nothings Club — including our weekly accountability club and monthly music jam. Join the waitlist.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

function formatOccurrence(iso: string) {
  const date = new Date(iso)
  const hasTime = iso.includes('T')

  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    ...(hasTime ? { hour: 'numeric', minute: '2-digit' } : {}),
    timeZone: hasTime ? undefined : 'UTC',
  })
}

export default function Events() {
  return (
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h1 className='pt-6 text-center text-[32px] leading-none font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[96px]'>
            Events
          </h1>

          <div className='mt-10 border-t-2 border-black pt-12 sm:mt-12 md:mt-20'>
            <p className='mx-auto max-w-3xl text-center font-serif text-2xl leading-tight sm:text-[28px]'>
              The club runs on a rhythm of recurring gatherings. Some are open,
              and some we grow slowly — join a waitlist and we&apos;ll bring you
              in as space opens up.
            </p>

            <div className='mt-12 flex flex-col gap-6 md:mt-16 md:gap-8'>
              {events.map(event => (
                <article
                  key={event.slug}
                  id={event.slug}
                  className='flex scroll-mt-28 flex-col gap-6 border-2 border-black p-6 md:flex-row md:items-start md:justify-between md:p-8'
                >
                  <div className='flex-1'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <span className='inline-block border-2 border-black px-3 py-1 font-sans text-xs font-black tracking-widest uppercase'>
                        {event.cadence}
                      </span>
                      {event.waitlist && (
                        <span className='inline-block bg-black px-3 py-1 font-sans text-xs font-black tracking-widest text-white uppercase'>
                          Waitlist
                        </span>
                      )}
                    </div>

                    <h2 className='mt-4 text-[28px] leading-none font-black tracking-[-0.03em] md:text-[32px]'>
                      {event.name}
                    </h2>

                    <p className='mt-3 font-serif text-xl leading-snug'>
                      {event.summary}
                    </p>

                    <dl className='mt-4 space-y-1 font-sans text-sm'>
                      <div className='flex gap-2'>
                        <dt className='font-black tracking-wide uppercase'>
                          When:
                        </dt>
                        <dd>{event.recurrenceLabel}</dd>
                      </div>
                      {event.nextOccurrence && (
                        <div className='flex gap-2'>
                          <dt className='font-black tracking-wide uppercase'>
                            Next:
                          </dt>
                          <dd>{formatOccurrence(event.nextOccurrence)}</dd>
                        </div>
                      )}
                      <div className='flex gap-2'>
                        <dt className='font-black tracking-wide uppercase'>
                          Where:
                        </dt>
                        <dd>{event.location ?? 'The club space, Austin, TX'}</dd>
                      </div>
                    </dl>

                    <div className='mt-4 space-y-3 font-sans leading-snug'>
                      {event.description.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  <div className='md:w-64 md:shrink-0'>
                    <Link
                      href={`/contact?subject=${encodeURIComponent(
                        event.waitlist
                          ? `Waitlist: ${event.name}`
                          : `RSVP: ${event.name}`
                      )}`}
                      className='inline-flex w-full items-center justify-center border-2 border-black bg-black px-6 py-4 text-center font-sans text-sm font-black tracking-tight text-white uppercase transition-colors hover:bg-black/80 hover:no-underline active:bg-black/70'
                    >
                      {event.waitlist ? 'Join the waitlist' : 'RSVP'}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
