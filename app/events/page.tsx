import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'

import InquiryDialog from '@/components/InquiryDialog'
import { events, eventsCopy, upcomingOccurrences } from '@/data/events'

// Recompute the upcoming schedule daily.
export const revalidate = 86400

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/events'

  return {
    title: 'Events',
    description:
      'The club, in session — regular happenings at the clubhouse in Austin, TX. Members and friends of members welcome.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

function formatDay(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default function Events() {
  const upcoming = upcomingOccurrences(new Date(), 6)

  return (
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h1 className='pt-6 text-center text-[32px] leading-none font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[96px]'>
            Events
          </h1>

          <div className='mt-10 border-t-2 border-black pt-12 sm:mt-12 md:mt-20'>
            <p className='mx-auto max-w-3xl text-center font-serif text-2xl leading-tight sm:text-[28px]'>
              The club, in session. {eventsCopy.lead}
            </p>

            {/* Upcoming schedule */}
            <h2 className='mt-12 text-[28px] font-black tracking-[-0.03em] md:mt-16 md:text-[40px]'>
              {eventsCopy.upcomingTitle}
            </h2>
            <ol className='mt-6 divide-y-2 divide-black border-2 border-black'>
              {upcoming.map(occurrence => (
                <li
                  key={`${occurrence.event.slug}-${occurrence.date}`}
                  className='flex flex-wrap items-baseline gap-x-6 gap-y-1 px-4 py-3 font-sans md:px-6'
                >
                  <span className='w-28 font-black uppercase'>
                    {formatDay(occurrence.date)}
                  </span>
                  <span className='w-16 text-sm font-bold'>
                    {occurrence.event.time}
                  </span>
                  <a
                    href={`#${occurrence.event.slug}`}
                    className='font-bold hover:underline'
                  >
                    {occurrence.event.name}
                  </a>
                </li>
              ))}
            </ol>

            {/* Event details */}
            <div className='mt-12 flex flex-col gap-6 md:mt-16 md:gap-8'>
              {events.map(event => (
                <article
                  key={event.slug}
                  id={event.slug}
                  className='flex scroll-mt-28 flex-col gap-6 border-2 border-black p-6 md:flex-row md:items-start md:justify-between md:p-8'
                >
                  <div className='flex-1'>
                    <span className='inline-block border-2 border-black px-3 py-1 font-sans text-xs font-black tracking-widest uppercase'>
                      {event.schedule}
                    </span>

                    <h2 className='mt-4 text-[28px] leading-none font-black tracking-[-0.03em] md:text-[32px]'>
                      {event.name}
                    </h2>

                    <p className='mt-4 font-sans leading-snug'>{event.blurb}</p>

                    <p className='mt-3 font-sans text-sm'>
                      <span className='font-black tracking-wide uppercase'>
                        Where:{' '}
                      </span>
                      {event.location ?? 'The clubhouse, Austin, TX'}
                    </p>
                  </div>

                  <div className='md:w-64 md:shrink-0'>
                    <InquiryDialog
                      kind='event'
                      item={event.name}
                      triggerLabel='RSVP'
                      title={`RSVP — ${event.name}`}
                      description={`${event.schedule} at the clubhouse.`}
                      submitLabel='RSVP'
                    />
                  </div>
                </article>
              ))}
            </div>

            <p className='mt-12 text-center font-sans leading-snug'>
              {eventsCopy.friendNote}{' '}
              <Link href='/membership' className='font-bold underline'>
                Join as a friend
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
