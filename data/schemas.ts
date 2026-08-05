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

/**
 * Inquiry lifecycle, managed from /admin. Stored rows without one are 'new'.
 * This is the superset across the three admin boards; each board offers only
 * its own ladder — see PIPELINE_STATUSES. Two kinds of no: 'declined' (they
 * passed on us) vs 'not_a_fit' (we passed on them). 'waitlisted' is approved
 * + ranked, waiting for capacity; 'future' is "right person, wrong time".
 */
export const INQUIRY_STATUSES = [
  'new',
  'replied',
  'tour_booked',
  'toured',
  'waitlisted',
  'future',
  'vetted',
  'joined',
  'declined',
  'not_a_fit',
  'closed',
] as const

/**
 * Retired status spellings that may still be on stored rows until
 * maintenance:migrateInquiryStatuses runs. UI code should render through
 * normalizeInquiryStatus so these never leak into a <select>.
 */
export const LEGACY_INQUIRY_STATUS_MAP = {
  met: 'toured',
  interested: 'toured',
  won: 'joined',
  lost: 'declined',
} as const satisfies Record<string, InquiryStatus>

export function normalizeInquiryStatus(status?: string): InquiryStatus {
  if (!status) return 'new'
  if (status in LEGACY_INQUIRY_STATUS_MAP) {
    return LEGACY_INQUIRY_STATUS_MAP[status as keyof typeof LEGACY_INQUIRY_STATUS_MAP]
  }
  return status as InquiryStatus
}

/**
 * The three admin boards. Every website inquiry kind funnels into exactly
 * one: facilities require membership (tour + approval), services just need
 * vetting, and events/general are a triage inbox.
 */
export const PIPELINES = ['membership', 'services', 'inbox'] as const
export type Pipeline = (typeof PIPELINES)[number]

export const PIPELINE_FOR_KIND = {
  membership: 'membership',
  facility: 'membership',
  service: 'services',
  event: 'inbox',
  general: 'inbox',
} as const satisfies Record<InquiryKind, Pipeline>

/** Stage ladder per board, in display order. */
export const PIPELINE_STATUSES: Record<Pipeline, readonly InquiryStatus[]> = {
  membership: [
    'new',
    'replied',
    'tour_booked',
    'toured',
    'waitlisted',
    'future',
    'joined',
    'declined',
    'not_a_fit',
  ],
  services: ['new', 'replied', 'vetted', 'future', 'joined', 'declined', 'not_a_fit'],
  inbox: ['new', 'replied', 'closed'],
}

/** Terminal stages — reaching one clears any pending follow-up/rank. */
export const CLOSED_INQUIRY_STATUSES: readonly InquiryStatus[] = [
  'joined',
  'declined',
  'not_a_fit',
  'closed',
]

/** Roles a joined member can hold. */
export const MEMBER_ROLES = ['member', 'associate', 'friend'] as const
export type MemberRole = (typeof MEMBER_ROLES)[number]

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  member: 'Member', // rents monthly
  associate: 'Associate', // rents hourly once in the system
  friend: 'Friend', // Discord link, no rental access
}

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
  /** Opted into the mailing list; also subscribes them to the Resend audience. */
  mailingList: z.boolean().optional(),
})

export type InquiryKind = (typeof INQUIRY_KINDS)[number]
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]
export type ReferralSource = (typeof REFERRAL_SOURCES)[number]
export type InquiryAttribution = z.infer<typeof attributionSchema>
export type Inquiry = z.infer<typeof inquirySchema>
