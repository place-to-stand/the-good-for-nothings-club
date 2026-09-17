import {
  amenities,
  facilities,
  facilitiesCopy,
  storefrontCopy,
} from '@/data/facilities'
import { services, servicesCopy } from '@/data/services'
import { membershipCopy, membershipTiers } from '@/data/membership'
import {
  events,
  eventsCopy,
  formatOccurrenceDate,
  splitSpecialEvents,
  upcomingOccurrences,
} from '@/data/events'
import { leadershipCopy } from '@/data/leadership'
import { clubhouseAddressLine, clubhouseMapsUrl } from '@/data/location'
import {
  CONTACT_EMAIL,
  PAGE_META,
  SHOP_URL,
  SITE_NAME,
  SITE_URL,
} from '@/data/site'
import { SOCIAL_PROFILES } from '@/data/social'
import { markdownAlternatePath } from './accept'

/**
 * Markdown views of the static pages, built from the same data files the
 * HTML pages render. Served for `Accept: text/markdown` and at the `.md`
 * alternate URLs by app/markdown/[[...path]]/route.ts.
 */

export const abs = (path: string) => `${SITE_URL}${path}`

/** Standard footer: where this page sits and where to look next. */
export function pageFooter(path: string) {
  return [
    '---',
    '',
    `HTML version: ${abs(path)} · Markdown: ${abs(markdownAlternatePath(path))}`,
    `Site index for agents: ${abs('/llms.txt')} · Full text: ${abs('/llms-full.txt')} · Sitemap: ${abs('/sitemap.xml')}`,
    `${SITE_NAME} · ${clubhouseAddressLine} · ${CONTACT_EMAIL}`,
  ].join('\n')
}

function heading(title: string, description: string) {
  return [`# ${title}`, '', `> ${description}`, '']
}

/** Homepage sections in the order the HTML page shows them. */
export const HOME_OFFERING = [
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
  },
]

export function homeMarkdown() {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${PAGE_META['/'].description}`,
    '',
    'The Good for Nothings Club is a creators club based in Austin, TX made up of musicians, photographers, writers, filmmakers, and engineers. Our clubhouse puts studios, rehearsal rooms, and workspace under one roof. Good for nothings. Making everything.',
    '',
    `Learn more: ${abs('/about')}`,
    '',
    '## What we offer',
    '',
    ...HOME_OFFERING.map(card => {
      const url = card.href.startsWith('http') ? card.href : abs(card.href)
      return `- [${card.title}](${url}): ${card.body}`
    }),
    '',
    '## Find us online',
    '',
    ...SOCIAL_PROFILES.map(profile => `- [${profile.label}](${profile.href})`),
    '',
    pageFooter('/'),
  ]
  return lines.join('\n')
}

export function facilitiesMarkdown() {
  const monthly = facilities.filter(
    f => f.model === 'monthly' && f.status !== 'planned'
  )
  const hourly = facilities.filter(
    f => f.model === 'hourly' && f.status !== 'planned'
  )
  const planned = facilities.filter(f => f.status === 'planned')
  const card = (f: (typeof facilities)[number]) => {
    const meta = [f.quantity, f.note].filter(Boolean).join(' · ')
    return [
      `### ${f.name}`,
      '',
      meta ? `*${meta}*` : null,
      meta ? '' : null,
      f.description,
      '',
    ].filter((line): line is string => line !== null)
  }
  const lines = [
    ...heading('Facilities', facilitiesCopy.lead),
    `## ${facilitiesCopy.monthlyTitle}`,
    '',
    facilitiesCopy.monthlyLead,
    '',
    ...monthly.flatMap(card),
    `## ${facilitiesCopy.hourlyTitle}`,
    '',
    facilitiesCopy.hourlyLead,
    '',
    ...hourly.flatMap(card),
  ]
  if (planned.length > 0) {
    lines.push(
      `## ${facilitiesCopy.plannedTitle}`,
      '',
      ...planned.flatMap(card)
    )
  }
  lines.push(
    `## ${storefrontCopy.title}`,
    '',
    `### ${storefrontCopy.name}`,
    '',
    `*${storefrontCopy.note}*`,
    '',
    storefrontCopy.description,
    '',
    '## The clubhouse is stocked with',
    '',
    ...amenities.map(item => `- ${item}`),
    '',
    `Monthly rentals need a membership application; hourly rooms need an associate booking. Apply at ${abs('/membership')} or email ${CONTACT_EMAIL}.`,
    '',
    pageFooter('/facilities')
  )
  return lines.join('\n')
}

