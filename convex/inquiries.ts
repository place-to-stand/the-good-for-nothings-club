import { v } from 'convex/values'

// Trigger-aware builders so inserts/deletes keep the count aggregate in sync.
import { internalMutation, mutation } from './aggregates'
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
    // Plain string (not a literal union) so option copy can evolve
    // without invalidating stored rows. Bounded by zod at the API edge.
    referralSource: v.optional(v.string()),
    attribution: v.optional(inquiryAttributionValidator),
    mailingList: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('inquiries', args)
  },
})

/**
 * CLI-only cleanup for test submissions (no UI path deletes inquiries):
 *   npx convex run inquiries:remove '{"id":"<_id>"}' [--prod]
 * Trigger-aware, so the admin count aggregate stays in sync — never
 * delete rows from the dashboard.
 */
export const remove = internalMutation({
  args: { id: v.id('inquiries') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
  },
})
