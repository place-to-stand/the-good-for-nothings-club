import { v } from 'convex/values'

import type { Doc, Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { query } from './_generated/server'
import { byProjectDates, legacyProject } from './legacy'
import { projectTypeValidator } from './schema'

/** Public queries backing the site's project pages (former GROQ queries). */

async function membersById(ctx: QueryCtx, projects: Doc<'projects'>[]) {
  const ids = [...new Set(projects.flatMap(project => project.membersInvolved))]
  const members = await Promise.all(ids.map(id => ctx.db.get(id)))
  return new Map(
    members.flatMap((member, i) => (member ? ([[ids[i], member]] as const) : []))
  ) as Map<Id<'members'>, Doc<'members'>>
}

/** Projects list page — ALL_PROJECTS_QUERY / FILTERED_PROJECTS_QUERY. */
export const list = query({
  args: { type: v.optional(projectTypeValidator) },
  handler: async (ctx, args) => {
    const projects = args.type
      ? await ctx.db
          .query('projects')
          .withIndex('by_type', q => q.eq('type', args.type!))
          .collect()
      : await ctx.db.query('projects').collect()
    projects.sort(byProjectDates)
    const members = await membersById(ctx, projects)
    return projects.map(project => {
      const legacy = legacyProject(project, members)
      return {
        ...legacy,
        mainImage: legacy.mainMedia.find(media => media._type === 'image'),
        membersCount: project.membersInvolved.length,
      }
    })
  },
})

/** Project detail page — PROJECT_SLUG_QUERY. */
export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const project = await ctx.db
      .query('projects')
      .withIndex('by_slug', q => q.eq('slug', args.slug))
      .unique()
    if (!project) return null
    const members = await membersById(ctx, [project])
    return legacyProject(project, members)
  },
})

/** Member detail page — MEMBER_PROJECTS_QUERY (projects referencing a member). */
export const byMemberId = query({
  args: { memberId: v.id('members') },
  handler: async (ctx, args) => {
    const projects = (await ctx.db.query('projects').collect()).filter(project =>
      project.membersInvolved.includes(args.memberId)
    )
    projects.sort(byProjectDates)
    const members = await membersById(ctx, projects)
    return projects.map(project => legacyProject(project, members))
  },
})

/** Sitemap. */
export const forSitemap = query({
  args: {},
  handler: async ctx => {
    const projects = await ctx.db.query('projects').collect()
    return projects
      .sort((a, b) => (b.dateCompleted ?? '').localeCompare(a.dateCompleted ?? ''))
      .map(project => ({ slug: { current: project.slug }, _updatedAt: project.sanityUpdatedAt }))
  },
})
