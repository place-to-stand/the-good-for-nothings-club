import { SHOP_URL } from './site'

/**
 * Homepage copy. Plain, version-controlled data (no CMS). Edit directly.
 *
 * Read by app/page.tsx (HTML) and lib/markdown/pages.ts (markdown), so
 * one edit updates both views. Keep prose here, not in the page file -
 * tests/copySource.test.ts fails the build if it finds prose in JSX.
 */
export const homeCopy = {
  /** The visually hidden <h1>; the wordmark image carries it visually. */
  heading: 'Good For Nothings',
  /** Intro sentence, split so the HTML can set the club name in italics. */
  introName: 'The Good for Nothings Club',
  introBody:
    'is a creators club based in Austin, TX made up of musicians, photographers, writers, filmmakers, and engineers. Our clubhouse puts studios, rehearsal rooms, and workspace under one roof. Good for nothings. Making everything.',
  learnMore: 'Learn More',
  offeringTitle: 'What we offer',
  findUsTitle: 'Find Us Online',
}

export type HomeOffering = {
  href: string
  title: string
  body: string
  external?: boolean
}

/** The offering cards, in display order. */
export const homeOffering: HomeOffering[] = [
  {
    href: '/facilities',
    title: 'Facilities',
    body: 'Rent the clubhouse by the month or by the hour.',
  },
  {
    href: '/services',
    title: 'Services',
    body: 'You bring the project. We make it.',
  },
  {
    href: '/events',
    title: 'Events',
    body: 'The clubhouse, in session - friends of the club welcome.',
  },
  {
    href: '/membership',
    title: 'Membership',
    body: 'Join the club, at the level that makes sense for you.',
  },
  {
    href: SHOP_URL,
    title: 'Shop',
    body: 'Works and merch from members and friends of the club.',
    external: true,
  },
]
