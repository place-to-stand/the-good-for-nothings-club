import type { Instrumentation } from 'next'

/**
 * Uncaught errors in server code (RSC renders, route handlers, server
 * actions) flow to PostHog Error Tracking. Deliberate catches that need
 * reporting call captureServerException directly.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request
) => {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { captureServerException } = await import('./lib/posthog-server')
    await captureServerException(error, {
      path: request.path,
      method: request.method,
    })
  }
}
