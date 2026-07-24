import { PostHog } from 'posthog-node'

/**
 * Server-side PostHog error tracking (client-side lives in
 * instrumentation-client.ts). Exceptions surface in PostHog's Error
 * Tracking tab. No-ops in local dev (VERCEL_ENV=development) so dev
 * sessions don't pollute the data, mirroring the client gate.
 *
 * Serverless-shaped: a short-lived client per capture, flushed before
 * return, so events aren't lost when the function instance is recycled.
 */
export async function captureServerException(
  error: unknown,
  properties?: Record<string, unknown>
): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key || process.env.VERCEL_ENV === 'development') return

  try {
    const posthog = new PostHog(key, {
      host: 'https://us.i.posthog.com',
      flushAt: 1,
      flushInterval: 0,
    })
    posthog.captureException(
      error instanceof Error ? error : new Error(String(error)),
      undefined,
      properties
    )
    await posthog.shutdown()
  } catch (captureError) {
    // Error reporting must never take down the request that triggered it.
    console.error('PostHog exception capture failed:', captureError)
  }
}
