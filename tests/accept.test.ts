import { describe, expect, it } from 'vitest'
import {
  markdownAlternatePath,
  parseAccept,
  prefersMarkdown,
  stripMarkdownSuffix,
} from '@/lib/markdown/accept'

describe('prefersMarkdown', () => {
  it('is false for browsers and missing headers', () => {
    expect(prefersMarkdown(undefined)).toBe(false)
    expect(prefersMarkdown('')).toBe(false)
    expect(prefersMarkdown('*/*')).toBe(false)
    expect(
      prefersMarkdown(
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8'
      )
    ).toBe(false)
  })

  it('is true when text/markdown is asked for', () => {
    expect(prefersMarkdown('text/markdown')).toBe(true)
    expect(prefersMarkdown('text/markdown; charset=utf-8')).toBe(true)
    expect(prefersMarkdown('text/markdown, text/plain;q=0.9, */*;q=0.1')).toBe(
      true
    )
    expect(prefersMarkdown('TEXT/MARKDOWN')).toBe(true)
  })

  it('weighs markdown against html by q-value, then by order', () => {
    expect(prefersMarkdown('text/html, text/markdown;q=0.5')).toBe(false)
    expect(prefersMarkdown('text/html;q=0.5, text/markdown')).toBe(true)
    expect(prefersMarkdown('text/markdown, text/html')).toBe(true)
    expect(prefersMarkdown('text/html, text/markdown')).toBe(false)
    expect(prefersMarkdown('text/markdown;q=0')).toBe(false)
  })

  it('parses q-values defensively', () => {
    expect(parseAccept('text/markdown;q=abc')).toEqual([
      { type: 'text/markdown', q: 0, order: 0 },
    ])
    expect(parseAccept('text/markdown;q=7')[0].q).toBe(1)
  })
})

describe('markdown alternate paths', () => {
  it('strips the .md suffix', () => {
    expect(stripMarkdownSuffix('/about.md')).toBe('/about')
    expect(stripMarkdownSuffix('/index.md')).toBe('/')
    expect(stripMarkdownSuffix('/projects/foo.md')).toBe('/projects/foo')
    expect(stripMarkdownSuffix('/about')).toBeNull()
    expect(stripMarkdownSuffix('/README.mdx')).toBeNull()
  })

  it('builds the alternate URL', () => {
    expect(markdownAlternatePath('/')).toBe('/index.md')
    expect(markdownAlternatePath('/about')).toBe('/about.md')
    expect(markdownAlternatePath('/about/')).toBe('/about.md')
  })
})
