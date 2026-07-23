import posthog from 'posthog-js'

/**
 * PostHog custom events. Init happens in instrumentation-client.ts and is
 * skipped in local dev, so callers use this wrapper instead of posthog
 * directly - it no-ops (rather than warns) when analytics is off.
 *
 * Conventions: snake_case past-tense names, and properties carry the what
 * (kind/item/tier), never the who - names and emails stay out of analytics.
 */
export function captureEvent(
  name: string,
  properties?: Record<string, unknown>
): void {
  if (posthog.__loaded) posthog.capture(name, properties)
}