export function servicesMarkdown() {
  const lines = [
    ...heading(
      'Services',
      `You bring the project. We make it. ${servicesCopy.lead}`
    ),
  ]
  for (const category of servicesCopy.categories) {
    const categoryServices = services.filter(s => s.category === category.key)
    if (categoryServices.length === 0) continue
    lines.push(`## ${category.title}`, '', category.lead, '')
    for (const service of categoryServices) {
      lines.push(`### ${service.name}`, '', service.blurb, '')
      if (service.items?.length) {
        lines.push(...service.items.map(item => `- ${item}`), '')
      }
    }
  }
  lines.push(
    `To start a project, use the inquiry form at ${abs('/services')} or email ${CONTACT_EMAIL} with what you have in mind. We reply with a quote.`,
    '',
    pageFooter('/services')
  )
  return lines.join('\n')
}

export function eventsMarkdown(now: Date = new Date()) {
  const { upcoming: upcomingSpecials, past } = splitSpecialEvents(now)
  const recurring = upcomingOccurrences(now, 3)
  const calendar = [
    ...recurring.map(o => ({
      date: o.date,
      time: o.event.time,
      name: o.event.name,
      url: undefined as string | undefined,
    })),
    ...upcomingSpecials.map(e => ({
      date: e.date,
      time: e.time,
      name: e.name,
      url: e.url,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date))

  const lines = [
    ...heading('Events', `The club, in session. ${eventsCopy.lead}`),
    `## ${eventsCopy.calendarTitle}`,
    '',
    ...calendar.map(entry => {
      const when = `${formatOccurrenceDate(entry.date)}${entry.time ? ` · ${entry.time}` : ''}`
      const rsvp = entry.url ? ` — RSVP: ${entry.url}` : ''
      return `- ${entry.date} (${when}): **${entry.name}**${rsvp}`
    }),
    '',
    `${eventsCopy.friendNote} ${eventsCopy.friendCta}: ${abs('/membership')}. RSVP by email to ${CONTACT_EMAIL} with the event name and date.`,
    '',
    `## ${eventsCopy.recurringTitle}`,
    '',
    ...events.flatMap(event => [
      `### ${event.name}`,
      '',
      `*${event.schedule}*`,
      '',
      event.blurb,
      '',
    ]),
  ]
  if (past.length > 0) {
    lines.push(
      `## ${eventsCopy.pastTitle}`,
      '',
      eventsCopy.pastLead,
      '',
      ...past.map(event => {
        const venue = event.venue ? ` · ${event.venue}` : ''
        const invite = event.url ? ` — [Invite](${event.url})` : ''
        return `- ${event.date}: **${event.name}**${venue}${invite}`
      }),
      ''
    )
  }
  lines.push(pageFooter('/events'))
  return lines.join('\n')
}

export function membershipMarkdown() {
  const lines = [
    ...heading(
      'Membership',
      `Join the club, gain a community. ${membershipCopy.lead}`
    ),
    `## ${membershipCopy.tiersTitle}`,
    '',
    membershipCopy.tiersLead,
    '',
    ...membershipTiers.flatMap(tier => [
      `### ${tier.name}${tier.price ? ` (${tier.price})` : ''}`,
      '',
      tier.tagline,
      '',
      ...(tier.includes ? [tier.includes, ''] : []),
      ...tier.perks.map(perk => `- ${perk}`),
      '',
    ]),
    `## ${membershipCopy.joiningTitle}`,
    '',
    ...membershipCopy.joining.flatMap((step, i) => [
      `${i + 1}. **${step.label}**`,
      ...step.points.map(point => `   - ${point}`),
    ]),
    '',
    `Apply with the form at ${abs('/membership#apply')} or email ${CONTACT_EMAIL} with your name, the tier you want, and what you make.`,
    '',
    '## Policies',
    '',
    ...membershipCopy.policies.flatMap(policy => [
      `### ${policy.label}`,
      '',
      ...policy.points.map(point => `- ${point}`),
      '',
    ]),
    pageFooter('/membership'),
  ]
  return lines.join('\n')
}

export type AboutMember = { fullName: string; slug: { current: string } }

export function aboutMarkdown(
  founding: AboutMember[] = [],
  past: AboutMember[] = []
) {
  const lines = [
    ...heading(
      'About',
      'The Good for Nothings Club is a creators club based in Austin, TX made up of musicians, photographers, writers, filmmakers, and engineers.'
    ),
    '## Overview',
    '',
    "The club started as a weekly accountability meeting between friends and grew into a clubhouse: studios, rehearsal rooms, and workspace under one roof. Today it runs as a members' creative space for Austin. Monthly members get keys and full run of the house, associates book the rooms by the hour, and friends of the club come out for the events. Membership isn't about who you know. It's about making things and contributing to the space. We accept applications in waves, so the community grows deliberately around people who actually show up, and each new wave has time to make the place their own. The point was never scale. It's keeping the space sustainable and the work flowing.",
    '',
    '## What happens here',
    '',
    `- [The clubhouse](${abs('/facilities')}) rents desks, band practice slots, a photo studio, and a mixing control room.`,
    `- [Club members take on client work](${abs('/services')}) for photo, video, music, print, and events.`,
    `- [Regular events](${abs('/events')}), including a monthly show & tell for works in progress.`,
    `- [Membership](${abs('/membership')}) at three levels: member, associate, and friend.`,
    `- [The shop](${SHOP_URL}) carries works and merch from members and friends of the club.`,
    `- [Got an idea?](${abs('/contact')}) Reach out to see if we can make it happen.`,
    '',
    `## ${leadershipCopy.title}`,
    '',
    leadershipCopy.lead,
    '',
  ]
  if (founding.length > 0) {
    lines.push(
      ...founding.map(
        m => `- [${m.fullName}](${abs(`/members/${m.slug.current}`)})`
      ),
      ''
    )
  }
  if (past.length > 0) {
    lines.push(
      `## ${leadershipCopy.pastTitle}`,
      '',
      ...past.map(
        m => `- [${m.fullName}](${abs(`/members/${m.slug.current}`)})`
      ),
      ''
    )
  }
  lines.push(pageFooter('/about'))
  return lines.join('\n')
}

export function contactMarkdown() {
  return [
    ...heading('Contact', 'Say hello, ask a question, or start something.'),
    '## Email',
    '',
    `${CONTACT_EMAIL} — the one address for projects, bookings, membership, events, and press. Replies come from the founding members.`,
    '',
    '## Social',
    '',
    ...SOCIAL_PROFILES.map(profile => `- [${profile.label}](${profile.href})`),
    '',
    '## Location',
    '',
    `${clubhouseAddressLine}`,
    '',
    `Directions: ${clubhouseMapsUrl}`,
    '',
    '## Send a message',
    '',
    `The contact form at ${abs('/contact')} needs a browser (it runs a bot check). Automated clients should email ${CONTACT_EMAIL} instead, with a name, a reply address, and what the message is about.`,
    '',
    pageFooter('/contact'),
  ].join('\n')
}

/** Static pages that need no data fetching, keyed by path. */
export const STATIC_MARKDOWN: Record<string, () => string> = {
  '/': homeMarkdown,
  '/facilities': facilitiesMarkdown,
  '/services': servicesMarkdown,
  '/events': () => eventsMarkdown(),
  '/membership': membershipMarkdown,
  '/contact': contactMarkdown,
}
