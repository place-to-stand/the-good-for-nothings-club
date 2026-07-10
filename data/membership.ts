/**
 * Membership — three levels, application-based, accepted in waves.
 *
 * Plain, version-controlled data (no CMS). Edit directly.
 */

export type MembershipTier = {
  /** URL-safe unique id. Used for anchors + application subject. */
  slug: string
  name: string
  tagline: string
  /** e.g. "Everything in associate and friend, plus:" */
  includes?: string
  perks: string[]
  /** Display price line, e.g. "Free". Omit when pricing is the rental itself. */
  price?: string
}

export const membershipCopy = {
  lead: 'Three levels, each with its own perks. Apply anytime to join the waitlist — onboarding happens in waves as space opens up.',
  tiersTitle: 'Tiers',
  tiersLead:
    "Apply anytime to join the waitlist — onboarding happens in waves as space opens up.  Since space is limited, acceptance isn't guaranteed.",
  joiningTitle: 'How to join',
  joining: [
    {
      label: 'Apply',
      points: [
        'Pick your level and tell us about yourself and what you make',
        'Your application claims your spot on the waitlist',
      ],
    },
    {
      label: 'We reach out',
      points: [
        'Applications are accepted in waves as space opens up',
        "Associates and members come by for a tour and a conversation first — so both sides can be sure it's a fit",
        'Friends go straight to a Discord invite',
      ],
    },
    {
      label: 'Get onboarded',
      points: [
        'Sign the paperwork for your level',
        'Get your access and jump into the club Discord',
      ],
    },
  ],
  policies: [
    {
      label: 'Paperwork',
      points: [
        'Members sign a rental agreement and liability waiver before keys are issued',
        'Associates sign a liability waiver before their first booking',
      ],
    },
    {
      label: 'Moving up',
      points: [
        'Active associates get priority consideration when a desk or band slot opens up',
      ],
    },
    {
      label: 'Our community channels, your work',
      points: [
        "Members can be featured in the club newsletter and across our social. Both go out on a regular cadence, and we ask what you'd like included before each one does.",
      ],
    },
    {
      label: 'A members only chatroom',
      points: [
        'An always-on space to organize, trade feedback, ask for a hand, and find collaborators across disciplines.',
      ],
    },
  ],
}

/** Descending: monthly commitment → pay-as-you-go → free connection. */
export const membershipTiers: MembershipTier[] = [
  {
    slug: 'member',
    name: 'Member',
    tagline:
      'A monthly rental commitment — a permanent desk or a band practice slot — and full run of the clubhouse.',
    price: 'From $200 / mo',
    includes: 'Includes everything in associate, plus:',
    perks: [
      'Keys and 24/7 access to the clubhouse',
      '50% off hourly facility rates',
      'A members only space in the club Discord',
    ],
  },
  {
    slug: 'associate',
    name: 'Associate',
    tagline:
      'Pay-as-you-go use of the facilities and services, without a monthly commitment.',
    price: 'Pay as you go',
    includes: 'Includes everything in friend, plus:',
    perks: [
      'Hourly access to the clubhouse and its facilities',
      'An associates only space in the club Discord',
    ],
  },
  {
    slug: 'friend',
    name: 'Friend',
    tagline: 'A connection to the club and its community, all for free.',
    price: 'Free',
    includes: 'Includes:',
    perks: [
      'Invitations to events and open houses',
      'Access to community Discord channels',
    ],
  },
]
