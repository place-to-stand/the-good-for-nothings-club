import { getImageUrl } from '../../../data/client'
import { GFNC_project, Image } from '../../../types'
import { toPlainText } from '@portabletext/toolkit'
import { fetchQuery } from 'convex/nextjs'
import { Metadata, ResolvingMetadata } from 'next'
import { api } from '../../../convex/_generated/api'
import {
  WebProject,
  VideoProject,
  PhotoProject,
  AudioProject,
  EventProject,
  BuildProject,
} from './components'

// Regenerate hourly — matches the old cmsFetch revalidate window.
export const revalidate = 3600

type ProjectProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(
  props: ProjectProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params

  const { slug } = params

  const { openGraph } = await parent
  const pathname = '/projects/' + slug

  const project = (await fetchQuery(api.projects.bySlug, {
    slug,
  })) as unknown as GFNC_project

  const mainImage = project.mainMedia.find(
    mainMedia => mainMedia._type === 'image'
  ) as Image

  return {
    title: `${project.title} – ${project.clientName}`,
    description: toPlainText(project.summary),
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
      images: [getImageUrl(mainImage).width(1200).quality(90).url()],
    },
  }
}

export default async function Project(props: ProjectProps) {
  const params = await props.params
  const { slug } = params

  const project = (await fetchQuery(api.projects.bySlug, {
    slug,
  })) as unknown as GFNC_project

  // Route to the appropriate component based on project type
  switch (project.type) {
    case 'Web':
      return <WebProject project={project} />
    case 'Video':
      return <VideoProject project={project} />
    case 'Photo':
      return <PhotoProject project={project} />
    case 'Audio':
      return <AudioProject project={project} />
    case 'Event':
      return <EventProject project={project} />
    case 'Build':
      return <BuildProject project={project} />
    default:
      return <WebProject project={project} /> // fallback to Web project layout
  }
}
