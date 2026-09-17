/**
 * Services - hire club members and their extended network.
 *
 * Plain, version-controlled data (no CMS). Edit directly. `slug` must be
 * URL-safe and unique; it's used for anchors and inquiry subjects.
 */

export type ServiceCategoryKey = 'visual' | 'audio' | 'print' | 'av'

export type Service = {
  /** URL-safe unique id. Used for anchor links + inquiry subject. */
  slug: string
  name: string
  blurb: string
  category: ServiceCategoryKey
  /** Inquiry button label; defaults to "Start a project". */
  cta?: string
  /** What the service covers, listed under the blurb. */
  items?: string[]
}

export const servicesCopy = {
  lead: 'You bring the project. We make it. Hire club members and their extended network of multimedia creatives to make your project happen.',
  /** Inquiry dialog blurb on the services page. */
  inquiryDescription:
    "Tell us what you have in mind and we'll get back to you with a quote.",
  /** Markdown view only: what replaces the inquiry dialogs for agents. */
  agentNote:
    'To start a project, use the inquiry form on the services page or email us with what you have in mind. We reply with a quote.',
  categories: [
    {
      key: 'visual' as const,
      title: 'Visual',
      lead: 'Photo and video - shot, edited, and delivered ready to use.',
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
    items: ['Portrait', 'Product / promo', 'Event coverage'],
  },
  {
    slug: 'video',
    cta: 'Plan a video',
    name: 'Video',
    category: 'visual',
    blurb:
      'Music videos, promos, and event recaps - shot on modern or vintage gear, filmed and cut into something you can use immediately.',
    items: ['Product / promo', 'Event coverage', 'Music video'],
  },
  {
    slug: 'music',
    cta: 'Start a song',
    name: 'Music production',
    category: 'audio',
    blurb:
      'Mixing, production, and writing with people who live in the studio.',
    items: ['Mixing', 'Production', 'Composition'],
  },
  {
    slug: 'zines',
    cta: 'Start a zine',
    name: 'Branded zines',
    category: 'print',
    blurb:
      "We publish LIMO, our own quarterly art zine, and we'll do the same for your company end to end - concept, design, layout, and the printed run.",
  },
  {
    slug: 'photo-booth',
    cta: 'Book the booth',
    name: 'Photo booth',
    category: 'av',
    blurb:
      'A real photographer with a DSLR behind pro lighting with instant prints - not a vending-machine booth.',
  },
  {
    slug: 'cinema',
    cta: 'Plan a movie night',
    name: 'Pop-up cinema',
    category: 'av',
    blurb:
      'Projector, big screen, and sound, set up and run wherever you want it - backyard, rooftop, or indoors. Movie night without the hassle.',
  },
  {
    slug: 'sound-system',
    cta: 'Book sound',
    name: 'Sound system',
    category: 'av',
    blurb:
      'A PA sized to your room and an engineer to run it, so the show sounds right and you never touch a knob. Includes setup, operation, and teardown.',
  },
  {
    slug: 'event-planning',
    cta: 'Plan your event',
    name: 'Event planning',
    category: 'av',
    blurb:
      "We've thrown indoor and outdoor parties with live music and vendors, plus outdoor movie nights - and we'll plan and run yours end to end, from space and gear to staffing. Tell us what you have in mind and we'll quote it.",
  },
]
