import { v } from 'convex/values'

// Trigger-aware builder so each insert bumps the inquiries count aggregate.
import { mutation } from './aggregates'
import { inquiryAttributionValidator } from './schema'

/**
 * Insert one inquiry. Public by design: called server-side from
 * app/api/inquiry/route.ts, which owns validation (zod) and the
 * notification email. Convex re-checks the shape via these validators.
 */
export const submit = mutation({
  args: {
    kind: v.union(
      v.literal('facility'),
      v.literal('service'),
      v.literal('membership'),
      v.literal('event'),
      v.literal('general')
    ),
    item: v.string(),
    offering: v.optional(v.string()),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    socials: v.optional(v.array(v.string())),
    portfolio: v.optional(v.string()),
    references: v.optional(v.union(v.literal('Yes'), v.literal('No'))),
    message: v.optional(v.string()),
    attribution: v.optional(inquiryAttributionValidator),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('inquiries', args)
  },
})
