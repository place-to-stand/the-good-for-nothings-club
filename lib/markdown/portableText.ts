import type { TypedObject } from '@portabletext/types'

/**
 * Minimal Portable Text → Markdown. Covers what the CMS content uses:
 * paragraphs, headings, blockquotes, bullet/numbered lists, and the
 * strong / em / code / link marks. Unknown block types are skipped.
 */

type Span = { _type: 'span'; text: string; marks?: string[] }
type MarkDef = { _key: string; _type: string; href?: string }
type Block = TypedObject & {
  style?: string
  listItem?: 'bullet' | 'number'
  level?: number
  children?: Array<TypedObject & Partial<Span>>
  markDefs?: MarkDef[]
}

const escapeText = (text: string) => text.replace(/([*_`\[\]])/g, '\\$1')

function renderSpan(span: TypedObject & Partial<Span>, markDefs: MarkDef[]) {
  if (span._type !== 'span' || typeof span.text !== 'string') return ''
  let text = escapeText(span.text)
  if (!text.trim()) return text
  for (const mark of span.marks ?? []) {
    switch (mark) {
      case 'strong':
        text = `**${text}**`
        break
      case 'em':
        text = `*${text}*`
        break
      case 'code':
        text = `\`${span.text}\``
        break
      case 'strike-through':
        text = `~~${text}~~`
        break
      default: {
        const def = markDefs.find(d => d._key === mark)
        if (def?._type === 'link' && def.href) text = `[${text}](${def.href})`
      }
    }
  }
  return text
}

function renderInline(block: Block) {
  return (block.children ?? [])
    .map(child => renderSpan(child, block.markDefs ?? []))
    .join('')
    .trim()
}

export function portableTextToMarkdown(
  value: TypedObject[] | null | undefined
): string {
  if (!value?.length) return ''
  const out: string[] = []
  let listCounter = 0
  let previousWasList = false

  for (const raw of value) {
    const block = raw as Block
    if (block._type !== 'block') continue
    const text = renderInline(block)
    if (!text) continue

    if (block.listItem) {
      const indent = '  '.repeat(Math.max((block.level ?? 1) - 1, 0))
      if (!previousWasList) listCounter = 0
      listCounter += 1
      const marker = block.listItem === 'number' ? `${listCounter}.` : '-'
      out.push(`${indent}${marker} ${text}`)
      previousWasList = true
      continue
    }

    if (previousWasList) out.push('')
    previousWasList = false

    const style = block.style ?? 'normal'
    const heading = style.match(/^h([1-6])$/)
    if (heading) {
      out.push(`${'#'.repeat(Number(heading[1]))} ${text}`, '')
    } else if (style === 'blockquote') {
      out.push(`> ${text}`, '')
    } else {
      out.push(text, '')
    }
  }

  return out.join('\n').trim()
}
