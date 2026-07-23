import { z } from 'zod'

z.union([z.literal(''), z.string().trim().url()])

export const newsletterSignUpSchema = z.object({
  email: z.string().email(),
})

export const INQUIRY_KINDS = [
  'facility',
  'service',
  'membership',
  'event',
  'general',
] as const

/** Inquiry lifecycle, managed from /admin. Stored rows without one are 'new'. */
export const INQUIRY_STATUSES = [
  'new',
  'replied',
  'toured',
  'won',
  'lost',
] as const

/**
 * Self-reported answer to "How'd you hear about us?" — complements the
 * silent first-touch attribution below, which often disagrees with it.
 */
export const REFERRAL_SOURCES = [
  'Friend or word of mouth',
  'Instagram',
  'Google or search',
  'Event at the club',
  'Walked or drove by',
  'Press or article',
  'Other',
] as const

/**
 * How the visitor found the site, captured once per session on first page
 * view (lib/attribution.ts) and attached to every inquiry they submit.
 */
export const attributionSchema = z.object({
  /** Full external referrer URL; absent for direct/same-site arrivals. */
  referrer: z.string().trim().max(1024).optional(),
  utmSource: z.string().trim().max(256).optional(),
  utmMedium: z.string().trim().max(256).optional(),
  utmCampaign: z.string().trim().max(256).optional(),
  /** Path of the first page seen this session, e.g. "/facilities". */
  landingPage: z.string().trim().max(1024).optional(),
})

export const phoneSchema = z
  .string()
  .trim()
  .max(25)
  .optional()
  .refine(
    value =>
      !value ||
      (/^\+?[\d\s().-]+$/.test(value) &&
        (value.match(/\d/g)?.length ?? 0) >= 7),
    { message: 'Enter a valid phone number.' }
  )

export const portfolioSchema = z.union([
  z.literal(''),
  z.string().trim().url({ message: 'Enter a valid URL.' }),
])

export const inquirySchema = z.object({
  kind: z.enum(INQUIRY_KINDS),
  /** What the inquiry is about: facility, service, event, or tier name. */
  item: z.string().min(1).max(256),
  /** A specific offering within the item, e.g. the facility applied for. */
  offering: z.string().trim().max(256).optional(),
  name: z.string().min(1).max(256),
  email: z.string().email(),
  phone: phoneSchema,
  socials: z.array(z.string().trim().max(100)).max(5).optional(),
  portfolio: portfolioSchema.optional(),
  references: z.enum(['Yes', 'No']).optional(),
  message: z.string().max(5000).optional(),
  /** Self-reported "How'd you hear about us?" answer. */
  referralSource: z.enum(REFERRAL_SOURCES).optional(),
  attribution: attributionSchema.optional(),
})

export type InquiryKind = (typeof INQUIRY_KINDS)[number]
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]
export type ReferralSource = (typeof REFERRAL_SOURCES)[number]
export type InquiryAttribution = z.infer<typeof attributionSchema>
export type Inquiry = z.infer<typeof inquirySchema>
