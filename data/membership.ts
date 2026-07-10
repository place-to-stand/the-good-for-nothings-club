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
      text: 'Pick your level and tell us about yourself and what you make.',
    },
    {
      label: 'We reach out',
      text: "Applications are accepted in waves as space opens up. Associates and members come by for a tour and a conversation first — so both sides can be sure it's a fit. Friends go straight to a Discord invite.",
    },
    {
      label: 'Get onboarded',
      text: 'Sign the paperwork for your level, get your access, and jump into the club Discord.',
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
  ],
  moreTitle: 'More than a room',
  moreCards: [
    {
      title: 'Our community channels, your work',
      body: "Members can be featured in the club newsletter and across our social. Both go out on a regular cadence, and we ask what you'd like included before each one does.",
    },
    {
      title: 'A members only chatroom',
      body: 'An always-on space to organize, trade feedback, ask for a hand, and find collaborators across disciplines.',
    },
    {
      title: 'Consignment shop',
      body: 'An online store for members and friends of members. You make the work — we handle shipping, returns, customer service, and Texas sales tax for 25% of the net profit on each sale. Every seller receives a custom landing page to link to.',
    },
  ],
  earningTitle: 'How members earn',
  earningIntro:
    "When a paid project comes in, it's offered down the membership list by tenure — the longest-standing members get right of first refusal, and if they pass it moves to the next person.",
  splits: [
    {
      label: 'Hourly facilities fees',
      value: '50% to the club, 50% to the member working',
    },
    {
      label: 'Hourly assistant fees',
      value: '100% to the member assisting',
    },
    {
      label: 'Service work',
      value:
        '75% to the person doing the work · 25% to the club for admin + equipment',
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
