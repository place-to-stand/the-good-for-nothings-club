import Link from 'next/link'
import { getImageUrl } from '@/data/client'
import {
  getMember,
  getProjectsByMember,
  listedMemberSlugs,
} from '@/lib/content'
import Image from 'next/image'
import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import DetailFallback from '@/components/DetailFallback'
import ProjectCardSmall from '@/components/ProjectCardSmall'
import { memberWebsites, pastMemberSlugs } from '@/data/leadership'
import { FaCaretLeft } from 'react-icons/fa6'

// Prerendered from cached Convex data (refreshed hourly, see
// lib/content.ts). Only leadership and past members are linked anywhere;
// any other member slug renders on first visit and is cached after.
export const ensureStatic = 'navigation'

export function generateStaticParams() {
  return listedMemberSlugs.map(slug => ({ slug }))
}

type MemberProps = PageProps<'/members/[slug]'>

export async function generateMetadata(
  props: MemberProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params
  const { slug } = params

  const { openGraph } = await parent
  const pathname = '/members/' + slug

  const member = await getMember(slug)

  if (!member) notFound()

  const memberKind = pastMemberSlugs.includes(slug)
    ? 'a past member'
    : 'a founding member'
  const roleList =
    member.roles.length > 1
      ? `${member.roles.slice(0, -1).join(', ')} & ${member.roles.at(-1)}`
      : member.roles[0]
  // Short month keeps the longest description (Jason's) under the 158-char
  // SERP truncation budget.
  const memberSince = new Date(member.startDate).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return {
    title: member.fullName,
    description: `${member.fullName} is ${memberKind} of The Good for Nothings Club in Austin, TX — ${roleList}. Member #${String(member.memberNumber).padStart(3, '0')} since ${memberSince}.`,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
      images: [
        getImageUrl(member.profilePicture).width(1200).quality(90).url(),
      ],
    },
  }
}

// params are awaited inside Suspense so every member page shares one App
// Shell (DetailFallback), shown the instant a link is clicked.
export default function Member(props: MemberProps) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <MemberContent params={props.params} />
    </Suspense>
  )
}

async function MemberContent({ params }: Pick<MemberProps, 'params'>) {
  const { slug } = await params

  // First get the member data
  const member = await getMember(slug)

  if (!member) notFound()

  // Then get the projects data using the member ID
  const projectsData = await getProjectsByMember(member._id)

  const website = memberWebsites[slug]

  const objectPosition = `${(member.profilePicture.hotspot?.x || 1) * 100}% ${(member.profilePicture.hotspot?.y || 1) * 100}%`

  return (
    <main>
      <section className='md:px-8 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-b-2 border-black md:border-x-2'>
          {/* Back button */}
          <div className='px-4 pt-6 md:px-12 md:pt-12'>
            <Link
              href='/about'
              className='inline-flex items-center gap-1 font-sans text-sm font-bold uppercase'
            >
              <FaCaretLeft className='h-4.5 w-4.5' />
              Back to About
            </Link>
          </div>

          {/* Member header */}
          <div className='px-4 py-6 md:px-12 md:py-12'>
            <div className='flex flex-col gap-8 lg:flex-row lg:gap-16'>
              {/* Profile image */}
              <div className='flex-shrink-0 lg:w-1/3'>
                <Image
                  src={getImageUrl(member.profilePicture)
                    .width(800)
                    .quality(90)
                    .url()}
                  width={member.profilePicture.asset.metadata.dimensions.width}
                  height={
                    member.profilePicture.asset.metadata.dimensions.height
                  }
                  alt={member.profilePicture.caption}
                  sizes='(min-width: 1024px) 33vw, 100vw'
                  className='w-full border-2 border-black object-cover'
                  style={{ objectPosition }}
                  loading='eager'
                  fetchPriority='high'
                  placeholder='blur'
                  blurDataURL={member.profilePicture.asset.metadata.lqip}
                />
              </div>

              {/* Member info */}
              <div className='flex-1 space-y-8'>
                <div>
                  <h1 className='text-[32px] leading-none font-black tracking-[-0.04em] md:text-[48px] lg:text-[64px]'>
                    {member.fullName}
                  </h1>
                </div>

                <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
                  <div>
                    <h3 className='mb-2 text-xl font-bold'>Member Number</h3>
                    <p className='text-xl'>
                      #{String(member.memberNumber).padStart(3, '0')}
                    </p>
                  </div>

                  <div>
                    <h3 className='mb-2 text-xl font-bold'>Member Since</h3>
                    <p className='text-xl'>
                      {new Date(member.startDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      })}
                    </p>
                  </div>

                  {website && (
                    <div className='md:col-span-2 lg:col-span-1 xl:col-span-2'>
                      <h3 className='mb-2 text-xl font-bold'>Website</h3>
                      <p className='text-xl'>
                        <a href={website} className='underline'>
                          {website.replace(/^https?:\/\//, '')}
                        </a>
                      </p>
                    </div>
                  )}

                  <div className='md:col-span-2 lg:col-span-1 xl:col-span-2'>
                    <h3 className='mb-2 text-xl font-bold'>Roles</h3>
                    <div className='flex flex-wrap gap-2'>
                      {member.roles.map((role: string, index: number) => (
                        <span
                          key={index}
                          className='rounded-full bg-black px-4 py-2 font-sans text-sm text-white'
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects section */}
      {projectsData.length > 0 && (
        <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
          <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
            <h2 className='text-[32px] leading-none font-black tracking-[-0.04em] md:text-[48px] lg:text-[64px]'>
              Projects{' '}
              <span className='align-middle text-3xl font-normal'>
                ({projectsData.length})
              </span>
            </h2>
            <div className='mt-8 md:mt-12'>
              <div className='grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3'>
                {projectsData.map(project => (
                  <ProjectCardSmall key={project._id} project={project} />
                ))}
              </div>
            </div>
          </div>
          <div className='bg-background mx-auto max-w-(--page-max-width) border-b-2 border-black md:border-x-2'>
            <Link
              className='group flex w-full items-center justify-center gap-2 py-4 text-center font-sans text-sm leading-none font-black uppercase transition-colors hover:bg-black/10 hover:no-underline active:bg-black/20 md:py-8 md:text-base'
              href='/projects'
            >
              <span>View All Projects</span>
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}
