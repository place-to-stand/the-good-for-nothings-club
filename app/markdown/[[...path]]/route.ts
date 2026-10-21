import { leadershipSlugs, pastMemberSlugs } from '@/data/leadership'
import {
  getListedMembers,
  getMember,
  getProject,
  getProjectsByMember,
  getProjectsListPage,
} from '@/lib/content'
import { STATIC_MARKDOWN, aboutMarkdown } from '@/lib/markdown/pages'
import {
  memberMarkdown,
  projectMarkdown,
  projectsIndexMarkdown,
} from '@/lib/markdown/dynamic'
import { notFoundMarkdown } from '@/lib/markdown/site'
import {
  collectionMarkdown,
  policyMarkdown,
  productMarkdown,
  shopIndexMarkdown,
} from '@/lib/markdown/shop'
import { HIDDEN_COLLECTION_TILES } from '@/data/shop'
import { getPolicy } from '@/lib/policies'
import {
  getCollection,
  getCollections,
  getProduct,
  getProducts,
  isShopifyConfigured,
} from '@/lib/shopify'

/**
 * Markdown twin of every public page. Not linked directly: proxy.ts
 * rewrites `Accept: text/markdown` requests and `*.md` URLs here, so
 * /about and /about.md both resolve to /markdown/about internally.
 *
 * Unknown paths return a real 404 with a markdown body (site map + where
 * to look next), which is what agents need to recover.
 */

// Rendered per request (the path is a dynamic param). The Convex-backed
// pages read through the same cache as the HTML pages (lib/content.ts), so
// both variants show the same content. Failed reads throw and are never
// cached, so a 503 can't stick.

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

export async function GET(
  _request: Request,
  { params }: RouteContext<'/markdown/[[...path]]'>
) {
  const segments = (await params).path ?? []
  const pathname = '/' + segments.map(decodeURIComponent).join('/')
  const canonical = `https://thegoodfornothings.club${pathname}`

  const renderStatic = STATIC_MARKDOWN[pathname]
  if (renderStatic)
    return markdown(renderStatic(), 200, { 'Content-Location': canonical })

  try {
    if (pathname === '/about') {
      const members = await getListedMembers()
      const founding = members.filter(m =>
        leadershipSlugs.includes(m.slug.current)
      )
      const past = members.filter(m => pastMemberSlugs.includes(m.slug.current))
      return markdown(aboutMarkdown(founding, past), 200, {
        'Content-Location': canonical,
      })
    }

    if (pathname === '/projects') {
      const data = await getProjectsListPage()
      return markdown(projectsIndexMarkdown(data.projects), 200, {
        'Content-Location': canonical,
      })
    }

    if (segments.length === 2 && segments[0] === 'projects') {
      const project = await getProject(segments[1])
      if (project)
        return markdown(projectMarkdown(project), 200, {
          'Content-Location': canonical,
        })
    }

    if (segments.length === 2 && segments[0] === 'policies') {
      const policy = await getPolicy(segments[1])
      if (policy)
        return markdown(policyMarkdown(policy), 200, {
          'Content-Location': canonical,
        })
    }

    if (segments[0] === 'shop' && isShopifyConfigured()) {
      if (segments.length === 1) {
        const [collections, products] = await Promise.all([
          getCollections(),
          getProducts(),
        ])
        return markdown(
          shopIndexMarkdown(
            collections.filter(
              c => !HIDDEN_COLLECTION_TILES.includes(c.handle)
            ),
            products
          ),
          200,
          { 'Content-Location': canonical }
        )
      }
      if (segments.length === 3 && segments[1] === 'collections') {
        const collection = await getCollection(segments[2])
        if (collection)
          return markdown(collectionMarkdown(collection), 200, {
            'Content-Location': canonical,
          })
      }
      if (segments.length === 3 && segments[1] === 'products') {
        const product = await getProduct(segments[2])
        if (product)
          return markdown(productMarkdown(product), 200, {
            'Content-Location': canonical,
          })
      }
    }

    if (segments.length === 2 && segments[0] === 'members') {
      const member = await getMember(segments[1])
      if (member) {
        const projects = await getProjectsByMember(member._id)
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
