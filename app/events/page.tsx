import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'

import InquiryDialog from '@/components/InquiryDialog'
import OfferCard from '@/components/OfferCard'
import PageShell from '@/components/PageShell'
import PriceMenu from '@/components/PriceMenu'
import SectionHeading from '@/components/SectionHeading'
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

  const calendarLines = upcoming.map(occurrence => {
    const date = occurrenceDate(occurrence.date)
    return {
      group: date.toLocaleDateString('en-US', {
        month: 'long',
        timeZone: 'UTC',
      }),
      item: `${date.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
      })} ${date.getUTCDate()} · ${occurrence.event.time}`,
      price: occurrence.event.name,
    }
  })

  return (
    <PageShell title='Events' lead={`The club, in session. ${eventsCopy.lead}`}>
      <div className='grid grid-cols-1 gap-6 md:gap-16 lg:grid-cols-2'>
        <div>
          <SectionHeading title={eventsCopy.calendarTitle} />
          <div className='mt-6'>
            <PriceMenu lines={calendarLines} />
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
                    triggerLabel='RSVP'
                    title={`RSVP - ${event.name}`}
                    description={`${event.schedule} at the clubhouse.`}
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
