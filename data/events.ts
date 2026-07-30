/**
 * Events - regular happenings at the clubhouse, plus one-off parties.
 *
 * Plain, version-controlled data (no CMS). Edit directly.
 *
 * Two kinds of event live here:
 *
 * 1. Recurring (`events`). Recurrence is a rule (`weekly` on a weekday, or
 *    `monthly` on the nth weekday) and upcoming dates are computed from it.
 *    The standing dates are aspirational - they exist to gauge interest via
 *    RSVPs. To reschedule or cancel a single occurrence, add an entry to
 *    `overrides` keyed by the computed ISO date (YYYY-MM-DD):
 *
 *      overrides: {
 *        '2026-08-13': '2026-08-20', // moved a week later
 *        '2026-09-10': null,         // cancelled
 *      }
 *
 * 2. One-offs (`specialEvents`). Explicit dates, kept in chronological
 *    order. The page splits them into upcoming and past automatically by
 *    comparing against today - nothing to move when an event happens.
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
  /**
   * Per-occurrence changes, keyed by the computed YYYY-MM-DD date.
   * Value is the replacement YYYY-MM-DD, or null to cancel that one.
   */
  overrides?: Record<string, string | null>
  location?: string
}

export type SpecialEvent = {
  /** URL-safe unique id. Used for anchor links + RSVP subject. */
  slug: string
  name: string
  /** YYYY-MM-DD */
  date: string
  /** Display time, e.g. "7 PM". Shown for upcoming events only. */
  time?: string
  venue?: string
  /** External invite link (e.g. Partiful), when RSVPs live off-site. */
  url?: string
}

export const eventsCopy = {
  lead: 'Regular happenings at the clubhouse - members, associates, and friends of the club welcome.',
  calendarTitle: 'Calendar',
  recurringTitle: 'Recurring',
  pastTitle: 'Past Events',
  pastLead: "Parties, markets, and screenings we've thrown around Austin.",
  friendNote: 'Events are for members, associates, and friends of the club.',
  friendCta: 'Apply to join',
}

// Listed in monthly order (1st, 2nd, 3rd Thursday) - the page renders
// the Recurring cards in this order.
export const events: GFNCEvent[] = [
  {
    slug: 'open-house',
    name: 'Open House',
    rule: { freq: 'monthly', weekday: 4, nth: 1 },
    time: '7 PM',
    schedule: '1st Thursday · 7 PM',
    blurb:
      'Come see the place. Tour the studios and workspaces, meet a few members, and ask us anything about the club.',
  },
  {
    slug: 'works-in-progress',
    name: 'Works in Progress',
    rule: { freq: 'monthly', weekday: 4, nth: 2 },
    time: '7 PM',
    schedule: '2nd Thursday · 7 PM',
    blurb:
      'A show & tell for creatives of any discipline. Bring something unfinished - everyone who attends is expected to give honest critique, and everyone who shows is expected to be open to it.',
  },
  {
    slug: 'off-genre-jam',
    name: 'Off Genre Jam',
    rule: { freq: 'monthly', weekday: 4, nth: 3 },
    time: '7 PM',
    schedule: '3rd Thursday · 7 PM',
    blurb:
      'Exploring varieties of rock music and other neglected genres of jam.',
  },
]

/** One-off events, chronological. Past ones stay - they're the history. */
export const specialEvents: SpecialEvent[] = [
  {
    slug: 'clubhouse-warming-party',
    name: 'Clubhouse Warming Party',
    date: '2024-11-01',
    venue: 'GFNC Clubhouse',
  },
  {
    slug: 'keep-it-local-yokels',
    name: 'Keep It Local, Yokels!',
    date: '2025-03-09',
    venue: 'Keep Looking Shop',
    url: 'https://partiful.com/e/gBLpBXdII2sEThii00b8',
  },
  {
    slug: 'mid90s-movie-night',
    name: 'mid90s - Movie Night',
    date: '2025-06-26',
    venue: 'Keep Looking Shop',
    url: 'https://partiful.com/e/UHYXOAWPHHIv2QXsDfbz',
  },
  {
    slug: 'hot-rod-movie-night',
    name: 'Hot Rod - Movie Night',
    date: '2025-07-31',
    venue: 'Keep Looking Shop',
    url: 'https://partiful.com/e/gYx2od9fhBZhYuzoyJE4',
  },
  {
    slug: 'summers-gone-fest',
    name: "Summer's Gone Fest",
    date: '2025-09-20',
    venue: "Sunny's Backyard",
    url: 'https://partiful.com/e/ozxd39PZ2gVRYs0o6p0t',
  },
  {
    slug: 'keep-looking-turns-one',
    name: 'Keep Looking Turns One!',
    date: '2025-11-02',
    venue: 'Keep Looking Shop',
    url: 'https://partiful.com/e/H2ATEDDhyliHGVv0Ypaa',
  },
  {
    slug: 'just-southwest-of-official',
    name: 'Just Southwest of Official',
    date: '2026-03-15',
    venue: 'Better Half + Hold Out Brewing',
    url: 'https://partiful.com/e/necWPNdp0ZY6CIlQ32K8',
  },
  {
    slug: 'off-genre-jam-jul-2026',
    name: 'Off Genre Jam',
    date: '2026-07-01',
    venue: 'GFNC Clubhouse',
  },
]

/** YYYY-MM-DD in UTC for a date constructed at UTC noon. */
function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

/** `from`'s calendar day as YYYY-MM-DD, anchored at UTC noon. */
function isoToday(from: Date) {
  return isoDay(
    new Date(Date.UTC(from.getFullYear(), from.getMonth(), from.getDate(), 12))
  )
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
 * The next `countPerEvent` occurrences of every event, chronological.
 * `from` should be a date-only anchor; days are iterated at UTC noon so
 * DST never shifts them.
 */
export function upcomingOccurrences(
  from: Date,
  countPerEvent: number
): Occurrence[] {
  const occurrences: Occurrence[] = []
  const counts = new Map<string, number>()
  const cursor = new Date(
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate(), 12)
  )

  // The 400-day scan window comfortably covers `countPerEvent` months of
  // monthly events plus any rescheduled dates.
  const total = events.length * countPerEvent
  for (let day = 0; day < 400 && occurrences.length < total; day++) {
    const iso = isoDay(cursor)
    for (const event of events) {
      if ((counts.get(event.slug) ?? 0) >= countPerEvent) continue
      const overrides = event.overrides ?? {}
      const matches =
        (matchesRule(cursor, event.rule) && !(iso in overrides)) ||
        Object.values(overrides).includes(iso)
      if (matches) {
        occurrences.push({ event, date: iso })
        counts.set(event.slug, (counts.get(event.slug) ?? 0) + 1)
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return occurrences
}

/**
 * One-offs split around `from`'s calendar day: upcoming ascending (today
 * inclusive), past descending (most recent first).
 */
export function splitSpecialEvents(from: Date): {
  upcoming: SpecialEvent[]
  past: SpecialEvent[]
} {
  const today = isoToday(from)
  return {
    upcoming: specialEvents.filter(event => event.date >= today),
    past: specialEvents.filter(event => event.date < today).reverse(),
  }
}
