import { describe, expect, it } from 'vitest'
import {
  STATIC_MARKDOWN,
  aboutMarkdown,
  contactMarkdown,
  eventsMarkdown,
  homeMarkdown,
} from '@/lib/markdown/pages'
import {
  memberMarkdown,
  projectMarkdown,
  projectsIndexMarkdown,
} from '@/lib/markdown/dynamic'
import { PAGE_META } from '@/data/site'
import type { GFNC_member, GFNC_project } from '@/types'
import type { TypedObject } from '@portabletext/types'

const blocks = (value: unknown[]) => value as TypedObject[]

const startsWithH1 = (md: string) => /^# \S/.test(md)

describe('static page markdown', () => {
  it('covers every static page except the Convex-backed ones', () => {
    expect(Object.keys(STATIC_MARKDOWN).sort()).toEqual(
      [
        '/',
        '/contact',
        '/events',
        '/facilities',
        '/membership',
        '/services',
      ].sort()
    )
  })

  it('every page starts with an H1, a blockquote summary, and ends with the footer', () => {
    for (const [path, render] of Object.entries(STATIC_MARKDOWN)) {
      const md = render()
      expect(startsWithH1(md), path).toBe(true)
      expect(md.split('\n')[2].startsWith('> '), path).toBe(true)
      expect(md, path).toContain('https://thegoodfornothings.club/llms.txt')
      expect(md, path).toContain('hello@thegoodfornothings.club')
      expect(md.length, path).toBeGreaterThan(500)
    }
  })

  it('home lists the offering and mirrors the meta description', () => {
    const md = homeMarkdown()
    expect(md).toContain(`> ${PAGE_META['/'].description}`)
    for (const title of [
      'Facilities',
      'Services',
      'Events',
      'Membership',
      'Shop',
    ]) {
      expect(md).toContain(`[${title}](`)
    }
    expect(md).toContain('https://thegoodfornothings.club/index.md')
  })

  it('events is deterministic for a fixed date and rolls one-offs into the past', () => {
    const md = eventsMarkdown(new Date('2026-09-16T12:00:00Z'))
    expect(md).toContain('- 2026-10-01 (Thu, Oct 1 · 7 PM): **Open House**')
    expect(md).toContain('## Past Events')
    expect(md).toContain('- 2026-08-20: **Off Genre Jam** · GFNC Clubhouse')
    expect(md).toBe(eventsMarkdown(new Date('2026-09-16T12:00:00Z')))
  })

  it('contact carries the address and tells agents to email', () => {
    const md = contactMarkdown()
    expect(md).toContain('1800 W Koenig Ln, Austin, TX 78756')
    expect(md).toContain('Automated clients should email us instead')
  })

  it('about lists members when given them', () => {
    const md = aboutMarkdown(
      [{ fullName: 'Jane Doe', slug: { current: 'jane-doe' } }],
      [{ fullName: 'Old Timer', slug: { current: 'old-timer' } }]
    )
    expect(md).toContain(
      '- [Jane Doe](https://thegoodfornothings.club/members/jane-doe)'
    )
    expect(md).toContain('## Past Members')
    expect(aboutMarkdown()).not.toContain('## Past Members')
  })
})

const member: GFNC_member = {
  _id: 'm1',
  fullName: 'Jane Doe',
  slug: { current: 'jane-doe' },
  roles: ['Photographer', 'Engineer'],
  startDate: '2022-11-01',
  memberNumber: 3,
  profilePicture: {
    _type: 'image',
    caption: 'Jane',
    asset: {
      extension: 'jpg',
      url: 'https://cdn.example/jane.jpg',
      metadata: {
        lqip: 'data:image/jpeg;base64,x',
        dimensions: { aspectRatio: 1, height: 10, width: 10 },
      },
    },
  },
  hoverProfilePicture:
    undefined as unknown as GFNC_member['hoverProfilePicture'],
}

const project: GFNC_project = {
  _id: 'p1',
  _updatedAt: '2025-01-01',
  title: 'Sluggish EP1',
  clientName: 'Sluggish',
  slug: { current: 'sluggish-ep1' },
  seoDescription: 'A four-track EP.',
  type: 'Audio',
  status: 'Completed',
  mainLink: 'https://open.spotify.com/album/x',
  dateStarted: '2024-03-03',
  dateCompleted: '2024-06-09',
  mainMedia: [
    {
      _type: 'image',
      caption: 'Cover art',
      asset: {
        extension: 'jpg',
        url: 'https://cdn.example/cover.jpg',
        metadata: {
          lqip: 'data:image/jpeg;base64,x',
          dimensions: { aspectRatio: 1, height: 10, width: 10 },
        },
      },
    },
  ],
  summary: blocks([
    {
      _type: 'block',
      _key: 's',
      style: 'normal',
      children: [
        { _type: 'span', text: 'Recorded at the clubhouse.', marks: [] },
      ],
      markDefs: [],
    },
  ]),
  overview: blocks([
    {
      _type: 'block',
      _key: 'o',
      style: 'normal',
      children: [
        { _type: 'span', text: 'Mixed by ', marks: [] },
        { _type: 'span', text: 'us', marks: ['strong'] },
      ],
      markDefs: [],
    },
  ]),
  photoGallery: [],
  caseStudy: [],
  membersInvolved: [member],
}

describe('dynamic page markdown', () => {
  it('renders a project', () => {
    const md = projectMarkdown(project)
    expect(md.startsWith('# Sluggish EP1\n\n> A four-track EP.')).toBe(true)
    expect(md).toContain('- **Client:** Sluggish')
    expect(md).toContain('- **Started:** Mar 3, 2024')
    expect(md).toContain('- **Completed:** Jun 9, 2024')
    expect(md).toContain('## Overview\n\nMixed by **us**')
    expect(md).not.toContain('## Case study')
    expect(md).toContain(
      '- [Jane Doe](https://thegoodfornothings.club/members/jane-doe)'
    )
    expect(md).toContain('![Cover art](https://cdn.example/cover.jpg)')
    expect(md).toContain(
      'https://thegoodfornothings.club/projects/sluggish-ep1.md'
    )
  })

  it('renders a member with their projects', () => {
    const md = memberMarkdown(member, [project])
    expect(md).toContain('# Jane Doe')
    expect(md).toContain('a founding member')
    expect(md).toContain('- **Member number:** #003')
    expect(md).toContain('- **Member since:** November 1, 2022')
    expect(md).toContain('## Projects (1)')
    expect(md).toContain(
      '[Sluggish EP1](https://thegoodfornothings.club/projects/sluggish-ep1) — Sluggish (Audio · Completed · Mar 3, 2024 – Jun 9, 2024): Recorded at the clubhouse.'
    )
  })

  it('groups the projects index by status', () => {
    const md = projectsIndexMarkdown([
      project,
      {
        ...project,
        slug: { current: 'wip' },
        title: 'WIP',
        status: 'In Progress',
      },
    ])
    expect(md.indexOf('## In Progress (1)')).toBeLessThan(
      md.indexOf('## Completed (1)')
    )
    expect(projectsIndexMarkdown([])).toContain('No projects published yet.')
  })
})
