/**
 * Facilities — the physical space and what's available to rent.
 *
 * This is plain, version-controlled data (no CMS). Edit it directly — add,
 * remove, or reorder entries and the /facilities page updates on the next
 * build. Keep `slug` URL-safe and unique; it's used for anchors and as the
 * subject line when someone inquires about a specific space.
 */

export type Facility = {
  /** URL-safe unique id. Used for anchor links + inquiry subject. */
  slug: string
  name: string
  /** One-line hook shown under the name. */
  tagline: string
  /** Longer description. Each string renders as its own paragraph. */
  description: string[]
  /** Bulleted highlights (what's included / specs). */
  features: string[]
  /** Human-readable rate, e.g. "$25 / hour" or "From $150 / day". Optional. */
  rate?: string
  /** Max occupancy or size note, e.g. "Seats 12" or "400 sq ft". Optional. */
  capacity?: string
  /**
   * Image path under /public (e.g. "/facilities/studio.jpg") OR a full URL.
   * Optional — the page renders a clean placeholder when omitted, so you can
   * publish before photos exist.
   */
  image?: string
  /** Show an "Inquire" button for this space. Defaults to true. */
  inquiryEnabled?: boolean
}

export const facilities: Facility[] = [
  {
    slug: 'main-studio',
    name: 'Main Studio',
    tagline: 'Our flexible flagship room for shoots, sessions, and gatherings.',
    description: [
      'The Main Studio is the heart of the space — an open, configurable room that adapts to whatever you bring to it, from photo and video shoots to workshops and member meetups.',
      'Natural light, blackout options, and plenty of floor space make it equally at home for a product shoot or a 30-person event.',
    ],
    features: [
      'Open, reconfigurable floor plan',
      'Controllable natural + blackout lighting',
      'High-speed Wi-Fi',
      'Access to shared kitchen + restrooms',
    ],
    rate: 'From $40 / hour',
    capacity: 'Up to 30 people',
    inquiryEnabled: true,
  },
  {
    slug: 'recording-room',
    name: 'Recording Room',
    tagline: 'A treated room for music, voiceover, and podcasting.',
    description: [
      'An acoustically treated space built for capturing clean audio, whether you are tracking music, recording a podcast, or cutting voiceover.',
    ],
    features: [
      'Acoustic treatment + isolation',
      'Monitor speakers available',
      'Bring-your-own or on-site interface',
      'Quiet, dedicated entrance',
    ],
    rate: 'From $30 / hour',
    capacity: 'Seats 4',
    inquiryEnabled: true,
  },
  {
    slug: 'workshop-bench',
    name: 'Workshop & Maker Bench',
    tagline: 'Hands-on space for building, prototyping, and making a mess.',
    description: [
      'A practical work area for physical projects — prototyping, set building, props, and general making. Designed to be used, not babied.',
    ],
    features: [
      'Durable work surfaces',
      'Shared hand tools',
      'Ample power + ventilation',
      'Storage for works in progress',
    ],
    rate: 'From $20 / hour',
    capacity: 'Up to 6 people',
    inquiryEnabled: true,
  },
  {
    slug: 'desk-day-pass',
    name: 'Day Desk',
    tagline: 'Drop in and work alongside the club for the day.',
    description: [
      'A single desk and a power outlet when you just need a focused place to work for a few hours, surrounded by people doing the same.',
    ],
    features: [
      'Dedicated desk for the day',
      'High-speed Wi-Fi',
      'Coffee + shared kitchen',
      'Member community on-site',
    ],
    rate: '$15 / day',
    capacity: 'Single desk',
    inquiryEnabled: true,
  },
]
