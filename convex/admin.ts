import { getAuthUserId } from '@convex-dev/auth/server'
import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'

// Trigger-aware builder: writes to inquiries must keep its aggregate in sync.
import { inquiriesCount, mediaStats, membersCount, mutation, projectsCount } from './aggregates'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { query } from './_generated/server'
import { inquiryStatusValidator } from './schema'

/**
 * Queries for the /admin pages, plus the one mutation the admin can make:
 * advancing an inquiry's status. Every function requires a signed-in user
 * (accounts are allowlist-only — see convex/auth.ts). CMS content stays
 * read-only by design: the admin is a viewer, not an editor.
 */
async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx)
  if (userId === null) {
    throw new Error('Not authenticated')
  }
  return userId
}

export const counts = query({
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    // O(log n) reads from the aggregates — no table scans. See convex/aggregates.ts.
    const [inquiries, projects, members, media, mediaBytes] = await Promise.all([
      inquiriesCount.count(ctx),
      projectsCount.count(ctx),
      membersCount.count(ctx),
      mediaStats.count(ctx),
      mediaStats.sum(ctx),
    ])
    return { inquiries, projects, members, media, mediaBytes }
  },
})

/** Cheap grand totals for the media page header (avoids scanning the table). */
export const mediaTotals = query({
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    const [count, bytes] = await Promise.all([mediaStats.count(ctx), mediaStats.sum(ctx)])
    return { count, bytes }
  },
})

export const listInquiries = query({
  args: {
    paginationOpts: paginationOptsValidator,
    kind: v.optional(
      v.union(
        v.literal('facility'),
        v.literal('service'),
        v.literal('membership'),
        v.literal('event'),
        v.literal('general')
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const base = args.kind
      ? ctx.db.query('inquiries').withIndex('by_kind', q => q.eq('kind', args.kind!))
      : ctx.db.query('inquiries')
    return await base.order('desc').paginate(args.paginationOpts)
  },
})

export const setInquiryStatus = mutation({
  args: {
    id: v.id('inquiries'),
    status: inquiryStatusValidator,
  },
  handler: async (ctx, { id, status }) => {
    await requireUser(ctx)
    const inquiry = await ctx.db.get(id)
    if (!inquiry) {
      throw new Error('Inquiry not found')
    }
    const patch: { status: typeof status; repliedAt?: number } = { status }
    // Stamp first contact once, so time-to-first-reply survives later moves.
    if (status !== 'new' && inquiry.repliedAt === undefined) {
      patch.repliedAt = Date.now()
    }
    await ctx.db.patch(id, patch)
  },
})

export const listProjects = query({
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    const projects = await ctx.db.query('projects').collect()
    const members = await ctx.db.query('members').collect()
    const memberNames = new Map(members.map(m => [m._id, m.fullName]))
    return projects
      .sort((a, b) => (b.dateCompleted ?? b.dateStarted ?? '').localeCompare(a.dateCompleted ?? a.dateStarted ?? ''))
      .map(project => ({
        _id: project._id,
        title: project.title,
        clientName: project.clientName,
        slug: project.slug,
        type: project.type,
        status: project.status,
        dateStarted: project.dateStarted,
        dateCompleted: project.dateCompleted,
        featured: project.featured ?? false,
        members: project.membersInvolved.map(id => memberNames.get(id) ?? '?'),
        thumbnail:
          project.mainMedia.flatMap(item => (item.kind === 'image' ? [item.image] : []))[0] ?? null,
      }))
  },
})

export const listMembers = query({
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    const members = await ctx.db
      .query('members')
      .withIndex('by_member_number')
      .order('asc')
      .collect()
    return members
  },
})

export const listMedia = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    // Largest assets first (by_size index) so the storage hogs surface on page one.
    return await ctx.db
      .query('media')
      .withIndex('by_size')
      .order('desc')
      .paginate(args.paginationOpts)
  },
})
