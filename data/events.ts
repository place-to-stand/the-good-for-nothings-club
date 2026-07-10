/**
 * Events — regular happenings at the clubhouse.
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
  lead: 'Regular happenings at the clubhouse — members and friends of members welcome.',
  upcomingTitle: 'Next up',
  friendNote:
    "Not a member yet? Join as a friend of the club — it's free — and you'll be invited to everything.",
}

export const events: GFNCEvent[] = [
  {
    slug: 'works-in-progress',
    name: 'Works in Progress',
    rule: { freq: 'monthly', weekday: 4, nth: 2 },
    time: '4 PM',
    schedule: 'Second Thursday · 4 PM',
    blurb:
      'A show & tell for creatives of any discipline. Bring something unfinished — everyone who attends is expected to give honest critique, and everyone who shows is expected to be open to it.',
  },
  {
    slug: 'off-genre-jam',
    name: 'Off Genre Jam',
    rule: { freq: 'monthly', weekday: 0, nth: 3 },
    time: '7 PM',
    schedule: 'Third Sunday · 7 PM',
    blurb: 'Exploring varieties of rock music and other neglected genres of jam.',
  },
]

/** YYYY-MM-DD in UTC for a date constructed at UTC noon. */
function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
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

  for (let day = 0; day < 120 && occurrences.length < count; day++) {
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
