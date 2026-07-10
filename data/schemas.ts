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
})

export type InquiryKind = (typeof INQUIRY_KINDS)[number]
export type Inquiry = z.infer<typeof inquirySchema>
