import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'

import type { QueryCtx } from './_generated/server'
import { query } from './_generated/server'

/**
 * Read-only queries for the /admin pages. Every query requires a signed-in
 * user (accounts are allowlist-only — see convex/auth.ts). No mutations are
 * exposed here by design: the admin is a viewer, not an editor.
 */
async function requireUser(ctx: QueryCtx) {
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
    const [inquiries, projects, members, media] = await Promise.all([
      ctx.db.query('inquiries').collect(),
      ctx.db.query('projects').collect(),
      ctx.db.query('members').collect(),
      ctx.db.query('media').collect(),
    ])
    return {
      inquiries: inquiries.length,
      projects: projects.length,
      members: members.length,
      media: media.length,
      mediaBytes: media.reduce((sum, m) => sum + m.size, 0),
    }
  },
})

export const listInquiries = query({
  args: {
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
    const inquiries = args.kind
      ? await ctx.db
          .query('inquiries')
          .withIndex('by_kind', q => q.eq('kind', args.kind!))
          .order('desc')
          .collect()
      : await ctx.db.query('inquiries').order('desc').collect()
    return inquiries
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
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    const media = await ctx.db.query('media').collect()
    return media.sort((a, b) => b.size - a.size)
  },
})
