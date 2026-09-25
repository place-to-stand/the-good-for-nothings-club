import { SHOP_URL } from './site'

/**
 * About page copy. Plain, version-controlled data (no CMS). Edit directly.
 *
 * Read by app/(site)/about/page.tsx (HTML) and lib/markdown/pages.ts (markdown).
 * Keep prose here, not in the page file (see tests/copySource.test.ts).
 */
export const aboutCopy = {
  lead: 'The Good for Nothings Club is a creators club based in Austin, TX made up of musicians, photographers, writers, filmmakers, and engineers.',
  overviewTitle: 'Overview',
  overview:
    "The club started as a weekly accountability meeting between friends and grew into a clubhouse: studios, rehearsal rooms, and workspace under one roof. Today it runs as a members' creative space for Austin. Monthly members get keys and full run of the house, associates book the rooms by the hour, and friends of the club come out for the events. Membership isn't about who you know. It's about making things and contributing to the space. We accept applications in waves, so the community grows deliberately around people who actually show up, and each new wave has time to make the place their own. The point was never scale. It's keeping the space sustainable and the work flowing.",
  happensTitle: 'What happens here',
}

export type AboutItem = {
  href: string
  /** The linked words at the start of the item. */
  link: string
  /** The rest of the sentence, including its leading space or comma. */
  rest: string
  external?: boolean
}

/** "What happens here", in display order. */
export const aboutItems: AboutItem[] = [
  {
    href: '/facilities',
    link: 'The clubhouse',
    rest: ' rents desks, band practice slots, a photo studio, and a mixing control room.',
  },
  {
    href: '/services',
    link: 'Club members take on client work',
    rest: ' for photo, video, music, print, and events.',
  },
  {
    href: '/events',
    link: 'Regular events',
    rest: ', including a monthly show & tell for works in progress.',
  },
  {
    href: '/membership',
    link: 'Membership',
    rest: ' at three levels: member, associate, and friend.',
  },
  {
    href: SHOP_URL,
    link: 'The shop',
    rest: ' carries works and merch from members and friends of the club.',
    external: true,
  },
  {
    href: '/contact',
    link: 'Got an idea?',
    rest: ' Reach out to see if we can make it happen.',
  },
]
