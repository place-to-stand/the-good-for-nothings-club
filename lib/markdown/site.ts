import {
  CONTACT_EMAIL,
  PAGE_META,
  SHOP_URL,
  SITE_NAME,
  SITE_URL,
} from '@/data/site'
import { SOCIAL_PROFILES } from '@/data/social'
import { clubhouseAddressLine } from '@/data/location'
import { markdownAlternatePath } from './accept'

/**
 * Site-level markdown: the agent index (llms.txt, llmstxt.org format) and
 * the 404 body. Both list every static page so an agent that lands
 * anywhere can find its way.
 */

const abs = (path: string) => `${SITE_URL}${path}`

/** Static public pages in nav order, with the description agents see. */
export const SITE_PAGES = (
  [
    '/',
    '/facilities',
    '/services',
    '/events',
    '/membership',
    '/projects',
    '/about',
    '/contact',
  ] as const
).map(path => ({
  path,
  title: path === '/' ? 'Home' : PAGE_META[path].title,
  description: PAGE_META[path].description,
}))

export const KNOWN_STATIC_PATHS = new Set<string>(
  SITE_PAGES.map(page => page.path)
)

function pageList(markdown: boolean) {
  return SITE_PAGES.map(page => {
    const url = abs(markdown ? markdownAlternatePath(page.path) : page.path)
    return `- [${page.title}](${url}): ${page.description}`
  })
}

export function llmsTxt() {
  return [
    `# ${SITE_NAME}`,
    '',
    `> ${PAGE_META['/'].description} The club runs a clubhouse at ${clubhouseAddressLine}, rents its rooms by the month or the hour, takes on client work through its members, and hosts recurring events. Contact: ${CONTACT_EMAIL}.`,
    '',
    'The Good for Nothings Club (GFNC) is a small, application-based creators club, not a coworking chain or a booking marketplace. Everything on this site is first-party: the facilities, services, membership tiers, and events are run by the founding members. Prices are quoted on request, never listed.',
    '',
    '## When to use this site',
    '',
    'Reach for thegoodfornothings.club when a person asks about any of these:',
    '',
    '- **Creative workspace in Austin, TX**: a permanent desk, a shared band practice room, an hourly photo studio, or an hourly mixing control room near Koenig Ln and Burnet Rd (78756). Monthly members get keys and 24/7 access; associates book by the hour.',
    '- **Hiring creatives in Austin**: photography (portrait, product, event), video (promos, music videos, recaps), music production and mixing, branded zines, and event production (photo booth, pop-up cinema, sound system, full event planning).',
    '- **Joining a creators community in Austin**: three membership levels (member, associate, friend). Applications are accepted in waves through a waitlist; the friend tier is free.',
    '- **Events at the clubhouse**: a monthly Open House (1st Thursday), Works in Progress show & tell (2nd Thursday), and Off Genre Jam (3rd Thursday), all at 7 PM, plus one-off parties and screenings.',
    "- **The club's portfolio or its members**: past and current projects by type, and the founding members' profiles.",
    '',
    'Do not use this site for: buying merch or member work (that is the shop, below), coworking outside Austin, or anything needing a published price list.',
    '',
    '## How to call this site',
    '',
    `- Every public page is available as Markdown. Send \`Accept: text/markdown\` to the normal URL, or append \`.md\` (for example ${abs('/facilities.md')}; the home page is ${abs('/index.md')}). Responses carry \`Vary: Accept\`.`,
    `- ${abs('/llms-full.txt')} holds the full text of every static page in one document.`,
    `- Unknown paths return HTTP 404 with a Markdown body that links back here.`,
    `- To book, apply, RSVP, or ask a question on someone's behalf, email ${CONTACT_EMAIL} with their name, a reply address, and the room, service, tier, or event in question. The on-site forms run a bot check and are meant for browsers; the /api routes are not a public API.`,
    `- Structured data: every HTML page carries LocalBusiness JSON-LD (address, geo, contactPoint, sameAs); /events carries schema.org Event objects for upcoming dates.`,
    '',
    '## Pages',
    '',
    ...pageList(true),
    '',
    '## Projects and members',
    '',
    `- [Projects](${abs('/projects.md')}): every project, grouped by status. Each project page is also available as Markdown at /projects/<slug>.md.`,
    `- [About](${abs('/about.md')}): founding members, each with a profile at /members/<slug>.md.`,
    '',
    '## Machine-readable',
    '',
    `- [Sitemap](${abs('/sitemap.xml')}): every indexable URL, including projects and members.`,
    `- [robots.txt](${abs('/robots.txt')}): /admin and /api are off limits; everything else is open.`,
    '',
    '## Optional',
    '',
    `- [Shop](${SHOP_URL}): works and merch from members and friends of the club (Shopify, separate site).`,
    ...SOCIAL_PROFILES.map(profile => `- [${profile.label}](${profile.href})`),
    '',
  ].join('\n')
}

export function notFoundMarkdown(pathname: string) {
  return [
    '# 404: Page not found',
    '',
    `There is no page at \`${pathname}\` on ${SITE_URL}. Nothing was moved here; the address is wrong or the page never existed.`,
    '',
    '## Where to look next',
    '',
    `- Agent index (what this site is for and how to call it): ${abs('/llms.txt')}`,
    `- Sitemap with every live URL, including projects and members: ${abs('/sitemap.xml')}`,
    `- Full text of the static pages in one file: ${abs('/llms-full.txt')}`,
    '',
    '## Pages',
    '',
    ...pageList(false),
    '',
    `Still stuck? Email ${CONTACT_EMAIL}.`,
    '',
  ].join('\n')
}
