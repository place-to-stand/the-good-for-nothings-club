import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'
import { leadershipSlugs, pastMemberSlugs } from '@/data/leadership'
import type { GFNC_member, GFNC_project, GFNC_projectListItem } from '@/types'
import { STATIC_MARKDOWN, aboutMarkdown } from '@/lib/markdown/pages'
import {
  memberMarkdown,
  projectMarkdown,
  projectsIndexMarkdown,
} from '@/lib/markdown/dynamic'
import { notFoundMarkdown } from '@/lib/markdown/site'

/**
 * Markdown twin of every public page. Not linked directly: proxy.ts
 * rewrites `Accept: text/markdown` requests and `*.md` URLs here, so
 * /about and /about.md both resolve to /markdown/about internally.
 *
 * Unknown paths return a real 404 with a markdown body (site map + where
 * to look next), which is what agents need to recover.
 */

// Rendered per request: the static pages are cheap, the Convex-backed ones
// need fresh data, and a 404/503 must never be cached for an hour.
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ path?: string[] }> }

const MARKDOWN_HEADERS = {
  'Content-Type': 'text/markdown; charset=utf-8',
  Vary: 'Accept',
  'X-Robots-Tag': 'noindex',
}

function markdown(
  body: string,
  status = 200,
  extra: Record<string, string> = {}
) {
  return new Response(body, {
    status,
    headers: { ...MARKDOWN_HEADERS, ...extra },
  })
}

export async function GET(_request: Request, { params }: Params) {
  const segments = (await params).path ?? []
  const pathname = '/' + segments.map(decodeURIComponent).join('/')
  const canonical = `https://thegoodfornothings.club${pathname}`

  const renderStatic = STATIC_MARKDOWN[pathname]
  if (renderStatic)
    return markdown(renderStatic(), 200, { 'Content-Location': canonical })

  try {
    if (pathname === '/about') {
      const members = (await fetchQuery(api.members.bySlugs, {
        slugs: [...leadershipSlugs, ...pastMemberSlugs],
      })) as unknown as GFNC_member[]
      const founding = members.filter(m =>
        leadershipSlugs.includes(m.slug.current)
      )
      const past = members.filter(m => pastMemberSlugs.includes(m.slug.current))
      return markdown(aboutMarkdown(founding, past), 200, {
        'Content-Location': canonical,
      })
    }

    if (pathname === '/projects') {
      const data = (await fetchQuery(api.projects.listPage, {})) as unknown as {
        projects: Omit<GFNC_projectListItem, 'membersInvolved'>[]
      }
      return markdown(projectsIndexMarkdown(data.projects), 200, {
        'Content-Location': canonical,
      })
    }

    if (segments.length === 2 && segments[0] === 'projects') {
      const project = (await fetchQuery(api.projects.bySlug, {
        slug: segments[1],
      })) as unknown as GFNC_project | null
      if (project)
        return markdown(projectMarkdown(project), 200, {
          'Content-Location': canonical,
        })
    }

    if (segments.length === 2 && segments[0] === 'members') {
      const member = (await fetchQuery(api.members.bySlug, {
        slug: segments[1],
      })) as unknown as GFNC_member | null
      if (member) {
        const projects = (await fetchQuery(api.projects.byMemberId, {
          memberId: member._id as Id<'members'>,
        })) as unknown as GFNC_project[]
        return markdown(memberMarkdown(member, projects), 200, {
          'Content-Location': canonical,
        })
      }
    }
  } catch (error) {
    console.error('markdown route: data fetch failed', error)
    return markdown(
      `# 503: Content temporarily unavailable\n\nThe data behind \`${pathname}\` could not be loaded. Try again shortly, or start from https://thegoodfornothings.club/llms.txt.\n`,
      503,
      { 'Retry-After': '60' }
    )
  }

  return markdown(notFoundMarkdown(pathname), 404)
}
