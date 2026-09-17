import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { aboutCopy, aboutItems } from '@/data/about'
import { contactCopy } from '@/data/contact'
import { eventsCopy, events } from '@/data/events'
import {
  amenities,
  facilities,
  facilitiesCopy,
  storefrontCopy,
} from '@/data/facilities'
import { homeCopy, homeOffering } from '@/data/home'
import { membershipCopy, membershipTiers } from '@/data/membership'
import { services, servicesCopy } from '@/data/services'
import { notFoundCopy } from '@/data/site'
import {
  aboutMarkdown,
  contactMarkdown,
  eventsMarkdown,
  facilitiesMarkdown,
  homeMarkdown,
  membershipMarkdown,
  servicesMarkdown,
} from '@/lib/markdown/pages'
import { notFoundMarkdown } from '@/lib/markdown/site'

/**
 * Drift guards. The HTML pages and their markdown twins must read the same
 * data files, so:
 *  1. no page file may carry prose of its own (a JSX text run or a
 *     lead/title/description string literal over the limit), and
 *  2. every copy string in the data files must appear in the markdown.
 * If either fails, move the text into data/*.ts and read it from there.
 */

const PAGE_FILES = [
  'app/page.tsx',
  'app/about/page.tsx',
  'app/contact/page.tsx',
  'app/facilities/page.tsx',
  'app/services/page.tsx',
  'app/membership/page.tsx',
  'app/events/page.tsx',
  'app/projects/page.tsx',
  'app/not-found.tsx',
]
const PROSE_LIMIT = 40

describe('page files carry no prose of their own', () => {
  for (const file of PAGE_FILES) {
    it(file, () => {
      const source = readFileSync(file, 'utf8')
      // JSX text between tags, e.g. <p>Long sentence…</p>. Runs with code
      // punctuation are arrow functions caught between `=>` and `<`.
      const textRuns = [...source.matchAll(/>([^<>{}]+)</g)]
        .map(m => m[1].replace(/\s+/g, ' ').trim())
        .filter(text => text.length > PROSE_LIMIT && !/[()=;]/.test(text))
      // Copy passed as a string literal prop, in either quote style.
      const literalProps = [
        ...source.matchAll(
          /\b(?:lead|title|description|label|body)=(?:'([^']*)'|"([^"]*)")/g
        ),
      ]
        .map(m => m[1] ?? m[2])
        .filter(text => text.length > PROSE_LIMIT)
      expect(
        [...textRuns, ...literalProps],
        `${file} has inline copy; move it to data/*.ts`
      ).toEqual([])
    })
  }
})

const expectAll = (markdown: string, strings: string[]) => {
  for (const text of strings)
    expect(markdown, text.slice(0, 60)).toContain(text)
}

describe('markdown renders every copy string from the data files', () => {
  it('home', () => {
    expectAll(homeMarkdown(), [
      homeCopy.introName,
      homeCopy.introBody,
      homeCopy.learnMore,
      homeCopy.offeringTitle,
      homeCopy.findUsTitle,
      ...homeOffering.flatMap(card => [card.title, card.body]),
    ])
  })

  it('about', () => {
    expectAll(aboutMarkdown(), [
      aboutCopy.lead,
      aboutCopy.overviewTitle,
      aboutCopy.overview,
      aboutCopy.happensTitle,
      ...aboutItems.flatMap(item => [item.link, item.rest]),
    ])
  })

  it('contact', () => {
    expectAll(contactMarkdown(), Object.values(contactCopy))
  })

  it('facilities', () => {
    const md = facilitiesMarkdown()
    expectAll(md, [
      facilitiesCopy.lead,
      facilitiesCopy.monthlyTitle,
      facilitiesCopy.monthlyLead,
      facilitiesCopy.hourlyTitle,
      facilitiesCopy.hourlyLead,
      facilitiesCopy.amenitiesTitle,
      facilitiesCopy.agentNote,
      storefrontCopy.title,
      storefrontCopy.name,
      storefrontCopy.note,
      storefrontCopy.description,
      ...amenities,
      ...facilities
        .filter(f => f.status !== 'planned')
        .flatMap(f => [f.name, f.description, f.quantity ?? '', f.note ?? '']),
    ])
  })

  it('services', () => {
    expectAll(servicesMarkdown(), [
      servicesCopy.lead,
      servicesCopy.agentNote,
      ...servicesCopy.categories.flatMap(c => [c.title, c.lead]),
      ...services.flatMap(s => [s.name, s.blurb, ...(s.items ?? [])]),
    ])
  })

  it('membership', () => {
    expectAll(membershipMarkdown(), [
      membershipCopy.lead,
      membershipCopy.tiersTitle,
      membershipCopy.tiersLead,
      membershipCopy.joiningTitle,
      membershipCopy.applicationTitle,
      membershipCopy.policiesTitle,
      membershipCopy.agentNote,
      ...membershipCopy.joining.flatMap(step => [step.label, ...step.points]),
      ...membershipCopy.policies.flatMap(p => [p.label, ...p.points]),
      ...membershipTiers.flatMap(t => [
        t.name,
        t.tagline,
        t.includes ?? '',
        t.price ?? '',
        ...t.perks,
      ]),
    ])
  })

  it('events', () => {
    expectAll(eventsMarkdown(new Date('2026-09-16T12:00:00Z')), [
      eventsCopy.lead,
      eventsCopy.calendarTitle,
      eventsCopy.recurringTitle,
      eventsCopy.pastTitle,
      eventsCopy.pastLead,
      eventsCopy.friendNote,
      eventsCopy.friendCta,
      eventsCopy.agentNote,
      ...events.flatMap(e => [e.name, e.schedule, e.blurb]),
    ])
  })

  it('404', () => {
    expectAll(notFoundMarkdown('/nope'), [
      notFoundCopy.markdownTitle,
      notFoundCopy.lead,
      notFoundCopy.nextTitle,
      notFoundCopy.stillStuck,
    ])
  })
})
