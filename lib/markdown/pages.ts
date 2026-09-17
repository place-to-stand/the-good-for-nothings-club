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
import { homeCopy, homeOffering } from '@/data/home'
import { aboutCopy, aboutItems } from '@/data/about'
import { contactCopy } from '@/data/contact'
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

export function homeMarkdown() {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${PAGE_META['/'].description}`,
    '',
    `*${homeCopy.introName}* ${homeCopy.introBody}`,
    '',
    `${homeCopy.learnMore}: ${abs('/about')}`,
    '',
    `## ${homeCopy.offeringTitle}`,
    '',
    ...homeOffering.map(card => {
      const url = card.href.startsWith('http') ? card.href : abs(card.href)
      return `- [${card.title}](${url}): ${card.body}`
    }),
    '',
    `## ${homeCopy.findUsTitle}`,
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
    `## ${facilitiesCopy.amenitiesTitle}`,
    '',
    ...amenities.map(item => `- ${item}`),
    '',
    `${facilitiesCopy.agentNote} Membership: ${abs('/membership')}. Email: ${CONTACT_EMAIL}.`,
    '',
    pageFooter('/facilities')
  )
  return lines.join('\n')
}

export function servicesMarkdown() {
  const lines = [...heading('Services', servicesCopy.lead)]
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
    `${servicesCopy.agentNote} Services: ${abs('/services')}. Email: ${CONTACT_EMAIL}.`,
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
    ...heading('Events', eventsCopy.lead),
    `## ${eventsCopy.calendarTitle}`,
    '',
    ...calendar.map(entry => {
      const when = `${formatOccurrenceDate(entry.date)}${entry.time ? ` · ${entry.time}` : ''}`
      const rsvp = entry.url ? ` — RSVP: ${entry.url}` : ''
      return `- ${entry.date} (${when}): **${entry.name}**${rsvp}`
    }),
    '',
    `${eventsCopy.friendNote} ${eventsCopy.friendCta}: ${abs('/membership')}. ${eventsCopy.agentNote} Email: ${CONTACT_EMAIL}.`,
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
    ...heading('Membership', membershipCopy.lead),
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
    `${membershipCopy.agentNote} ${membershipCopy.applicationTitle}: ${abs('/membership#apply')}. Email: ${CONTACT_EMAIL}.`,
    '',
    `## ${membershipCopy.policiesTitle}`,
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
    ...heading('About', aboutCopy.lead),
    `## ${aboutCopy.overviewTitle}`,
    '',
    aboutCopy.overview,
    '',
    `## ${aboutCopy.happensTitle}`,
    '',
    ...aboutItems.map(item => {
      const url = item.href.startsWith('http') ? item.href : abs(item.href)
      return `- [${item.link}](${url})${item.rest}`
    }),
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
    ...heading('Contact', contactCopy.lead),
    `## ${contactCopy.emailTitle}`,
    '',
    CONTACT_EMAIL,
    '',
    `## ${contactCopy.socialTitle}`,
    '',
    ...SOCIAL_PROFILES.map(profile => `- [${profile.label}](${profile.href})`),
    '',
    `## ${contactCopy.locationTitle}`,
    '',
    clubhouseAddressLine,
    '',
    `Directions: ${clubhouseMapsUrl}`,
    '',
    `## ${contactCopy.formTitle}`,
    '',
    `${contactCopy.agentNote} Form: ${abs('/contact')}. Email: ${CONTACT_EMAIL}.`,
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
