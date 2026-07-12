import { v } from 'convex/values'

import { query } from './_generated/server'
import { legacyMember } from './legacy'

/** Public queries backing the site's member pages (former GROQ queries). */

/** Member detail page — MEMBER_SLUG_QUERY. */
export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query('members')
      .withIndex('by_slug', q => q.eq('slug', args.slug))
      .unique()
    return member ? legacyMember(member) : null
  },
})

/** About page — MEMBERS_BY_SLUGS_QUERY, ordered by memberNumber. */
export const bySlugs = query({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query('members')
      .withIndex('by_member_number')
      .order('asc')
      .collect()
    return members
      .filter(member => args.slugs.includes(member.slug))
      .map(legacyMember)
  },
})

/** Sitemap — LISTED_MEMBERS_QUERY, ordered by startDate. */
export const forSitemap = query({
  args: { slugs: v.array(v.string()) },
  handler: async (ctx, args) => {
    const members = await ctx.db.query('members').collect()
    return members
      .filter(member => args.slugs.includes(member.slug))
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .map(member => ({ slug: { current: member.slug }, _updatedAt: member.sanityUpdatedAt }))
  },
})
