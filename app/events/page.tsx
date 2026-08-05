import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'

import GroupLabel from '@/components/GroupLabel'
import InquiryDialog from '@/components/InquiryDialog'
import OfferCard from '@/components/OfferCard'
import PageShell, { PageShellSection } from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import { Button } from '@/components/ui/Button'
import {
  events,
  eventsCopy,
  formatOccurrenceDate,
  splitSpecialEvents,
  upcomingOccurrences,
} from '@/data/events'
import { eventsJsonLd } from '@/lib/structuredData'

// Recompute the upcoming schedule daily. This is also what rolls one-off
// events from the calendar into Past Events without any edits.
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

function monthLabel(iso: string) {
  return occurrenceDate(iso).toLocaleDateString('en-US', {
    month: 'long',
    timeZone: 'UTC',
  })
}

/** One calendar row: a recurring occurrence or an upcoming one-off. */
type CalendarEntry = {
  key: string
  date: string
  time?: string
  name: string
  /** External RSVP (e.g. Partiful). Falls back to the on-site dialog. */
  url?: string
}

export default function Events() {
  const now = new Date()
  const { upcoming: upcomingSpecials, past } = splitSpecialEvents(now)
  // Three upcoming dates for each recurring event.
  const recurring = upcomingOccurrences(now, 3)

  const calendar: CalendarEntry[] = [
    ...recurring.map(occurrence => ({
      key: `${occurrence.event.slug}-${occurrence.date}`,
      date: occurrence.date,
      time: occurrence.event.time,
      name: occurrence.event.name,
    })),
    ...upcomingSpecials.map(event => ({
      key: event.slug,
      date: event.date,
      time: event.time,
      name: event.name,
      url: event.url,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  const months = [...new Set(calendar.map(entry => monthLabel(entry.date)))]
  const pastYears = [...new Set(past.map(event => event.date.slice(0, 4)))]

  const pastSection = past.length > 0 && (
    <PageShellSection>
      <SectionHeading title={eventsCopy.pastTitle} className='mt-2 md:mt-2' />
      <p className='mt-4 font-sans text-sm leading-snug'>
        {eventsCopy.pastLead}
      </p>
      <div className='mt-6 space-y-6 font-sans text-sm'>
        {pastYears.map(year => (
          <div key={year}>
            <GroupLabel>{year}</GroupLabel>
            {past
              .filter(event => event.date.startsWith(year))
              .map(event => (
                <div
                  key={event.slug}
                  id={event.slug}
                  className='flex items-center gap-2 py-1'
                >
                  <span className='whitespace-nowrap'>
                    {formatOccurrenceDate(event.date)}
                  </span>
                  <span
                    aria-hidden
                    className='min-w-6 flex-1 border-b-2 border-dotted border-black/25'
                  />
                  <span className='text-right'>
                    <span className='text-base font-bold'>{event.name}</span>{' '}
                    {event.venue && (
                      <span className='text-black/60'>· {event.venue}</span>
                    )}
                    {event.url && (
                      <>
                        {' '}
                        <a
                          href={event.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='whitespace-nowrap font-bold underline'
                        >
                          Invite ↗
                        </a>
                      </>
                    )}
                  </span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </PageShellSection>
  )

  return (
    <PageShell
      title='Events'
      lead={`The club, in session. ${eventsCopy.lead}`}
      after={pastSection}
    >
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventsJsonLd(recurring)),
        }}
      />
      <div className='grid grid-cols-1 gap-6 md:gap-16 lg:grid-cols-2'>
        <div>
          <SectionHeading title={eventsCopy.calendarTitle} />
          {/* Each date carries its own RSVP so it's always clear which
              occurrence you're signing up for. */}
          <div className='mt-6 space-y-6 font-sans text-sm'>
            {months.map(month => (
              <div key={month}>
                <GroupLabel>{month}</GroupLabel>
                {calendar
                  .filter(entry => monthLabel(entry.date) === month)
                  .map(entry => (
                    <div
                      key={entry.key}
                      id={entry.key}
                      className='flex scroll-mt-28 items-center gap-2 py-1'
                    >
                      <span className='whitespace-nowrap'>
                        {formatOccurrenceDate(entry.date)}
                        {entry.time ? ` · ${entry.time}` : ''}
                      </span>
                      <span
                        aria-hidden
                        className='min-w-6 flex-1 border-b-2 border-dotted border-black/25'
                      />
                      <span className='text-base font-bold'>{entry.name}</span>
                      {entry.url ? (
                        <Button
                          asChild
                          variant='outline'
                          className='h-8 shrink-0 px-3 text-xs'
                        >
                          <a
                            href={entry.url}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            RSVP
                          </a>
                        </Button>
                      ) : (
                        <InquiryDialog
                          kind='event'
                          item={entry.name}
                          occurrenceDate={entry.date}
                          autoOpenId={entry.key}
                          triggerLabel='RSVP'
                          triggerVariant='outline'
                          triggerClassName='h-8 px-3 text-xs shrink-0'
                          title={`RSVP - ${entry.name}`}
                          submitLabel='RSVP'
                        />
                      )}
                    </div>
                  ))}
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
                    autoOpenId={event.slug}
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
