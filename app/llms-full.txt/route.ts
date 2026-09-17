import { STATIC_MARKDOWN, aboutMarkdown } from '@/lib/markdown/pages'
import { llmsTxt } from '@/lib/markdown/site'

/**
 * llms-full.txt: the agent index followed by the full text of every static
 * page. Convex-backed pages (about's member list, projects, members) are
 * linked rather than inlined so this file stays static and small.
 */
export const dynamic = 'force-static'

export function GET() {
  const order = [
    '/',
    '/facilities',
    '/services',
    '/events',
    '/membership',
    '/about',
    '/contact',
  ]
  const sections = order.map(path =>
    path === '/about' ? aboutMarkdown() : STATIC_MARKDOWN[path]()
  )
  const body = [llmsTxt(), ...sections].join('\n\n\n')
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
