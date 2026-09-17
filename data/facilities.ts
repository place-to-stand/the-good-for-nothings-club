/**
 * Facilities - the clubhouse, room by room.
 *
 * Plain, version-controlled data (no CMS). Edit directly. `slug` must be
 * URL-safe and unique; it's used for anchors and inquiry subjects.
 *
 * `model: 'monthly'` facilities rent by the month; `'hourly'` by the hour.
 * `status: 'planned'` facilities render without booking buttons.
 */

export type Facility = {
  /** URL-safe unique id. Used for anchor links + inquiry subject. */
  slug: string
  name: string
  description: string
  model: 'monthly' | 'hourly'
  /** Not yet bookable - shown without booking. */
  status?: 'planned'
  /** Booking terms, e.g. "Two-hour minimum". */
  note?: string
  /** e.g. "4 desks total" */
  quantity?: string
  /** Image path under /public or full URL. Card renders without a photo when omitted. */
  image?: string
  /** Alt text for the image. */
  imageAlt?: string
}

export const facilitiesCopy = {
  lead: 'The clubhouse, room by room. Desks, band practice, photo studio, mixing room, and consignment shop - rented by the month or by the hour.',
  monthlyTitle: 'Monthly rental',
  monthlyLead:
    'Monthly members get keys, 24/7 access to the facilities, and half off hourly rooms.',
  hourlyTitle: 'Hourly rental',
  hourlyLead:
    'Standard booking hours are weekdays from 9-5. Evenings & weekends can typically be arranged with enough notice. Monthly members pay half the weekday rate, nights and weekends included.',
  plannedTitle: 'In the works',
  amenitiesTitle: 'The Clubhouse is stocked with',
  /** Markdown view only: what replaces the booking dialogs for agents. */
  agentNote:
    'Monthly rentals need a membership application; hourly rooms need an associate booking. Apply on the membership page or email us.',
}

export const storefrontCopy = {
  title: 'Consignment Shop',
  name: 'Online Store',
  description:
    'An online store for members and associates. You make the work - we handle shipping, returns, customer service, and sales tax for a percentage of each sale.',
  note: 'Custom landing page included',
  image: '/facilities/online-store.jpg',
  imageAlt:
    'GFNC hats, club t-shirts, LIMO magazines, and member-made merch laid out on a table',
}

export const amenities = [
  'Drip coffee',
  'Creamer',
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
      'An assigned space - bring your own furniture or use ours, set it up how you like, and leave it that way between visits.',
    quantity: '4 desks total',
    image: '/facilities/permanent-desk.jpg',
    imageAlt:
      'Desks with monitors and task chairs in the shared workspace at the clubhouse',
  },
  {
    slug: 'band-room',
    name: 'Band practice room',
    model: 'monthly',
    description:
      'One practice room, shared by four bands on a calendar. Drum kit (minus breakables), PA, mics, and mic stands provided.',
    quantity: '4 bands total',
    image: '/facilities/band-room.jpg',
    imageAlt:
      'Band practice room with drum kit, mics, guitars on the wall, and a Fender bass rig',
  },
  {
    slug: 'photo-studio',
    name: 'Photo studio',
    model: 'hourly',
    description:
      'Photo/video shooting space with backdrops and lighting (grip available). First 15 minutes of setup help are free; an assistant who knows the gear is available by the hour.',
    note: 'Two-hour minimum',
    image: '/facilities/photo-studio.jpg',
    imageAlt:
      'Photo studio with seamless paper backdrops, a softbox light, and apple boxes',
  },
  {
    slug: 'recording-studio',
    name: 'Mixing control room',
    model: 'hourly',
    description:
      'A control room for mixing with studio monitors, a Mac mini loaded with Pro Tools, and plugins. First 15 minutes of setup help are free; An engineer who knows the room is available by the hour.',
    note: 'Two-hour minimum',
    image: '/facilities/recording-studio.jpg',
    imageAlt:
      'Mixing control room with studio monitors, a Pro Tools session on screen, and outboard gear',
  },
  // {
  //   slug: 'darkroom',
  //   name: 'Darkroom',
  //   model: 'hourly',
  //   status: 'planned',
  //   description:
  //     'A black-and-white darkroom for developing and printing - chemicals included.',
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
