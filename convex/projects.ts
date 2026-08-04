import { v } from 'convex/values'

import type { Doc, Id } from './_generated/dataModel'
import type { QueryCtx } from './_generated/server'
import { query } from './_generated/server'
import { byProjectDates, legacyBlocks, legacyProject } from './legacy'
import { projectTypeValidator } from './schema'

/** Public queries backing the site's project pages (former GROQ queries). */

async function membersById(ctx: QueryCtx, projects: Doc<'projects'>[]) {
  const ids = [...new Set(projects.flatMap(project => project.membersInvolved))]
  const members = await Promise.all(ids.map(id => ctx.db.get(id)))
  return new Map(
    members.flatMap((member, i) => (member ? ([[ids[i], member]] as const) : []))
  ) as Map<Id<'members'>, Doc<'members'>>
}

/** Projects list page — normalized card projection.
 *
 * Returns only what ProjectCardSmall renders, with members deduplicated
 * into a top-level array (projects carry memberIds). The full legacyProject
 * shape (overview, caseStudy, photoGallery, full member objects repeated
 * per project) tripled the /projects RSC payload past 500 KB — keep this
 * projection card-sized, and keep members normalized so the payload can't
 * silently re-inflate. Mirrored by GFNC_projectListItem/GFNC_memberCard in
 * types/index.ts. */
export const listPage = query({
  args: { type: v.optional(projectTypeValidator) },
  handler: async (ctx, args) => {
    const projects = args.type
      ? await ctx.db
          .query('projects')
          .withIndex('by_type', q => q.eq('type', args.type!))
          .collect()
      : await ctx.db.query('projects').collect()
    projects.sort(byProjectDates)
    const membersMap = await membersById(ctx, projects)
    const members = [...membersMap.values()].map(member => ({
      _id: member._id,
      fullName: member.fullName,
      slug: { current: member.slug },
      // The avatar stack only reads asset.url (it renders at a fixed 28px
      // and never blurs), so skip lqip/dimensions.
      profilePicture: { asset: { url: member.profilePicture.url, metadata: {} } },
    }))
    return {
      members,
      projects: projects.map(project => {
        const image = project.mainMedia.find(item => item.kind === 'image')
        return {
          _id: project._id,
          title: project.title,
          clientName: project.clientName,
          slug: { current: project.slug },
          type: project.type,
          status: project.status,
          dateStarted: project.dateStarted,
          dateCompleted: project.dateCompleted,
          summary: legacyBlocks(project.summary) ?? [],
          // Like legacyImage but without hotspot/crop/aspectRatio — the
          // card never reads them.
          mainImage:
            image && image.kind === 'image'
              ? {
                  _type: 'image' as const,
                  caption: image.image.caption ?? '',
                  asset: {
                    extension: image.image.extension,
                    url: image.image.url,
                    metadata: {
                      lqip: image.image.lqip,
                      dimensions: {
                        width: image.image.width,
                        height: image.image.height,
                      },
                    },
                  },
                }
              : undefined,
          memberIds: project.membersInvolved,
        }
      }),
    }
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
