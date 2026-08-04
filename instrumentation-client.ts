import { initBotId } from 'botid/client/core'
import posthog from 'posthog-js'

// PostHog product analytics + client error tracking (capture_exceptions
// feeds uncaught errors to the Error Tracking tab; server-side capture
// lives in lib/posthog-server.ts). api_host points at the first-party
// reverse proxy defined in next.config.mjs (rewrites to us.i.posthog.com);
// ui_host keeps toolbar/deep links pointing at the real PostHog app.
// Disabled in local dev so localhost sessions don't pollute the data.

// Third-party noise we can't act on, dropped before it reaches Error
// Tracking. Verified against real events (issue URLs, UAs) on 2026-08-03:
const IGNORED_EXCEPTION_PATTERNS = [
  // Microsoft Outlook SafeLinks scanner executing the page after newsletter
  // sends - its instrumentation throws inside our page context (216 events
  // in one day, all on utm_medium=email URLs).
  /Object Not Found Matching Id:/,
  // Meta's iOS in-app browser probing for its native bridge.
  /window\.webkit\.messageHandlers/,
  // Opaque cross-origin script failure - no message, no stack, nothing to fix.
  /^Script error\.?$/,
  // Chrome pausing an autoplaying background video to save power; playback
  // resumes when the tab is foregrounded.
  /media was paused to save power/,
  // react-player's YouTube loader losing the window.YT vs YT.Player race in
  // slow/bot environments: https://github.com/CookPete/react-player/issues/88
  /\.Player is not a constructor/,
]

if (
  process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development'
) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: '/nothings',
    ui_host: 'https://us.posthog.com',
    defaults: '2025-05-24',
    capture_exceptions: true,
    before_send: event => {
      if (event?.event === '$exception') {
        const exceptions: { value?: unknown }[] =
          event.properties?.$exception_list ?? []
        const noise = exceptions.some(e => {
          const value = e?.value
          return (
            typeof value === 'string' &&
            IGNORED_EXCEPTION_PATTERNS.some(pattern => pattern.test(value))
          )
        })
        if (noise) return null
      }
      return event
    },
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
