/**
 * Events - regular happenings at the clubhouse.
 *
 * Plain, version-controlled data (no CMS). Edit directly.
 *
 * Recurrence is a rule (`weekly` on a weekday, or `monthly` on the nth
 * weekday). Upcoming dates are computed from the rule. To reschedule or
 * cancel a single occurrence, add its computed ISO date (YYYY-MM-DD) to
 * `skipDates` and, if it moved, put the replacement in `extraDates`.
 */

export type EventRule =
  | { freq: 'weekly'; weekday: number } // 0 = Sunday … 6 = Saturday
  | { freq: 'monthly'; weekday: number; nth: number }

export type GFNCEvent = {
  /** URL-safe unique id. Used for anchor links + RSVP subject. */
  slug: string
  name: string
  blurb: string
  rule: EventRule
  /** Display time, e.g. "4 PM". */
  time: string
  /** Human-readable standing schedule, e.g. "Thursdays · 4 PM". */
  schedule: string
  /** Cancelled/rescheduled occurrences, as YYYY-MM-DD. */
  skipDates?: string[]
  /** One-off replacement dates, as YYYY-MM-DD. */
  extraDates?: string[]
  location?: string
}

export const eventsCopy = {
  lead: 'Regular happenings at the clubhouse - members, associates, and friends of the club welcome.',
  calendarTitle: 'Calendar',
  recurringTitle: 'Recurring',
  friendNote: 'Events are for members, associates, and friends of the club.',
  friendCta: 'Apply to join',
}

export const events: GFNCEvent[] = [
  {
    slug: 'works-in-progress',
    name: 'Works in Progress',
    rule: { freq: 'monthly', weekday: 4, nth: 2 },
    time: '7 PM',
    schedule: 'Second Thursday · 7 PM',
    blurb:
      'A show & tell for creatives of any discipline. Bring something unfinished - everyone who attends is expected to give honest critique, and everyone who shows is expected to be open to it.',
  },
  {
    slug: 'off-genre-jam',
    name: 'Off Genre Jam',
    rule: { freq: 'monthly', weekday: 4, nth: 3 },
    time: '7 PM',
    schedule: 'Third Thursday · 7 PM',
    blurb:
      'Exploring varieties of rock music and other neglected genres of jam.',
  },
]

/** YYYY-MM-DD in UTC for a date constructed at UTC noon. */
function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

/** "Thu, Aug 13" for a YYYY-MM-DD occurrence date. */
export function formatOccurrenceDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

/** "Thu, Aug 13, 2026 · 4 PM" — the full RSVP subject for one occurrence. */
export function formatOccurrenceLong(iso: string, time: string) {
  const date = new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
  return `${date} · ${time}`
}

function matchesRule(date: Date, rule: EventRule) {
  if (date.getUTCDay() !== rule.weekday) return false
  if (rule.freq === 'weekly') return true
  return Math.ceil(date.getUTCDate() / 7) === rule.nth
}

export type Occurrence = {
  event: GFNCEvent
  /** YYYY-MM-DD */
  date: string
}

/**
 * Next occurrences across all events, chronological. `from` should be a
 * date-only anchor; days are iterated at UTC noon so DST never shifts them.
 */
export function upcomingOccurrences(from: Date, count: number): Occurrence[] {
  const occurrences: Occurrence[] = []
  const cursor = new Date(
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate(), 12)
  )

  // Scan window must be generous enough to satisfy `count` for monthly
  // events (8 occurrences of 2 monthly events needs ~4 months minimum).
  for (let day = 0; day < 400 && occurrences.length < count; day++) {
    const iso = isoDay(cursor)
    for (const event of events) {
      const matches =
        (matchesRule(cursor, event.rule) && !event.skipDates?.includes(iso)) ||
        event.extraDates?.includes(iso)
      if (matches) occurrences.push({ event, date: iso })
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return occurrences.slice(0, count)
}
