import { llmsTxt } from '@/lib/markdown/site'

/** llms.txt (llmstxt.org): what the site is for, when to use it, and where everything lives. */
export const dynamic = 'force-static'

export function GET() {
  return new Response(llmsTxt(), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
