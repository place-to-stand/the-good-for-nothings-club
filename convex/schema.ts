import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/** Mirrors inquirySchema in data/schemas.ts, which validates at the API edge. */
export default defineSchema({
  inquiries: defineTable({
    kind: v.union(
      v.literal('facility'),
      v.literal('service'),
      v.literal('membership'),
      v.literal('event'),
      v.literal('general')
    ),
    /** What the inquiry is about: facility, service, event, or tier name. */
    item: v.string(),
    /** A specific offering within the item, e.g. the facility applied for. */
    offering: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    socials: v.optional(v.array(v.string())),
    portfolio: v.optional(v.string()),
    references: v.optional(v.union(v.literal('Yes'), v.literal('No'))),
    message: v.optional(v.string()),
  }).index('by_kind', ['kind']),
})
