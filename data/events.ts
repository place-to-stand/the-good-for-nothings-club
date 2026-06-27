/**
 * Events — the club's recurring and scheduled happenings.
 *
 * Plain, version-controlled data (no CMS). Edit directly.
 *
 * Two kinds of recurrence are supported:
 *   - "recurring": a standing rule (e.g. every Monday). Describe it in
 *     `recurrenceLabel`. Permanent fixtures live here and rarely change.
 *   - For recurring events that occasionally move, set `nextOccurrence` to the
 *     real date/time of the next one. The page shows that override alongside
 *     the standing rule, so you can reschedule a single instance without
 *     rewriting the rule. Clear it (or roll it forward) after it passes.
 *
 * `waitlist: true` swaps the CTA from "RSVP / Join" to "Join the waitlist",
 * for events we slow-roll new people into.
 */

export type GFNCEvent = {
  /** URL-safe unique id. Used for anchor links + waitlist subject. */
  slug: string
  name: string
  /** One-line summary shown under the name. */
  summary: string
  /** Longer description. Each string renders as its own paragraph. */
  description: string[]
  /** "Weekly" | "Monthly" | "One-time" — drives the badge label. */
  cadence: 'Weekly' | 'Monthly' | 'One-time'
  /** Human-readable standing schedule, e.g. "Every Monday · 7–9pm". */
  recurrenceLabel: string
  /**
   * ISO date or datetime for the next occurrence when it differs from the
   * standing rule (a rescheduled instance). Optional.
   * e.g. "2026-07-10T19:00:00-05:00"
   */
  nextOccurrence?: string
  /** Where it happens. Defaults to the club space when omitted. */
  location?: string
  /** Slow-roll signups through a waitlist instead of open RSVP. */
  waitlist?: boolean
}

export const events: GFNCEvent[] = [
  {
    slug: 'weekly-accountability-club',
    name: 'Weekly Accountability Club',
    summary:
      'Show up, set a goal, and get it done alongside other makers — every week.',
    description: [
      'Our core ritual: members and guests meet weekly to share what they are working on, set concrete goals, and hold each other accountable on progress.',
      'We are growing this intentionally, so new faces join from the waitlist a few at a time to keep the group tight and the sessions useful.',
    ],
    cadence: 'Weekly',
    recurrenceLabel: 'Every week',
    waitlist: true,
  },
  {
    slug: 'monthly-music-jam',
    name: 'Monthly Music Jam',
    summary: 'An open, low-pressure jam for musicians of every stripe.',
    description: [
      'Once a month we turn the space over to music — bring an instrument, your voice, or just your ears. All skill levels welcome.',
      'Space is limited, so we bring new players in gradually from the waitlist. Join it and we will reach out as spots open up.',
    ],
    cadence: 'Monthly',
    recurrenceLabel: 'Once a month',
    waitlist: true,
  },
]
