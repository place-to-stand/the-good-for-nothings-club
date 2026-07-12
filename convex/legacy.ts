import type { Doc, Id } from './_generated/dataModel'

/**
 * Mappers from the stored Convex shapes to the Sanity/GROQ projection shapes
 * the site's components were written against (see types/index.ts). Keeping
 * the wire format identical confines the Sanity→Convex migration to the data
 * layer — components render unchanged.
 */

type StoredImage = Doc<'members'>['profilePicture']
type StoredVideo = Extract<Doc<'projects'>['mainMedia'][number], { kind: 'video' }>['video']

export function legacyImage(image: StoredImage) {
  return {
    _type: 'image' as const,
    caption: image.caption ?? '',
    ...(image.hotspot ? { hotspot: image.hotspot } : {}),
    ...(image.crop ? { crop: image.crop } : {}),
    asset: {
      extension: image.extension,
      url: image.url,
      metadata: {
        lqip: image.lqip,
        dimensions: {
          width: image.width,
          height: image.height,
          aspectRatio: image.width / image.height,
        },
      },
    },
  }
}

export function legacyVideo(video: StoredVideo) {
  return {
    _type: 'videoFile' as const,
    caption: video.caption ?? '',
    playing: video.playing ?? true,
    loop: video.loop ?? true,
    controls: video.controls ?? true,
    asset: { url: video.url },
  }
}

export function legacyMainMedia(mainMedia: Doc<'projects'>['mainMedia']) {
  return mainMedia.map(item =>
    item.kind === 'image' ? legacyImage(item.image) : legacyVideo(item.video)
  )
}

/**
 * Portable Text image/videoFile blocks are stored flat (same fields as
 * StoredImage/StoredVideo plus _key) — expand them back to asset shape.
 */
export function legacyBlocks(blocks: Array<Record<string, unknown>> | undefined) {
  return blocks?.map(block => {
    if (block._type === 'image') {
      return { _key: block._key, ...legacyImage(block as unknown as StoredImage) }
    }
    if (block._type === 'videoFile') {
      return { _key: block._key, ...legacyVideo(block as unknown as StoredVideo) }
    }
    return block
  })
}

export function legacyMember(member: Doc<'members'>) {
  return {
    _id: member._id,
    _updatedAt: member.sanityUpdatedAt,
    fullName: member.fullName,
    slug: { current: member.slug },
    profilePicture: legacyImage(member.profilePicture),
    hoverProfilePicture: legacyImage(member.hoverProfilePicture),
    roles: member.roles,
    startDate: member.startDate,
    memberNumber: member.memberNumber,
  }
}

export function legacyProject(
  project: Doc<'projects'>,
  membersById: Map<Id<'members'>, Doc<'members'>>
) {
  return {
    _id: project._id,
    _updatedAt: project.sanityUpdatedAt,
    title: project.title,
    clientName: project.clientName,
    slug: { current: project.slug },
    type: project.type,
    status: project.status,
    mainLink: project.mainLink ?? null,
    dateStarted: project.dateStarted,
    dateCompleted: project.dateCompleted,
    mainMedia: legacyMainMedia(project.mainMedia),
    membersInvolved: project.membersInvolved.flatMap(id => {
      const member = membersById.get(id)
      return member ? [legacyMember(member)] : []
    }),
    summary: legacyBlocks(project.summary) ?? [],
    overview: legacyBlocks(project.overview) ?? [],
    photoGallery: (project.photoGallery ?? []).map(legacyImage),
    caseStudy: legacyBlocks(project.caseStudy) ?? [],
  }
}

/** GROQ's `| order(dateStarted desc) | order(dateCompleted desc)` equivalent. */
export function byProjectDates(a: Doc<'projects'>, b: Doc<'projects'>) {
  const completed = (b.dateCompleted ?? '').localeCompare(a.dateCompleted ?? '')
  if (completed !== 0) return completed
  return (b.dateStarted ?? '').localeCompare(a.dateStarted ?? '')
}
