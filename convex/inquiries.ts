import { mutationGeneric as mutation } from 'convex/server'
import { v } from 'convex/values'

/**
 * Insert one inquiry. Public by design: called server-side from
 * app/api/inquiry/route.ts, which owns validation (zod) and the
 * notification email. Convex re-checks the shape via these validators.
 *
 * Uses the generic mutation builder instead of ./_generated/server so the
 * repo typechecks before `npx convex dev` has run its first codegen.
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('inquiries', args)
  },
})
