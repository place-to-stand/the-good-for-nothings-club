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

type VideoFile = {
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

// Optimized type for projects list page
export type GFNC_projectListItem = {
  _id: string
  title: string
  clientName: string
  slug: {
    current: string
  }
  type: GFNC_projectType
  mainLink?: string | null
  dateStarted?: string
  dateCompleted?: string
  mainImage?: Image
  mainMedia?: Array<Image | VideoFile> // Fallback for existing components
  membersCount?: number
  membersInvolved: GFNC_member[]
  summary: TypedObject[]
}
