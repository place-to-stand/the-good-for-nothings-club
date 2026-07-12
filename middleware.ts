import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from '@convex-dev/auth/nextjs/server'

const isLoginPage = createRouteMatcher(['/admin/login'])
const isProtectedAdminRoute = createRouteMatcher(['/admin', '/admin/((?!login).*)'])

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isLoginPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, '/admin')
  }
  if (isProtectedAdminRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, '/admin/login')
  }
})

// Only the admin needs auth — the public site never runs this middleware.
export const config = {
  matcher: ['/admin/:path*'],
}
