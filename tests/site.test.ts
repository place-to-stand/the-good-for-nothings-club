import { describe, expect, it } from 'vitest'
import {
  KNOWN_STATIC_PATHS,
  SITE_PAGES,
  llmsTxt,
  notFoundMarkdown,
} from '@/lib/markdown/site'
import {
  localBusinessJsonLd,
  projectJsonLd,
  websiteJsonLd,
} from '@/lib/structuredData'
import { PAGE_META, TITLE_SUFFIX } from '@/data/site'

describe('llms.txt', () => {
  const txt = llmsTxt()
  const lines = txt.split('\n')

  it('follows the llmstxt.org layout: H1, blockquote, H2 sections with link lists', () => {
    expect(lines[0]).toBe('# The Good for Nothings Club')
    expect(lines[2].startsWith('> ')).toBe(true)
    const h2s = lines.filter(line => line.startsWith('## '))
    expect(h2s).toEqual([
      '## When to use this site',
      '## How to call this site',
      '## Pages',
      '## Projects and members',
      '## Shop',
      '## Machine-readable',
      '## Optional',
    ])
    expect(lines.filter(line => line.startsWith('# ')).length).toBe(1)
  })

  it('names concrete use cases and how to call the site', () => {
    expect(txt).toContain('Creative workspace in Austin, TX')
    expect(txt).toContain('Hiring creatives in Austin')
    expect(txt).toContain('Accept: text/markdown')
    expect(txt).toContain('hello@thegoodfornothings.club')
    expect(txt).toContain('Do not use this site for')
  })

  it('links every static page as a markdown alternate', () => {
    for (const page of SITE_PAGES) {
      const md = page.path === '/' ? '/index.md' : `${page.path}.md`
      expect(txt).toContain(
        `](https://thegoodfornothings.club${md}): ${page.description}`
      )
    }
    expect(txt).toContain('https://thegoodfornothings.club/sitemap.xml')
  })
})

describe('404 markdown', () => {
  it('names the path and points at the index, sitemap, and every page', () => {
    const md = notFoundMarkdown('/nope')
    expect(md.startsWith('# 404: Page not found')).toBe(true)
    expect(md).toContain('`/nope`')
    expect(md).toContain('https://thegoodfornothings.club/llms.txt')
    expect(md).toContain('https://thegoodfornothings.club/sitemap.xml')
    for (const page of SITE_PAGES) {
      expect(md).toContain(`](https://thegoodfornothings.club${page.path})`)
    }
  })

  it('knows the static paths', () => {
    expect(KNOWN_STATIC_PATHS.has('/contact')).toBe(true)
    expect(KNOWN_STATIC_PATHS.has('/nope')).toBe(false)
  })
})

describe('page metadata', () => {
  it('keeps every description within the 158-char SERP budget', () => {
    for (const [path, meta] of Object.entries(PAGE_META)) {
      expect(meta.description.length, path).toBeLessThanOrEqual(158)
      expect(meta.title.length, path).toBeLessThanOrEqual(60)
      // The home page title is used as is; the rest get TITLE_SUFFIX.
      const shown =
        path === '/' ? meta.searchTitle : meta.searchTitle + TITLE_SUFFIX
      expect(shown.length, path).toBeLessThanOrEqual(60)
    }
  })
})

describe('Organization JSON-LD', () => {
  it('has a contactPoint with email and contactType, and a postal address', () => {
    expect(localBusinessJsonLd['@type']).toBe('LocalBusiness')
    expect(localBusinessJsonLd.contactPoint).toMatchObject({
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@thegoodfornothings.club',
      url: 'https://thegoodfornothings.club/contact',
    })
    expect(localBusinessJsonLd.address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: '1800 W Koenig Ln',
      addressLocality: 'Austin',
      addressRegion: 'TX',
      postalCode: '78756',
      addressCountry: 'US',
    })
    expect(localBusinessJsonLd.sameAs.length).toBeGreaterThanOrEqual(5)
    expect(JSON.stringify(localBusinessJsonLd)).not.toContain('undefined')
  })

  it('lists every bookable room and service as an offer', () => {
    const names = localBusinessJsonLd.makesOffer.map(
      offer => offer.itemOffered.name
    )
    expect(names).toContain('Photography')
    expect(names.some(name => name.startsWith('Photo studio rental'))).toBe(
      true
    )
    expect(websiteJsonLd.publisher['@id']).toBe(localBusinessJsonLd['@id'])
  })
})

describe('projectJsonLd', () => {
  const project = {
    _id: 'p1',
    _updatedAt: '2025-05-05T00:00:00Z',
    title: 'Turbopedal ',
    clientName: 'Acme Records',
    slug: { current: 'turbopedal' },
    seoDescription: null,
    type: 'Build',
    status: 'Completed',
    mainLink: 'https://example.com/turbopedal',
    dateStarted: '2025-01-01',
    dateCompleted: '2025-05-01',
    mainMedia: [
      { _type: 'videoFile', asset: { url: 'https://cdn.test/v.mp4' } },
      { _type: 'image', asset: { url: 'https://cdn.test/a.jpg' } },
    ],
    summary: [
      {
        _type: 'block',
        _key: 'a',
        children: [{ _type: 'span', _key: 'b', text: 'A guitar pedal.' }],
      },
    ],
    overview: [],
    photoGallery: [],
    caseStudy: [],
    membersInvolved: [
      { fullName: 'Jason Desiderio', slug: { current: 'jason-desiderio' } },
    ],
  } as unknown as Parameters<typeof projectJsonLd>[0]

  const [work, crumbs] = projectJsonLd(project)['@graph']

  it('marks a project as a CreativeWork, not a Product', () => {
    expect(work['@type']).toBe('CreativeWork')
    expect(work).toMatchObject({
      name: 'Turbopedal',
      url: 'https://thegoodfornothings.club/projects/turbopedal',
      description: 'A guitar pedal.',
      image: 'https://cdn.test/a.jpg',
      dateCreated: '2025-01-01',
      datePublished: '2025-05-01',
      sameAs: 'https://example.com/turbopedal',
      funder: { '@type': 'Organization', name: 'Acme Records' },
    })
    expect(work.creator).toEqual([
      { '@id': 'https://thegoodfornothings.club/#organization' },
      {
        '@type': 'Person',
        name: 'Jason Desiderio',
        url: 'https://thegoodfornothings.club/members/jason-desiderio',
      },
    ])
    expect(JSON.stringify(work)).not.toContain('Offer')
  })

  it('leaves out the client on club projects', () => {
    const [clubWork] = projectJsonLd({
      ...project,
      clientName: 'The Good for Nothings Club',
    })['@graph']
    expect(clubWork).not.toHaveProperty('funder')
  })

  it('adds Projects › title breadcrumbs', () => {
    expect(crumbs['@type']).toBe('BreadcrumbList')
    expect(crumbs.itemListElement.map(c => c.name)).toEqual([
      'Projects',
      'Turbopedal',
    ])
  })
})
