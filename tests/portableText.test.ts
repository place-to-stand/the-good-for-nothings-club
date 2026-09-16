import { describe, expect, it } from 'vitest'
import { portableTextToMarkdown } from '@/lib/markdown/portableText'

const block = (
  text: string,
  extra: Record<string, unknown> = {},
  marks: string[] = []
) => ({
  _type: 'block',
  _key: Math.random().toString(36).slice(2),
  style: 'normal',
  children: [{ _type: 'span', text, marks }],
  markDefs: [],
  ...extra,
})

describe('portableTextToMarkdown', () => {
  it('returns an empty string for nothing', () => {
    expect(portableTextToMarkdown(undefined)).toBe('')
    expect(portableTextToMarkdown([])).toBe('')
  })

  it('renders paragraphs, headings, and blockquotes', () => {
    expect(
      portableTextToMarkdown([
        block('Title', { style: 'h2' }),
        block('First paragraph.'),
        block('Quoted.', { style: 'blockquote' }),
      ])
    ).toBe('## Title\n\nFirst paragraph.\n\n> Quoted.')
  })

  it('renders lists and closes them before the next paragraph', () => {
    expect(
      portableTextToMarkdown([
        block('one', { listItem: 'number', level: 1 }),
        block('two', { listItem: 'number', level: 1 }),
        block('nested', { listItem: 'bullet', level: 2 }),
        block('after'),
      ])
    ).toBe('1. one\n2. two\n  - nested\n\nafter')
  })

  it('renders marks and links', () => {
    const value = [
      {
        _type: 'block',
        _key: 'a',
        style: 'normal',
        markDefs: [{ _key: 'l1', _type: 'link', href: 'https://example.com' }],
        children: [
          { _type: 'span', text: 'bold', marks: ['strong'] },
          { _type: 'span', text: ' and ', marks: [] },
          { _type: 'span', text: 'a link', marks: ['l1'] },
          { _type: 'span', text: ' *star*', marks: [] },
        ],
      },
    ]
    expect(portableTextToMarkdown(value)).toBe(
      '**bold** and [a link](https://example.com) \\*star\\*'
    )
  })

  it('skips non-block types', () => {
    expect(
      portableTextToMarkdown([{ _type: 'image', _key: 'i' }, block('text')])
    ).toBe('text')
  })
})
