/**
 * Accept-header negotiation for the markdown views (acceptmarkdown.com).
 *
 * A client "prefers markdown" when its Accept header lists text/markdown
 * with a q-value higher than any HTML type it also lists. `* / *` and
 * `text/*` wildcards never select markdown on their own, so browsers (which
 * send `text/html,...,* / *;q=0.8`) always get HTML.
 */

type AcceptEntry = { type: string; q: number; order: number }

export function parseAccept(header: string | null | undefined): AcceptEntry[] {
  if (!header) return []
  return header
    .split(',')
    .map((part, order) => {
      const [rawType, ...params] = part.trim().split(';')
      const type = rawType.trim().toLowerCase()
      let q = 1
      for (const param of params) {
        const [key, value] = param.trim().split('=')
        if (key?.trim().toLowerCase() === 'q') {
          const parsed = Number.parseFloat(value ?? '')
          q = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 1) : 0
        }
      }
      return { type, q, order }
    })
    .filter(entry => entry.type.length > 0)
}

const HTML_TYPES = new Set(['text/html', 'application/xhtml+xml'])

export function prefersMarkdown(header: string | null | undefined): boolean {
  const entries = parseAccept(header)
  const markdown = entries.find(entry => entry.type === 'text/markdown')
  if (!markdown || markdown.q === 0) return false
  const html = entries.filter(
    entry => HTML_TYPES.has(entry.type) && entry.q > 0
  )
  if (html.length === 0) return true
  const bestHtml = Math.max(...html.map(entry => entry.q))
  if (markdown.q > bestHtml) return true
  if (markdown.q < bestHtml) return false
  // Equal weight: the type listed first wins.
  return html.every(entry => markdown.order < entry.order)
}

/** `/about.md` → `/about`; `/index.md` → `/`; anything else → null. */
export function stripMarkdownSuffix(pathname: string): string | null {
  if (!pathname.endsWith('.md')) return null
  const base = pathname.slice(0, -3)
  if (base === '/index' || base === '') return '/'
  return base
}

/** The `.md` alternate URL for a page path (`/` → `/index.md`). */
export function markdownAlternatePath(pathname: string): string {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return clean === '/' ? '/index.md' : `${clean}.md`
}
