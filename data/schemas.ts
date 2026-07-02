import { z } from 'zod'

z.union([z.literal(''), z.string().trim().url()])

export const contactUsSchema = z.object({
  name: z.string().max(256),
  email: z.string().email(),
  phone: z.string().max(256).optional(),
  website: z.union([z.string().url(), z.literal('')]),
  subject: z.string().max(256),
  message: z.string().max(5000),
})

export const newsletterSignUpSchema = z.object({
  email: z.string().email(),
})

export const INQUIRY_KINDS = [
  'facility',
  'service',
  'membership',
  'event',
] as const

export const inquirySchema = z.object({
  kind: z.enum(INQUIRY_KINDS),
  /** What the inquiry is about: facility, service, event, or tier name. */
  item: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  email: z.string().email(),
  phone: z.string().max(256).optional(),
  message: z.string().max(5000).optional(),
})

export type InquiryKind = (typeof INQUIRY_KINDS)[number]
export type Inquiry = z.infer<typeof inquirySchema>
