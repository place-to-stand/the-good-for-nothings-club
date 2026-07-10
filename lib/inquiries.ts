import { createClient } from '@supabase/supabase-js'

import type { Inquiry } from '@/data/schemas'

/**
 * Persist an inquiry to Supabase (table defined in db/inquiries.sql).
 * Returns false (without throwing) when the database is unavailable or
 * unconfigured - the notification email is the fallback record, and a lead
 * must never be lost to an infra failure.
 */
export async function saveInquiry(inquiry: Inquiry): Promise<boolean> {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    console.warn(
      'SUPABASE_URL / SUPABASE_SECRET_KEY not set - inquiry not persisted, email only'
    )
    return false
  }

  try {
    const supabase = createClient(url, key)
    const { error } = await supabase.from('inquiries').insert({
      kind: inquiry.kind,
      item: inquiry.item,
      offering: inquiry.offering ?? null,
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone ?? null,
      socials: inquiry.socials?.length ? inquiry.socials.join(', ') : null,
      portfolio: inquiry.portfolio || null,
      references_available: inquiry.references ?? null,
      message: inquiry.message ?? null,
    })

    if (error) {
      console.error('Failed to persist inquiry:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Failed to persist inquiry:', error)
    return false
  }
}
