import { SHOP_PATH } from './site'

/**
 * Homepage copy. Plain, version-controlled data (no CMS). Edit directly.
 *
 * Read by app/(site)/page.tsx (HTML) and lib/markdown/pages.ts (markdown), so
 * one edit updates both views. Keep prose here, not in the page file -
 * tests/copySource.test.ts fails the build if it finds prose in JSX.
 */
export const homeCopy = {
  /** The visually hidden <h1>; the wordmark image carries it visually. */
  heading: 'Good For Nothings',
  /**
   * The first words under the wordmark (StoryCore primary headline), split
   * so the HTML can set "going to" in the glitch face of the wordmark.
   */
  headline: ['You said you were', 'going to', 'make it.'] as const,
  /** Where the name comes from, then what the club does about it. */
  story: [
    "But they said there's no money in it. The band, the film, the zine. Just get a real job and quit being a good for nothing.",
    "So the idea waited. As a line in your notebook, a message from last month, a riff in a voice memo. Not for lack of talent, because alone at home there's always a reason to wait until tomorrow.",
  ],
  /** Final story paragraph, split so the HTML can set the club name in italics. */
  introName: 'The Good for Nothings Club',
  introBody:
    "is where you get work done today. It's a clubhouse in Austin, TX for musicians, photographers, writers, filmmakers, and engineers, with a photo and video studio, a mixing room, a practice space, desks, and plenty of gear. Somebody always asks what you're working on, and the thing gets made.",
  tagline: 'Good for nothings, making everything.',
  /** Named proof: the latest thing the club made together. */
  proofLabel: 'Made here lately',
  proofTitle: "It's Gone Viral",
  proof:
    'The official music video for So Many Cults, premiered September 2026.',
  proofCta: 'Watch on YouTube',
  proofUrl: 'https://www.youtube.com/watch?v=C68S9tG0csA',
  proofVideoId: 'C68S9tG0csA',
  proofCredits: [
    'Directed and edited by Chris Donahue',
    'Costumes, set, and choreography by Gabrielle Westfield',
    'Produced by Dave Pokk and Jason Desiderio',
  ],
  offeringTitle: 'What we offer',
  findUsTitle: 'Find Us Online',
}

export type HomeOffering = {
  href: string
  title: string
  body: string
  external?: boolean
}

/**
 * The offering cards, in display order: hire us, join, come to an event,
 * then the rooms and the shop. Each speaks to someone StoryCore names.
 */
export const homeOffering: HomeOffering[] = [
  {
    href: '/services',
    title: 'Services',
    body: "Photo, video, music, zines, and events, made by people who won't make you feel small for asking.",
  },
  {
    href: '/membership',
    title: 'Membership',
    body: "A key, a desk, or a band slot, and people who ask what you're working on.",
  },
  {
    href: '/events',
    title: 'Events',
    body: "Come by, meet the gang, and see what's getting made.",
  },
  {
    href: '/facilities',
    title: 'Facilities',
    body: 'Rent a room by the hour or the month.',
  },
  {
    href: SHOP_PATH,
    title: 'Shop',
    body: 'Records, zines, and merch from the club.',
  },
]
