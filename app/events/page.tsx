import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'

import GroupLabel from '@/components/GroupLabel'
import InquiryDialog from '@/components/InquiryDialog'
import OfferCard from '@/components/OfferCard'
import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import {
  events,
  eventsCopy,
  formatOccurrenceDate,
  upcomingOccurrences,
} from '@/data/events'

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
      'The club, in session - regular happenings at the clubhouse in Austin, TX. Members and friends of members welcome.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

function occurrenceDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`)
}

export default function Events() {
  const upcoming = upcomingOccurrences(new Date(), 8)
  const months = [
    ...new Set(
      upcoming.map(occurrence =>
        occurrenceDate(occurrence.date).toLocaleDateString('en-US', {
          month: 'long',
          timeZone: 'UTC',
        })
      )
    ),
  ]

  return (
    <PageShell title='Events' lead={`The club, in session. ${eventsCopy.lead}`}>
      <div className='grid grid-cols-1 gap-6 md:gap-16 lg:grid-cols-2'>
        <div>
          <SectionHeading title={eventsCopy.calendarTitle} />
          {/* Each date carries its own RSVP so it's always clear which
              occurrence you're signing up for. */}
          <div className='mt-6 space-y-6 font-sans text-sm'>
            {months.map(month => (
              <div key={month}>
                <GroupLabel>{month}</GroupLabel>
                {upcoming
                  .filter(
                    occurrence =>
                      occurrenceDate(occurrence.date).toLocaleDateString(
                        'en-US',
                        { month: 'long', timeZone: 'UTC' }
                      ) === month
                  )
                  .map(occurrence => {
                    return (
                      <div
                        key={`${occurrence.event.slug}-${occurrence.date}`}
                        className='flex items-center gap-2 py-1'
                      >
                        <span className='whitespace-nowrap'>
                          {formatOccurrenceDate(occurrence.date)} ·{' '}
                          {occurrence.event.time}
                        </span>
                        <span
                          aria-hidden
                          className='min-w-6 flex-1 border-b-2 border-dotted border-black/25'
                        />
                        <span className='text-base font-bold'>
                          {occurrence.event.name}
                        </span>
                        <InquiryDialog
                          kind='event'
                          item={occurrence.event.name}
                          occurrenceDate={occurrence.date}
                          triggerLabel='RSVP'
                          triggerVariant='outline'
                          triggerClassName='h-8 px-3 text-xs shrink-0'
                          title={`RSVP - ${occurrence.event.name}`}
                          submitLabel='RSVP'
                        />
                      </div>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeading title={eventsCopy.recurringTitle} />
          <div className='mt-6 flex flex-col gap-6 md:gap-8'>
            {events.map(event => (
              <OfferCard
                key={event.slug}
                id={event.slug}
                title={event.name}
                price={event.schedule}
                meta={event.location ?? 'GFNC Clubhouse, Austin, TX'}
                description={event.blurb}
                footer={
                  <InquiryDialog
                    kind='event'
                    item={event.name}
                    triggerLabel='RSVP to the next one'
                    title={`RSVP - ${event.name}`}
                    submitLabel='RSVP'
                  />
                }
              />
            ))}
          </div>
        </div>
      </div>

      <p className='mt-12 text-center font-sans leading-snug'>
        {eventsCopy.friendNote}{' '}
        <Link href='/membership' className='font-bold underline'>
          {eventsCopy.friendCta}
        </Link>
      </p>
    </PageShell>
  )
}
