import { initBotId } from 'botid/client/core'
import posthog from 'posthog-js'

// PostHog product analytics + client error tracking (capture_exceptions
// feeds uncaught errors to the Error Tracking tab; server-side capture
// lives in lib/posthog-server.ts). api_host points at the first-party
// reverse proxy defined in next.config.mjs (rewrites to us.i.posthog.com);
// ui_host keeps toolbar/deep links pointing at the real PostHog app.
// Disabled in local dev so localhost sessions don't pollute the data.
if (
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development'
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/nothings',
    ui_host: 'https://us.posthog.com',
    defaults: '2025-05-24',
    capture_exceptions: true,
  })
}

// Invisible bot protection (Vercel BotID) for the public form endpoints.
// The client attaches classification headers to these requests; the route
// handlers verify with checkBotId(). Keep this list in sync with the
// checkBotId() call sites.
initBotId({
  protect: [
    { path: '/api/inquiry', method: 'POST' },
    { path: '/api/newsletter-sign-up', method: 'POST' },
  ],
})
