import type { TypedObject } from '@portabletext/types'

export type Image = {
  _type: 'image'
  asset: {
    extension: string
    url: string
    metadata: {
      lqip: `data:image/${string}`
      dimensions: {
        aspectRatio: number
        height: number
        width: number
      }
    }
  }
  hotspot?: {
    x: number
    y: number
  }
  caption: string
}

export type VideoFile = {
  _type: 'videoFile'
  asset: {
    url: string
  }
  caption: string
  controls: boolean
  loop: boolean
  playing: boolean
}

export type GFNC_member = {
  _id: string
  _updatedAt?: string
  fullName: string
  slug: {
    current: string
  }
  profilePicture: Image
  hoverProfilePicture: Image
  roles: string[]
  startDate: string
  memberNumber: number
}

export type GFNC_projectType =
  | 'Web'
  | 'Video'
  | 'Photo'
  | 'Audio'
  | 'Event'
  | 'Build'

export type GFNC_projectStatus =
  | 'In Progress'
  | 'Completed'
  | 'Paused'
  | 'Canceled'

export type GFNC_project = {
  _id: string
  _updatedAt: string
  title: string
  clientName: string
  slug: {
    current: string
  }
  seoDescription?: string | null
  type: GFNC_projectType
  status: GFNC_projectStatus
  mainLink?: string | null
  dateStarted?: string
  dateCompleted?: string
  mainMedia: Array<Image | VideoFile>
  summary: TypedObject[]
  overview: TypedObject[]
  photoGallery: Image[]
  caseStudy: TypedObject[]
  membersInvolved: GFNC_member[]
}

/**
 * Slim member shape returned by projects.listPage — exactly what
 * MemberAvatarStack renders. GFNC_member is structurally assignable to it,
 * so components typed with this accept full members too.
 */
export type GFNC_memberCard = {
  _id: string
  fullName: string
  slug: {
    current: string
  }
  profilePicture: {
    asset: {
      url: string
      metadata: {
        lqip?: `data:image/${string}`
      }
    }
  }
}

/**
 * Optimized type for the projects list page. Mirrors what
 * convex/projects.ts `listPage` actually returns (after the page resolves
 * memberIds to shared GFNC_memberCard instances) — do not add fields here
 * without adding them to the projection.
 */
export type GFNC_projectListItem = {
  _id: string
  title: string
  clientName: string
  slug: {
    current: string
  }
  type: GFNC_projectType
  status: string
  dateStarted?: string
  dateCompleted?: string
  mainImage?: {
    _type: 'image'
    caption: string
    asset: {
      extension: string
      url: string
      metadata: {
        lqip?: `data:image/${string}`
        dimensions: {
          width: number
          height: number
        }
      }
    }
  }
  mainMedia?: Array<Image | VideoFile> // never returned by listPage; only so cards can accept GFNC_project too
  membersInvolved: GFNC_memberCard[]
  summary: TypedObject[]
}
