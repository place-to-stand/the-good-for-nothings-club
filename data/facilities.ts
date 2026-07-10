/**
 * Facilities — the clubhouse, room by room.
 *
 * Plain, version-controlled data (no CMS). Edit directly. `slug` must be
 * URL-safe and unique; it's used for anchors and inquiry subjects.
 *
 * `model: 'monthly'` facilities rent by the month; `'hourly'` by the hour.
 * `status: 'planned'` facilities render without rates or booking buttons.
 */

export type RateLine = {
  group: 'Room' | 'Staff'
  item: string
  price: string
}

export type Facility = {
  /** URL-safe unique id. Used for anchor links + inquiry subject. */
  slug: string
  name: string
  description: string
  model: 'monthly' | 'hourly'
  /** Not yet bookable — shown without rates or booking. */
  status?: 'planned'
  /** Display rate, e.g. "$400 / mo" or "From $30 / hr". */
  rate?: string
  rateNote?: string
  /** e.g. "8 desks total" */
  quantity?: string
  rateCard?: RateLine[]
  /** Image path under /public or full URL. Placeholder shown when omitted. */
  image?: string
}

export const facilitiesCopy = {
  lead: 'The clubhouse, room by room. Desks, band practice, a photo studio, and a mixing room — rent by the month or by the hour.',
  monthlyTitle: 'Monthly rental',
  monthlyLead:
    'Monthly members get keys, 24/7 access to the facilities, and half off hourly rooms.',
  hourlyTitle: 'Hourly rental',
  hourlyLead:
    'Standard booking hours are weekdays from 9-5. Evenings & weekends can typically be arranged with enough notice. Monthly members pay half the weekday rate, nights and weekends included.',
  plannedTitle: 'In the works',
}

export const storefrontCopy = {
  title: 'Consignment Shop',
  name: 'Online Store',
  rate: '25% of net',
  description:
    'An online store for members and friends of members. You make the work — we handle shipping, returns, customer service, and sales tax for 25% of the net profit on each sale.',
  note: 'Custom landing page included',
}

export const amenities = [
  'Drip coffee',
  'Milk',
  'Filtered water',
  'Seltzer',
  'Snacks',
  'Fast Wi-Fi',
  'Full kitchen',
]

export const facilities: Facility[] = [
  {
    slug: 'permanent-desk',
    name: 'Permanent desk',
    model: 'monthly',
    description:
      'An assigned space — bring your own furniture or use ours, set it up how you like, and leave it that way between visits.',
    quantity: '8 desks total',
    rate: '$400 / mo',
  },
  {
    slug: 'band-room',
    name: 'Band practice room',
    model: 'monthly',
    description:
      'One practice room, shared by four bands on a calendar. Drum kit (minus breakables), PA, mics, and mic stands provided.',
    quantity: '4 bands total',
    rate: '$200 / mo',
  },
  {
    slug: 'photo-studio',
    name: 'Photo studio',
    model: 'hourly',
    description:
      'Photo/video shooting space with backdrops and lighting (grip available). First 15 minutes of setup help are free; an assistant who knows the gear is available by the hour.',
    rate: 'From $30 / hr',
    rateNote: 'Two-hour minimum',
    rateCard: [
      { group: 'Room', item: 'Weekday · 9–5, Mon–Fri', price: '$30 / hr' },
      { group: 'Room', item: 'Evenings & weekends', price: '$40 / hr' },
      { group: 'Staff', item: 'Assistant (optional)', price: '$50 / hr' },
    ],
  },
  {
    slug: 'recording-studio',
    name: 'Mixing control room',
    model: 'hourly',
    description:
      'A control room for mixing with studio monitors, a Mac mini loaded with Pro Tools, and plugins. First 15 minutes of setup help are free; An engineer who knows the room is available by the hour.',
    rate: 'From $30 / hr',
    rateNote: 'Two-hour minimum',
    rateCard: [
      { group: 'Room', item: 'Weekday · 9–5, Mon–Fri', price: '$30 / hr' },
      { group: 'Room', item: 'Evenings & weekends', price: '$40 / hr' },
      { group: 'Staff', item: 'Engineer (optional)', price: '$50 / hr' },
    ],
  },
  // {
  //   slug: 'darkroom',
  //   name: 'Darkroom',
  //   model: 'hourly',
  //   status: 'planned',
  //   description:
  //     'A black-and-white darkroom for developing and printing — chemicals included.',
  // },
  // {
  //   slug: 'repair-bench',
  //   name: 'Electronics & guitar bench',
  //   model: 'hourly',
  //   status: 'planned',
  //   description:
  //     'A workbench with the necessary tools and materials for fixing electronics and setting up instruments.',
  // },
]
