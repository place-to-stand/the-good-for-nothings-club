import { getImageUrl } from '@/data/client'
import { Image } from '@/types'
import { toPlainText } from '@portabletext/toolkit'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import DetailFallback from '@/components/DetailFallback'
import { getProject, getProjectsForSitemap } from '@/lib/content'
import { TITLE_SUFFIX } from '@/data/site'
import {
  WebProject,
  VideoProject,
  PhotoProject,
  AudioProject,
  EventProject,
  BuildProject,
} from './components'

// Every project page is prerendered from cached Convex data (refreshed
// hourly, see lib/content.ts). A project added after the deploy renders on
// its first visit, which waits for the full page rather than streaming a
// fallback, and is cached from then on.
export const ensureStatic = 'navigation'

export async function generateStaticParams() {
  const projects = await getProjectsForSitemap()
  return projects.map(project => ({ slug: project.slug.current }))
}

type ProjectProps = PageProps<'/projects/[slug]'>

export async function generateMetadata(
  props: ProjectProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params

  const { slug } = params

  const { openGraph } = await parent
  const pathname = '/projects/' + slug

  const project = await getProject(slug)

  if (!project) notFound()

  const mainImage = project.mainMedia.find(
    mainMedia => mainMedia._type === 'image'
  ) as Image

  // The root layout template appends TITLE_SUFFIX, so club
  // projects use the bare title (avoids the brand twice) and client projects
  // drop the template when the combined title would blow past ~60 chars.
  const isClubProject = project.clientName === 'The Good for Nothings Club'
  const baseTitle = isClubProject
    ? project.title.trim()
    : `${project.title.trim()} – ${project.clientName}`
  const title =
    baseTitle.length + TITLE_SUFFIX.length <= 60
      ? baseTitle
      : { absolute: baseTitle }

  return {
    title,
    description: project.seoDescription ?? toPlainText(project.summary),
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

// params are awaited inside Suspense so every project shares one App Shell
// (the frame in DetailFallback), which a plain <Link> prefetches and shows
// the instant it's clicked.
export default function Project(props: ProjectProps) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <ProjectContent params={props.params} />
    </Suspense>
  )
}

async function ProjectContent({ params }: Pick<ProjectProps, 'params'>) {
  const { slug } = await params

  const project = await getProject(slug)

  if (!project) notFound()

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
