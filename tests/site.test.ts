import { describe, expect, it } from 'vitest'
import {
  KNOWN_STATIC_PATHS,
  SITE_PAGES,
  llmsTxt,
  notFoundMarkdown,
} from '@/lib/markdown/site'
import { localBusinessJsonLd } from '@/lib/structuredData'
import { PAGE_META } from '@/data/site'
import { privacySections } from '@/data/privacy'

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
    expect(KNOWN_STATIC_PATHS.has('/privacy')).toBe(true)
    expect(KNOWN_STATIC_PATHS.has('/nope')).toBe(false)
  })
})

describe('page metadata', () => {
  it('keeps every description within the 158-char SERP budget', () => {
    for (const [path, meta] of Object.entries(PAGE_META)) {
      expect(meta.description.length, path).toBeLessThanOrEqual(158)
      expect(meta.title.length, path).toBeLessThanOrEqual(60)
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
})

describe('privacy copy', () => {
  it('is a real policy: 500+ characters, contact email, and the processors named', () => {
    const text = privacySections
      .flatMap(s => [...s.paragraphs, ...(s.points ?? [])])
      .join(' ')
    expect(text.length).toBeGreaterThan(500)
    expect(text).toContain('hello@thegoodfornothings.club')
    for (const processor of [
      'Vercel',
      'Convex',
      'Resend',
      'PostHog',
      'Google Analytics',
    ]) {
      expect(text).toContain(processor)
    }
  })
})
