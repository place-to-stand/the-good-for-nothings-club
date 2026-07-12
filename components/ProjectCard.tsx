import { GFNC_project } from '@/types'
import Image from 'next/image'
import { getImageUrl } from '@/data/client'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import getProjectDateString from '@/lib/getProjectDateString'
import MemberAvatarStack from './MemberAvatarStack'
import { Badge } from './ui/badge'

type ProjectCardProps = {
  project: GFNC_project
  priority?: boolean
}

export default function ProjectCard({
  project,
  priority = false,
}: ProjectCardProps) {
  const mainMedia = project.mainMedia.find(
    mainMedia => mainMedia._type === 'image'
  )

  if (!mainMedia) return null

  const date = getProjectDateString(project)

  return (
    <div key={project._id} className="relative h-full flex flex-col group border-1 border-black/15 transition-colors hover:border-black">
      <Image
        src={
          mainMedia.asset.extension === 'gif'
            ? getImageUrl(mainMedia).url()
            : getImageUrl(mainMedia).width(1600).quality(90).url()
        }
        width={mainMedia.asset.metadata.dimensions.width}
        height={mainMedia.asset.metadata.dimensions.height}
        alt={mainMedia.caption}
        className='aspect-video object-cover object-top'
        priority={priority}
        placeholder={mainMedia.asset.metadata.lqip}
      />
      <div className='grow-1 relative flex flex-col justify-between gap-5 p-4 transition-colors bg-black/5 group-hover:bg-black/10'>
        <div className='flex items-start gap-3'>
          <div className='space-y-1'>
            <h2 className='relative z-10 text-[20px] leading-[1.1] font-bold sm:text-[28px]'>
              <Link
                href={`/projects/${project.slug.current}`}
                className='relative z-10 block hover:no-underline'
              >
                {project.title}
              </Link>
            </h2>
            <div className='portable-text font-sans text-base leading-tight font-light tracking-wide'>
              <PortableText value={project.summary} />
            </div>
          </div>
        </div>
        <div className='flex items-end justify-between gap-x-2 gap-y-1'>
          <div className='font-sans leading-none uppercase'>
            <div className='leading-tighter text-sm font-bold text-balance'>
              {project.clientName}
            </div>
            <div className='mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs'>
              <Badge className='font-normal'>{project.type}</Badge>
              {date && <span>{date}</span>}
            </div>
          </div>
          {project.membersInvolved && project.membersInvolved.length > 0 && (
            <MemberAvatarStack members={project.membersInvolved} size='sm' />
          )}
        </div>
      </div>
        <Link
          href={`/projects/${project.slug.current}`}
          className='absolute top-0 right-0 bottom-0 left-0'
        />
    </div>
  )
}
