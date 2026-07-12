import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import {
  imageFieldValidator,
  mainMediaItemValidator,
  portableTextValidator,
  projectStatusValidator,
  projectTypeValidator,
} from './schema'

/**
 * One-off Sanity→Convex migration endpoints, driven by
 * scripts/migrate-sanity/migrate.mjs. Every function requires a shared
 * secret matching the MIGRATION_SECRET deployment env var; when that var
 * is unset (the steady state after migrating), they all refuse to run.
 */
function assertMigrationSecret(secret: string) {
  const expected = process.env.MIGRATION_SECRET
  if (!expected || secret !== expected) {
    throw new Error('Migration is disabled or the secret is incorrect')
  }
}

export const generateUploadUrl = mutation({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertMigrationSecret(args.secret)
    return await ctx.storage.generateUploadUrl()
  },
})

/** Everything already migrated, so the script can skip uploads on re-runs. */
export const existingState = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertMigrationSecret(args.secret)
    const [media, members, projects] = await Promise.all([
      ctx.db.query('media').collect(),
      ctx.db.query('members').collect(),
      ctx.db.query('projects').collect(),
    ])
    return {
      media: media.map(m => ({
        mediaId: m._id,
        sanityAssetId: m.sanityAssetId,
        url: m.url,
        size: m.size,
        width: m.width,
        height: m.height,
        extension: m.extension,
        lqip: m.lqip,
      })),
      members: members.map(m => ({ memberId: m._id, sanityId: m.sanityId })),
      projects: projects.map(p => ({ projectId: p._id, sanityId: p.sanityId })),
    }
  },
})

const mediaFields = {
  sanityAssetId: v.string(),
  storageId: v.id('_storage'),
  kind: v.union(v.literal('image'), v.literal('file')),
  mimeType: v.string(),
  extension: v.string(),
  size: v.number(),
  originalSize: v.number(),
  originalFilename: v.optional(v.string()),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  lqip: v.optional(v.string()),
}

export const upsertMedia = mutation({
  args: { secret: v.string(), media: v.object(mediaFields) },
  handler: async (ctx, args) => {
    assertMigrationSecret(args.secret)
    const { media } = args
    const url = await ctx.storage.getUrl(media.storageId)
    if (url === null) throw new Error(`No storage file for ${media.sanityAssetId}`)

    const existing = await ctx.db
      .query('media')
      .withIndex('by_sanity_asset_id', q => q.eq('sanityAssetId', media.sanityAssetId))
      .unique()
    if (existing) {
      // Re-upload of an already-migrated asset: drop the replaced file.
      if (existing.storageId !== media.storageId) {
        await ctx.storage.delete(existing.storageId)
      }
      await ctx.db.replace(existing._id, { ...media, url })
      return { mediaId: existing._id, url }
    }
    const mediaId = await ctx.db.insert('media', { ...media, url })
    return { mediaId, url }
  },
})

const memberFields = {
  sanityId: v.string(),
  sanityUpdatedAt: v.string(),
  fullName: v.string(),
  slug: v.string(),
  profilePicture: imageFieldValidator,
  hoverProfilePicture: imageFieldValidator,
  roles: v.array(v.string()),
  startDate: v.string(),
  memberNumber: v.number(),
}

export const upsertMember = mutation({
  args: { secret: v.string(), member: v.object(memberFields) },
  handler: async (ctx, args) => {
    assertMigrationSecret(args.secret)
    const { member } = args
    const existing = await ctx.db
      .query('members')
      .withIndex('by_sanity_id', q => q.eq('sanityId', member.sanityId))
      .unique()
    if (existing) {
      await ctx.db.replace(existing._id, member)
      return { memberId: existing._id }
    }
    return { memberId: await ctx.db.insert('members', member) }
  },
})

const projectFields = {
  sanityId: v.string(),
  sanityUpdatedAt: v.string(),
  title: v.string(),
  clientName: v.string(),
  slug: v.string(),
  type: projectTypeValidator,
  status: projectStatusValidator,
  mainLink: v.optional(v.string()),
  dateStarted: v.optional(v.string()),
  dateCompleted: v.optional(v.string()),
  featured: v.optional(v.boolean()),
  membersInvolved: v.array(v.id('members')),
  mainMedia: v.array(mainMediaItemValidator),
  summary: portableTextValidator,
  overview: portableTextValidator,
  photoGallery: v.optional(v.array(imageFieldValidator)),
  caseStudy: v.optional(portableTextValidator),
}

export const upsertProject = mutation({
  args: { secret: v.string(), project: v.object(projectFields) },
  handler: async (ctx, args) => {
    assertMigrationSecret(args.secret)
    const { project } = args
    const existing = await ctx.db
      .query('projects')
      .withIndex('by_sanity_id', q => q.eq('sanityId', project.sanityId))
      .unique()
    if (existing) {
      await ctx.db.replace(existing._id, project)
      return { projectId: existing._id }
    }
    return { projectId: await ctx.db.insert('projects', project) }
  },
})

/** Referential-integrity + count report, run by the script after migrating. */
export const verify = query({
  args: { secret: v.string() },
  handler: async (ctx, args) => {
    assertMigrationSecret(args.secret)
    const [media, members, projects] = await Promise.all([
      ctx.db.query('media').collect(),
      ctx.db.query('members').collect(),
      ctx.db.query('projects').collect(),
    ])
    const mediaIds = new Set(media.map(m => m._id))
    const memberIds = new Set(members.map(m => m._id))
    const problems: string[] = []

    const checkImage = (owner: string, field: string, image?: { mediaId: string }) => {
      if (image && !mediaIds.has(image.mediaId as never)) {
        problems.push(`${owner}: ${field} points at missing media ${image.mediaId}`)
      }
    }

    for (const member of members) {
      checkImage(member.slug, 'profilePicture', member.profilePicture)
      checkImage(member.slug, 'hoverProfilePicture', member.hoverProfilePicture)
    }
    for (const project of projects) {
      for (const id of project.membersInvolved) {
        if (!memberIds.has(id)) problems.push(`${project.slug}: missing member ${id}`)
      }
      for (const item of project.mainMedia) {
        checkImage(project.slug, 'mainMedia', item.kind === 'image' ? item.image : item.video)
      }
      for (const image of project.photoGallery ?? []) {
        checkImage(project.slug, 'photoGallery', image)
      }
      for (const block of [...(project.caseStudy ?? []), ...project.summary, ...project.overview]) {
        if (
          (block._type === 'image' || block._type === 'videoFile') &&
          !mediaIds.has(block.mediaId)
        ) {
          problems.push(`${project.slug}: portable text ${block._type} missing media`)
        }
      }
    }

    return {
      counts: {
        projects: projects.length,
        members: members.length,
        media: media.length,
      },
      totalMediaBytes: media.reduce((sum, m) => sum + m.size, 0),
      totalOriginalBytes: media.reduce((sum, m) => sum + m.originalSize, 0),
      projectSlugs: projects.map(p => p.slug).sort(),
      problems,
    }
  },
})
