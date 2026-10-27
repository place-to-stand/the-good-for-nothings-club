/** Site-wide constants shared by metadata, JSON-LD, markdown, and llms.txt. */
export const SITE_URL = 'https://thegoodfornothings.club'
export const SITE_NAME = 'The Good for Nothings Club'
export const CONTACT_EMAIL = 'hello@thegoodfornothings.club'
/** The shop lives on this site at /shop (Shopify runs checkout only). */
export const SHOP_PATH = '/shop'
export const SHOP_URL = `${SITE_URL}${SHOP_PATH}`

/**
 * Appended to every page's <title> except the home page (app/layout.tsx
 * template). Kept short so the words before it can say what the page
 * offers and where.
 */
export const TITLE_SUFFIX = ' | Good for Nothings Club'

/**
 * Title + meta description for every static public page. `title` is the
 * short name used in the 404 tiles, markdown views, and llms.txt.
 * `searchTitle` is what search results show: it names what the page
 * offers and the city, because that is what people type. With
 * TITLE_SUFFIX it must stay ≤ 60 chars, and descriptions ≤ 158
 * (tests/site.test.ts and scripts/seo-check.mjs enforce both).
 */
export const PAGE_META = {
  '/': {
    title: 'Austin Creators Club & Studios | The Good for Nothings Club',
    searchTitle: 'Austin Creators Club & Studios | The Good for Nothings Club',
    description:
      'The Good for Nothings Club (GFNC) is a creators club in Austin, TX, with studios, rehearsal rooms, and workspace for musicians, photographers, and filmmakers.',
  },
  '/facilities': {
    title: 'Facilities',
    searchTitle: 'Studio & Rehearsal Space in Austin',
    description:
      'The clubhouse, room by room - permanent desks, band practice, photo studio, and recording control room in Austin, TX. Monthly and hourly rental.',
  },
  '/services': {
    title: 'Services',
    searchTitle: 'Photo & Video Production in Austin',
    description:
      'You bring the project, we make it — photography, video, music production, zines, photo booths, pop-up cinema, and event production in Austin, TX.',
  },
  '/events': {
    title: 'Events',
    searchTitle: 'Creative Events & Jams in Austin',
    description:
      'The club, in session - regular happenings at the clubhouse in Austin, TX. Members and friends of members welcome.',
  },
  '/membership': {
    title: 'Membership',
    searchTitle: 'Creative Club Membership, Austin',
    description:
      'Join the club, at your level - member, associate, or friend. Apply anytime to join the waitlist; onboarding happens in waves as space opens up.',
  },
  '/projects': {
    title: 'Projects',
    searchTitle: 'Projects & Portfolio',
    description:
      'Web, video, photo, audio, event, and build projects made by the members of The Good for Nothings Club — the portfolio of an Austin, TX creators club.',
  },
  '/about': {
    title: 'About',
    searchTitle: 'About the Club',
    description:
      'Who we are, what happens at the clubhouse, and the founding members behind The Good for Nothings Club — a creators club making everything in Austin, TX.',
  },
  '/contact': {
    title: 'Contact',
    searchTitle: 'Contact & Clubhouse Location',
    description:
      'Get in touch with The Good for Nothings Club — email, social links, and the clubhouse location in Austin, TX. Send a message about projects or membership.',
  },
} as const satisfies Record<
  string,
  { title: string; searchTitle: string; description: string }
>

export type StaticPath = keyof typeof PAGE_META

/** Title + description for a static page's generateMetadata. */
export function searchMeta(path: StaticPath) {
  const { searchTitle, description } = PAGE_META[path]
  return { title: searchTitle, description }
}

/**
 * 404 copy, shared by app/(site)/not-found.tsx (HTML) and lib/markdown/site.ts
 * (markdown 404 body). The HTML page shows the number big, one serif
 * line, two buttons, and a grid of section tiles whose descriptions
 * (PAGE_META) appear on hover.
 */
export const notFoundCopy = {
  title: '404',
  markdownTitle: '404: Page not found',
  lead: 'There is no page at this address. The link is wrong, or the page never existed.',
  backHome: 'Back to the clubhouse',
  emailUs: 'Email us',
  nextTitle: 'Where to look next',
  robotsLabel: 'For robots',
  stillStuck: 'Still stuck? Email',
}
