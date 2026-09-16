import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server'
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from 'next/server'

import {
  markdownAlternatePath,
  prefersMarkdown,
  stripMarkdownSuffix,
} from './lib/markdown/accept'

const isLoginPage = createRouteMatcher(['/admin/login'])
const isProtectedAdminRoute = createRouteMatcher([
  '/admin',
  '/admin/((?!login).*)',
])
// Only the admin needs auth. /api/auth is Convex Auth's proxy route
// (sign-in/sign-out/token refresh round-trip through it to manage the
// httpOnly cookies).
const needsAuth = createRouteMatcher(['/admin', '/admin/(.*)', '/api/auth'])

const authMiddleware = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (isLoginPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, '/admin')
    }
    if (
      isProtectedAdminRoute(request) &&
      !(await convexAuth.isAuthenticated())
    ) {
      return nextjsMiddlewareRedirect(request, '/admin/login')
    }
  }
)

/**
 * Next 16 "proxy" (the former middleware.ts, Node runtime).
 *
 * Public pages have a markdown twin (app/markdown/[[...path]]/route.ts),
 * per acceptmarkdown.com: `Accept: text/markdown` on any page URL, or the
 * `.md` alternate URL, is rewritten to it. HTML responses advertise the
 * alternate with a Link header and carry `Vary: Accept` so a CDN never
 * serves one variant to a client that asked for the other.
 */
export default async function proxy(
  request: NextRequest,
  event: NextFetchEvent
) {
  if (needsAuth(request)) return authMiddleware(request, event)

  const { pathname } = request.nextUrl
  const mdPath = stripMarkdownSuffix(pathname)
  const wantsMarkdown =
    mdPath !== null || prefersMarkdown(request.headers.get('accept'))

  if (wantsMarkdown) {
    const target = request.nextUrl.clone()
    target.pathname = `/markdown${mdPath ?? (pathname === '/' ? '' : pathname.replace(/\/+$/, ''))}`
    const response = NextResponse.rewrite(target)
    response.headers.set('Vary', 'Accept')
    return response
  }

  const response = NextResponse.next()
  response.headers.append('Vary', 'Accept')
  response.headers.append(
    'Link',
    `<${markdownAlternatePath(pathname)}>; rel="alternate"; type="text/markdown"`
  )
  return response
}

export const config = {
  // Everything except Next internals, the PostHog proxy, the form/feed API
  // routes (except /api/auth, handled above), and static files by extension
  // (.md is the one extension we do want).
  matcher: [
    '/admin/:path*',
    '/api/auth',
    '/((?!_next/|nothings/|api/|markdown/|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif|mp4|webm|txt|xml|json|css|js|map|woff2?)$).*)',
  ],
}
