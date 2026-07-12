import Link from 'next/link'
import { getImageUrl } from '../../../data/client'
import { GFNC_member, GFNC_project } from '../../../types'
import { fetchQuery } from 'convex/nextjs'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import Image from 'next/image'
import { Metadata, ResolvingMetadata } from 'next'
import ProjectCardSmall from '@/components/ProjectCardSmall'
import { FaCaretLeft } from 'react-icons/fa6'

// Regenerate hourly — matches the old cmsFetch revalidate window.
export const revalidate = 3600

type MemberProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata(
  props: MemberProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params
  const { slug } = params

  const { openGraph } = await parent
  const pathname = '/members/' + slug

  const member = (await fetchQuery(api.members.bySlug, {
    slug,
  })) as unknown as GFNC_member

  return {
    title: `${member.fullName} – Good For Nothings Club`,
    description: `${member.fullName} is a member of The Good For Nothings Club. ${member.roles.join(', ')}.`,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
      images: [getImageUrl(member.profilePicture).width(1200).quality(90).url()],
    },
  }
}

export default async function Member(props: MemberProps) {
  const params = await props.params
  const { slug } = params

  // First get the member data
  const member = (await fetchQuery(api.members.bySlug, {
    slug,
  })) as unknown as GFNC_member

  if (!member) {
    return <div>Member not found</div>
  }

  // Then get the projects data using the member ID
  const projectsData = (await fetchQuery(api.projects.byMemberId, {
    memberId: member._id as Id<'members'>,
  })) as unknown as GFNC_project[]

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
                  src={getImageUrl(member.profilePicture).width(800).quality(90).url()}
                  width={member.profilePicture.asset.metadata.dimensions.width}
                  height={member.profilePicture.asset.metadata.dimensions.height}
                  alt={member.profilePicture.caption}
                  className='w-full border-2 border-black object-cover'
                  style={{ objectPosition }}
                  priority
                  unoptimized
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
                    <p className='text-xl'>#{String(member.memberNumber).padStart(3, '0')}</p>
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
              Projects <span className="font-normal text-3xl align-middle">({projectsData.length})</span>
            </h2>
            <div className='mt-8 md:mt-12'>
              <div className='grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3'>
                {projectsData.map((project) => (
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
