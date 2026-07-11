import { ConvexHttpClient } from 'convex/browser'
import { anyApi } from 'convex/server'

import type { Inquiry } from '@/data/schemas'

/**
 * Persist an inquiry to Convex (schema in convex/schema.ts).
 * Returns false (without throwing) when the database is unavailable or
 * unconfigured - the notification email is the fallback record, and a lead
 * must never be lost to an infra failure.
 */
export async function saveInquiry(inquiry: Inquiry): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL

  if (!url) {
    console.warn(
      'NEXT_PUBLIC_CONVEX_URL not set - inquiry not persisted, email only'
    )
    return false
  }

  try {
    const convex = new ConvexHttpClient(url)
    // Convex rejects explicit undefined values, so optional fields are
    // spread in only when present.
    await convex.mutation(anyApi.inquiries.submit, {
      kind: inquiry.kind,
      item: inquiry.item,
      name: inquiry.name,
      email: inquiry.email,
      ...(inquiry.offering ? { offering: inquiry.offering } : {}),
      ...(inquiry.phone ? { phone: inquiry.phone } : {}),
      ...(inquiry.socials?.length ? { socials: inquiry.socials } : {}),
      ...(inquiry.portfolio ? { portfolio: inquiry.portfolio } : {}),
      ...(inquiry.references ? { references: inquiry.references } : {}),
      ...(inquiry.message ? { message: inquiry.message } : {}),
    })
    return true
  } catch (error) {
    console.error('Failed to persist inquiry:', error)
    return false
  }
}
