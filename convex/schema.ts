import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * CMS field validators, exported for reuse by the migration mutations.
 * See docs/SANITY_TO_CONVEX_MIGRATION.md for the overall design.
 */

/** Sanity hotspot — fractional (0–1) focal point, unaffected by resizing. */
export const hotspotValidator = v.object({
  x: v.number(),
  y: v.number(),
  height: v.optional(v.number()),
  width: v.optional(v.number()),
})

/** Sanity crop — fractional (0–1) insets from each edge. */
export const cropValidator = v.object({
  top: v.number(),
  bottom: v.number(),
  left: v.number(),
  right: v.number(),
})

/**
 * An image resolved at migration time. Denormalized from the media table so
 * pages render without joins; `mediaId` points back to the source of truth.
 */
export const imageFieldValidator = v.object({
  mediaId: v.id('media'),
  url: v.string(),
  width: v.number(),
  height: v.number(),
  extension: v.string(),
  lqip: v.optional(v.string()),
  caption: v.optional(v.string()),
  hotspot: v.optional(hotspotValidator),
  crop: v.optional(cropValidator),
})

/** A video file with the player options from the Sanity videoFile type. */
export const videoFieldValidator = v.object({
  mediaId: v.id('media'),
  url: v.string(),
  caption: v.optional(v.string()),
  playing: v.optional(v.boolean()),
  loop: v.optional(v.boolean()),
  controls: v.optional(v.boolean()),
})

/** mainMedia entry — at most one image (thumbnail/share) plus an optional video. */
export const mainMediaItemValidator = v.union(
  v.object({ kind: v.literal('image'), image: imageFieldValidator }),
  v.object({ kind: v.literal('video'), video: videoFieldValidator })
)

/**
 * Portable Text, stored as opaque JSON. Image/video blocks inside it are
 * rewritten during migration to carry the same inline fields as
 * imageFieldValidator/videoFieldValidator, so serializers need no lookups.
 */
export const portableTextValidator = v.array(v.any())

export const projectTypeValidator = v.union(
  v.literal('Audio'),
  v.literal('Build'),
  v.literal('Event'),
  v.literal('Photo'),
  v.literal('Video'),
  v.literal('Web')
)

export const projectStatusValidator = v.union(
  v.literal('In Progress'),
  v.literal('Completed'),
  v.literal('Paused'),
  v.literal('Canceled')
)

/** Mirrors attributionSchema in data/schemas.ts. */
export const inquiryAttributionValidator = v.object({
  referrer: v.optional(v.string()),
  utmSource: v.optional(v.string()),
  utmMedium: v.optional(v.string()),
  utmCampaign: v.optional(v.string()),
  landingPage: v.optional(v.string()),
})

/** Mirrors INQUIRY_STATUSES in data/schemas.ts. */
export const inquiryStatusValidator = v.union(
  v.literal('new'),
  v.literal('replied'),
  v.literal('toured'),
  v.literal('won'),
  v.literal('lost')
)

export default defineSchema({
  /** Users/sessions/accounts for the /admin sign-in — see convex/auth.ts. */
  ...authTables,

  /** Mirrors inquirySchema in data/schemas.ts, which validates at the API edge. */
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
    /**
     * Self-reported "How'd you hear about us?" answer. Plain string (not a
     * literal union) so option copy can evolve without invalidating rows;
     * bounded to REFERRAL_SOURCES by zod at the API edge.
     */
    referralSource: v.optional(v.string()),
    /** First-touch source captured client-side; absent on older rows. */
    attribution: v.optional(inquiryAttributionValidator),
    /** Lifecycle managed from /admin; absent means 'new'. */
    status: v.optional(inquiryStatusValidator),
    /** Ms epoch when status first left 'new' - time-to-first-reply metric. */
    repliedAt: v.optional(v.number()),
  }).index('by_kind', ['kind']),

  /**
   * One row per asset migrated from Sanity (optimized copy in Convex file
   * storage; untouched originals live in the offline migration archive).
   */
  media: defineTable({
    /** Sanity asset _id (e.g. image-<hash>-<dims>-<ext>) — provenance. */
    sanityAssetId: v.string(),
    storageId: v.id('_storage'),
    /** Serving URL from ctx.storage.getUrl, denormalized into documents. */
    url: v.string(),
    kind: v.union(v.literal('image'), v.literal('file')),
    mimeType: v.string(),
    extension: v.string(),
    /** Bytes as stored (post-optimization). */
    size: v.number(),
    /** Bytes of the Sanity original, for the migration size report. */
    originalSize: v.number(),
    originalFilename: v.optional(v.string()),
    /** Dimensions/lqip of the optimized image (absent for non-image files). */
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    lqip: v.optional(v.string()),
  }).index('by_size', ['size']),

  /** GFNC_project from Sanity — see schemaTypes/GFNC/project.ts in general-data. */
  projects: defineTable({
    sanityId: v.string(),
    /** Sanity _updatedAt (ISO datetime) — sitemap lastModified. */
    sanityUpdatedAt: v.string(),
    title: v.string(),
    clientName: v.string(),
    slug: v.string(),
    type: projectTypeValidator,
    status: projectStatusValidator,
    mainLink: v.optional(v.string()),
    /** YYYY-MM-DD; sort keys for the projects list page. */
    dateStarted: v.optional(v.string()),
    dateCompleted: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    /** Joined in queries — the club has a handful of members, so joins are cheap. */
    membersInvolved: v.array(v.id('members')),
    mainMedia: v.array(mainMediaItemValidator),
    summary: portableTextValidator,
    overview: portableTextValidator,
    photoGallery: v.optional(v.array(imageFieldValidator)),
    caseStudy: v.optional(portableTextValidator),
  })
    .index('by_slug', ['slug'])
    .index('by_type', ['type']),

  /** GFNC_member from Sanity — see schemaTypes/GFNC/member.ts in general-data. */
  members: defineTable({
    sanityId: v.string(),
    sanityUpdatedAt: v.string(),
    fullName: v.string(),
    slug: v.string(),
    profilePicture: imageFieldValidator,
    hoverProfilePicture: imageFieldValidator,
    roles: v.array(v.string()),
    /** YYYY-MM-DD — the date the member joined the club. */
    startDate: v.string(),
    /** The order in which the member joined; /about sorts by this. */
    memberNumber: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_member_number', ['memberNumber']),
})
