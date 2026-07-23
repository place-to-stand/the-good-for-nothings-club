// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'
import { initBotId } from 'botid/client/core'
import posthog from 'posthog-js'

// PostHog product analytics. api_host points at the first-party reverse
// proxy defined in next.config.mjs (rewrites to us.i.posthog.com);
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

Sentry.init({
  enabled: process.env.NEXT_PUBLIC_VERCEL_ENV !== 'development',

  dsn: 'https://b09e651f10614ec57d486de1b4422648@o4506369040187392.ingest.us.sentry.io/4507098361430016',

  sendDefaultPii: true,

  // Add optional integrations for additional features
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  _experiments: { enableLogs: true },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
