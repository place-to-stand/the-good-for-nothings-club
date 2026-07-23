import type { InquiryAttribution } from '@/data/schemas'

/**
 * First-touch attribution, captured once per session (components/
 * AttributionCapture.tsx) and read back when an inquiry is submitted.
 * sessionStorage rather than submit-time capture because visitors rarely
 * inquire from the page they landed on - the UTM/referrer is long gone
 * from the URL by then.
 */

const STORAGE_KEY = 'gfnc_attribution'

/** Mirror data/schemas.ts limits so an oversized value can't 400 the inquiry. */
const clip = (value: string | null | undefined, max: number) =>
  value ? value.slice(0, max) : undefined

export function captureAttribution(): void {
  // sessionStorage can throw (private browsing, blocked storage); an
  // inquiry without attribution beats a page that errors on load.
  try {
    if (sessionStorage.getItem(STORAGE_KEY)) return

    let referrer: string | undefined
    if (document.referrer) {
      const referrerOrigin = new URL(document.referrer).origin
      if (referrerOrigin !== window.location.origin) {
        referrer = document.referrer
      }
    }

    const params = new URLSearchParams(window.location.search)
    const attribution: InquiryAttribution = {
      referrer: clip(referrer, 1024),
      utmSource: clip(params.get('utm_source'), 256),
      utmMedium: clip(params.get('utm_medium'), 256),
      utmCampaign: clip(params.get('utm_campaign'), 256),
      landingPage: clip(window.location.pathname, 1024),
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution))
  } catch {
    // Storage unavailable or referrer unparseable - skip attribution.
  }
}

export function getAttribution(): InquiryAttribution | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as InquiryAttribution) : undefined
  } catch {
    return undefined
  }
}
