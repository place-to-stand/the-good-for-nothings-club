import { Suspense } from 'react'
import { getProjectsListPage } from '@/lib/content'
import {
  projectTypeFilterCss,
  projectTypeFilterScript,
} from '@/lib/projectTypes'
import type { GFNC_projectListItem } from '@/types'
import type { Metadata, ResolvingMetadata } from 'next'
import InProgressSection from './InProgressSection'
import CompletedSection from './CompletedSection'
import ProjectCardSmall from '@/components/ProjectCardSmall'
import { searchMeta } from '@/data/site'
import {
  FilteredListing,
  SelectedTypeMenu,
  TypeMenu,
} from '@/components/ProjectTypeFilter'

// Fully prerendered: every project renders once from cached Convex data
// (lib/content.ts), and the ?type= filter is applied in the browser
// (components/ProjectTypeFilter.tsx), so no request needs a server render.
export const ensureStatic = 'navigation'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/projects' as const

  return {
    ...searchMeta(pathname),
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

export default function Projects() {
  const listing = <ProjectsListing />
  return (
    <main>
      <style>{projectTypeFilterCss()}</style>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <div className='flex flex-col items-center justify-between gap-8 pt-6 md:pt-8'>
            <h1 className='text-[32px] leading-none font-black tracking-[-0.04em] md:text-[48px] lg:text-[96px]'>
              Projects
            </h1>
            <Suspense fallback={<TypeMenu />}>
              <SelectedTypeMenu />
            </Suspense>
          </div>
        </div>
      </section>

      {/* The fallback (the unfiltered listing) is what prerenders; the
          filter reads the query string in the browser. Both slots get the
          same element, so the RSC payload carries the listing once. */}
      <Suspense fallback={<div id='projects-listing'>{listing}</div>}>
        <FilteredListing>{listing}</FilteredListing>
      </Suspense>
      <script dangerouslySetInnerHTML={{ __html: projectTypeFilterScript() }} />
    </main>
  )
}

async function ProjectsListing() {
  const data = await getProjectsListPage()

  // Resolve ids to the shared member instances. Every card referencing a
  // member gets the same object, so React Flight serializes each member
  // once by reference — this keeps the page HTML under the 500 KB budget
  // enforced by scripts/seo-check.mjs.
  const memberById = new Map(data.members.map(member => [member._id, member]))
  const allProjects: GFNC_projectListItem[] = data.projects.map(
    ({ memberIds, ...project }) => ({
      ...project,
      membersInvolved: memberIds.flatMap(id => memberById.get(id) ?? []),
    })
  )

  // Group by status. The ?type= filter is applied in the browser
  // (components/ProjectTypeFilter.tsx).
  const inProgressProjectsData = allProjects.filter(
    p => p.status === 'In Progress'
  )
  const completedProjectsData = allProjects.filter(
    p => p.status === 'Completed'
  )
  const pausedProjectsData = allProjects.filter(p => p.status === 'Paused')
  const canceledProjectsData = allProjects.filter(p => p.status === 'Canceled')

  return (
    <>
      {inProgressProjectsData.length > 0 && (
        <section data-project-group className='pt-8 md:px-8 md:pt-16 xl:px-16'>
          <InProgressSection projectsData={inProgressProjectsData} />
        </section>
      )}

      {completedProjectsData.length > 0 && (
        <section data-project-group className='pt-8 md:px-8 md:pt-16 xl:px-16'>
          <CompletedSection projectsData={completedProjectsData} />
        </section>
      )}

      <section data-project-group className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='mx-auto grid max-w-(--page-max-width) grid-cols-1 gap-12 lg:grid-cols-2'>
          {pausedProjectsData.length > 0 && (
            <div
              data-project-group
              className='bg-background mx-auto w-full max-w-(--page-max-width) border-y-2 border-black px-4 pt-6 md:border-x-2 md:px-12 md:pt-12'
            >
              <div className='flex items-center gap-4'>
                <div className='h-5 w-5 rounded-full border-2 border-black bg-yellow-300'></div>
                <h2 className='text-[32px] leading-none font-black tracking-[-0.04em] md:text-[48px] xl:text-[64px]'>
                  Paused
                </h2>
              </div>
              <div className='mt-8 grid max-h-[500px] grid-cols-1 gap-4 overflow-y-scroll pb-6 md:mt-12 md:pb-12'>
                {pausedProjectsData.map(project => (
                  <ProjectCardSmall key={project._id} project={project} />
                ))}
              </div>
            </div>
          )}

          {canceledProjectsData.length > 0 && (
            <div
              data-project-group
              className='bg-background mx-auto w-full max-w-(--page-max-width) border-y-2 border-black px-4 pt-6 md:border-x-2 md:px-12 md:pt-12'
            >
              <div className='flex items-center gap-4'>
                <div className='h-5 w-5 rounded-full border-2 border-black bg-red-300'></div>
                <h2 className='text-[32px] leading-none font-black tracking-[-0.04em] md:text-[48px] xl:text-[64px]'>
                  Canceled
                </h2>
              </div>
              <div className='mt-8 grid max-h-[500px] grid-cols-1 gap-4 overflow-y-scroll pb-6 opacity-65 md:mt-12 md:pb-12'>
                {canceledProjectsData.map(project => (
                  <ProjectCardSmall key={project._id} project={project} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
