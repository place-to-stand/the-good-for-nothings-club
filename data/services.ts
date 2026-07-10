/**
 * Services — hire club members and their extended network.
 *
 * Plain, version-controlled data (no CMS). Edit directly. `slug` must be
 * URL-safe and unique; it's used for anchors and inquiry subjects.
 */

export type ServiceCategoryKey = 'visual' | 'audio' | 'print' | 'av'

export type ServiceItem = {
  /** e.g. "At the clubhouse" / "On-site" — omit when there's no grouping. */
  group?: string
  label: string
  price: string
}

export type Service = {
  /** URL-safe unique id. Used for anchor links + inquiry subject. */
  slug: string
  name: string
  blurb: string
  price: string
  category: ServiceCategoryKey
  /** Inquiry button label; defaults to "Start a project". */
  cta?: string
  detail?: string
  items?: ServiceItem[]
}

export const servicesCopy = {
  lead: 'Hire club members and their extended network of multimedia creatives to make your project happen.',
  categories: [
    {
      key: 'visual' as const,
      title: 'Visual',
      lead: 'Photo and video — shot, edited, and delivered ready to use.',
    },
    {
      key: 'audio' as const,
      title: 'Audio',
      lead: 'Songs made with you, starting anywhere from a rough demo to the final tracks.',
    },
    {
      key: 'print' as const,
      title: 'Print',
      lead: 'Custom zines, designed in-house and sent off to print.',
    },
    {
      key: 'av' as const,
      title: 'AV & events',
      lead: 'Professional gear and an operator, brought to your event.',
    },
  ],
}

export const services: Service[] = [
  {
    slug: 'photography',
    cta: 'Book a shoot',
    name: 'Photography',
    category: 'visual',
    blurb:
      'From headshots and lookbooks at the studio to your event covered end to end. We can shoot digital or film, with vintage gear on hand when needed.',
    price: 'From $250',
    items: [
      { group: 'At the clubhouse', label: 'Portrait', price: 'From $250' },
      {
        group: 'At the clubhouse',
        label: 'Product / promo',
        price: 'From $300',
      },
      { group: 'On-site', label: 'Event coverage', price: 'From $250' },
      { group: 'On-site', label: 'Portrait', price: 'From $300' },
      { group: 'On-site', label: 'Product / promo', price: 'From $350' },
    ],
  },
  {
    slug: 'video',
    cta: 'Plan a video',
    name: 'Video',
    category: 'visual',
    blurb:
      'Music videos, promos, and event recaps — shot on modern or vintage gear, filmed and cut into something you can use immediately.',
    price: 'From $400',
    items: [
      {
        group: 'At the clubhouse',
        label: 'Product / promo',
        price: 'From $400',
      },
      { group: 'On-site', label: 'Event coverage', price: 'From $400' },
      { group: 'On-site', label: 'Product / promo', price: 'From $450' },
      { group: 'On-site', label: 'Music video', price: 'From $1000' },
    ],
  },
  {
    slug: 'music',
    cta: 'Start a song',
    name: 'Music production',
    category: 'audio',
    blurb:
      'Mixing, production, and writing with people who live in the studio.',
    price: 'From $300',
    items: [
      { label: 'Mixing', price: '$300 / song' },
      { label: 'Production', price: 'By quote' },
      { label: 'Composition', price: 'By quote' },
    ],
  },
  {
    slug: 'zines',
    cta: 'Start a zine',
    name: 'Branded zines',
    category: 'print',
    blurb:
      "We publish LIMO, our own quarterly art zine, and we'll do the same for your company end to end — concept, design, layout, and the printed run.",
    price: 'From $1,000',
  },
  {
    slug: 'photo-booth',
    cta: 'Book the booth',
    name: 'Photo booth',
    category: 'av',
    blurb:
      'A real photographer with a DSLR behind pro lighting with instant prints — not a vending-machine booth.',
    price: 'From $150 / hr',
  },
  {
    slug: 'cinema',
    cta: 'Plan a movie night',
    name: 'Pop-up cinema',
    category: 'av',
    blurb:
      'Projector, big screen, and sound, set up and run wherever you want it — backyard, rooftop, or indoors. Movie night without the hassle.',
    price: 'From $400',
  },
  {
    slug: 'sound-system',
    cta: 'Book sound',
    name: 'Sound system + operator',
    category: 'av',
    blurb:
      'A PA sized to your room and an engineer to run it, so the show sounds right and you never touch a knob.',
    price: 'From $400',
    detail: 'Includes setup, operation, and teardown.',
  },
  {
    slug: 'event-planning',
    cta: 'Plan your event',
    name: 'Event planning',
    category: 'av',
    blurb:
      "We've thrown indoor and outdoor parties with live music and vendors, plus outdoor movie nights — and we'll plan and run yours end to end, from space and gear to staffing. Tell us what you have in mind and we'll quote it.",
    price: 'From $1,000',
  },
]
