/** Site-wide constants shared by metadata, JSON-LD, markdown, and llms.txt. */
export const SITE_URL = 'https://thegoodfornothings.club'
export const SITE_NAME = 'The Good for Nothings Club'
export const CONTACT_EMAIL = 'hello@thegoodfornothings.club'
export const SHOP_URL = 'https://shop.thegoodfornothings.club/'

/**
 * Title + meta description for every static public page. The page files
 * read these for generateMetadata; lib/markdown reads them for the
 * markdown views and llms.txt, so the two never drift. Descriptions must
 * stay ≤ 158 chars (scripts/seo-check.mjs enforces it in production).
 */
export const PAGE_META = {
  '/': {
    title: 'Creators club in ATX | The Good for Nothings Club',
    description:
      'A creators club in Austin, TX — musicians, photographers, writers, filmmakers, and engineers with studios, rehearsal rooms, and workspace under one roof.',
  },
  '/facilities': {
    title: 'Facilities',
    description:
      'The clubhouse, room by room - permanent desks, band practice, photo studio, and recording control room in Austin, TX. Monthly and hourly rental.',
  },
  '/services': {
    title: 'Services',
    description:
      'You bring the project, we make it — photography, video, music production, zines, photo booths, pop-up cinema, and event production in Austin, TX.',
  },
  '/events': {
    title: 'Events',
    description:
      'The club, in session - regular happenings at the clubhouse in Austin, TX. Members and friends of members welcome.',
  },
  '/membership': {
    title: 'Membership',
    description:
      'Join the club, at your level - member, associate, or friend. Apply anytime to join the waitlist; onboarding happens in waves as space opens up.',
  },
  '/projects': {
    title: 'Projects',
    description:
      'Web, video, photo, audio, event, and build projects made by the members of The Good for Nothings Club — the portfolio of an Austin, TX creators club.',
  },
  '/about': {
    title: 'About',
    description:
      'Who we are, what happens at the clubhouse, and the founding members behind The Good for Nothings Club — a creators club making everything in Austin, TX.',
  },
  '/contact': {
    title: 'Contact',
    description:
      'Get in touch with The Good for Nothings Club — email, social links, and the clubhouse location in Austin, TX. Send a message about projects or membership.',
  },
} as const satisfies Record<string, { title: string; description: string }>

export type StaticPath = keyof typeof PAGE_META
