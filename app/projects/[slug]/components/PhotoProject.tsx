import Link from 'next/link'
import { getImageUrl } from '../../../../data/client'
import { GFNC_project } from '../../../../types'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import MemberAvatarStack from '@/components/MemberAvatarStack'
import { Badge } from '@/components/ui/badge'
import { getProjectStatusColor } from '@/lib/utils'

const MediaPlayer = dynamic(() => import('@/components/MediaPlayer'))
const PhotoGallery = dynamic(() => import('@/components/PhotoGallery'))

type PhotoProjectProps = {
  project: GFNC_project
}

export default function PhotoProject({ project }: PhotoProjectProps) {
  const mainMedia =
    project.mainMedia.find(mainMedia => mainMedia._type === 'videoFile') ||
    project.mainMedia.find(mainMedia => mainMedia._type === 'image')

  if (!mainMedia) return null

  return (
    <main>
      <section className='md:px-8 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-b-2 border-black md:border-x-2'>
          <div className='space-y-4 px-4 py-12 text-center lg:space-y-8 lg:px-12 lg:py-24'>
            <h1 className='text-[48px] leading-none font-black tracking-[-0.04em] lg:text-[96px]'>
              {project.title}
            </h1>
            <h2 className='font-serif text-[32px] leading-none font-normal normal-case italic lg:text-[64px]'>
              {project.clientName}
            </h2>
          </div>
          <div className='flex items-center justify-center border-y-2 border-black'>
            {mainMedia._type === 'videoFile' ? (
              <MediaPlayer
                url={mainMedia.asset.url}
                playing={mainMedia.playing}
                controls={mainMedia.controls}
                loop={mainMedia.loop}
                playsinline={true}
                volume={0}
                muted={true}
                className={`pointer-events-none aspect-video w-full`}
              />
            ) : (
              <Image
                src={
                  mainMedia.asset.extension === 'gif'
                    ? getImageUrl(mainMedia).url()
                    : getImageUrl(mainMedia).width(1600).quality(90).url()
                }
                width={mainMedia.asset.metadata.dimensions.width}
                height={mainMedia.asset.metadata.dimensions.height}
                alt={mainMedia.caption}
                className={`w-full`}
                priority
                placeholder={mainMedia.asset.metadata.lqip}
              />
            )}
          </div>
          <div className='mx-4 my-6 flex flex-col justify-between gap-6 md:mx-12 md:my-12 md:gap-16 lg:flex-row'>
            <div className='space-y-2 md:space-y-6'>
              <h3>Overview</h3>
              <div className='portable-text space-y-4 text-[20px] leading-[1.17] md:text-[24px] lg:text-[24px] xl:text-[28px] 2xl:leading-tight'>
                <PortableText value={project.overview} />
              </div>
            </div>
            <div className='w-full max-w-[300px] space-y-6 md:space-y-12'>
              <div className='space-y-2 md:space-y-6'>
                <h3>Project Type</h3>
                <div className='flex'>
                  <Badge className='hover:no-underline text-md' asChild>
                    <Link
                      href={`/projects?type=${project.type}`}
                    >
                      {project.type}
                    </Link>
                  </Badge>
                </div>
              </div>
              <div className='space-y-2 md:space-y-6'>
                <h3>Project Status</h3>
                <div className='flex'>
                  <Badge className="text-md flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full border border-black ${getProjectStatusColor(project.status)}`}></div>
                    {project.status}
                  </Badge>
                </div>
              </div>
              {project.dateStarted && (
                <div className='space-y-2 md:space-y-6'>
                  <h3>Date Started</h3>
                  <div className='text-[20px] leading-none md:text-[24px]'>
                    {new Date(project.dateStarted).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC',
                    })}
                  </div>
                </div>
              )}
              {project.dateCompleted && (
                <div className='space-y-2 md:space-y-6'>
                  <h3>Date Ended</h3>
                  <div className='text-[20px] leading-none md:text-[24px]'>
                    {new Date(project.dateCompleted).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        timeZone: 'UTC',
                      }
                    )}
                  </div>
                </div>
              )}
              {project.membersInvolved && project.membersInvolved.length > 0 && (
                <div className='space-y-2 md:space-y-6'>
                  <h3>Members Involved</h3>
                  <div className='space-y-4'>
                    <MemberAvatarStack
                      members={project.membersInvolved}
                      size="md"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          {project.photoGallery && (
            <div className='border-t-2 border-black px-4 py-6 md:px-12 md:py-12'>
              <PhotoGallery photos={project.photoGallery} />
            </div>
          )}
          {project.caseStudy && (
            <div className='portable-text border-t-2 border-black px-4 py-6 md:px-12 md:py-12'>
              <PortableText
                value={project.caseStudy}
                components={{
                  types: {
                    image: function CaseStudyImage({ value }) {
                      return (
                        <Image
                          src={getImageUrl(value).width(2000).quality(90).url()}
                          width={value.asset.metadata.dimensions.width}
                          height={value.asset.metadata.dimensions.height}
                          alt={value.caption}
                          className={`w-full`}
                          placeholder={value.asset.metadata.lqip}
                        />
                      )
                    },
                    videoFile: function CaseStudyVideoFile({ value }) {
                      return (
                        <div className='flex aspect-video justify-center'>
                          <MediaPlayer
                            url={value.asset.url}
                            clickToPlay={true}
                            playing={value.playing}
                            controls={value.controls}
                            loop={value.loop}
                            playsinline={true}
                            volume={0}
                            muted={true}
                          />
                        </div>
                      )
                    },
                    embedUrl: function CaseStudyEmbedUrl({ value }) {
                      return (
                        <div className='flex aspect-video justify-center'>
                          <MediaPlayer url={value.url} />
                        </div>
                      )
                    },
                    embedCode: function CaseStudyEmbedCode({ value }) {
                      return (
                        <Suspense>
                          <div
                            dangerouslySetInnerHTML={{
                              __html: value.code.code,
                            }}
                            className='flex justify-center'
                          />
                        </Suspense>
                      )
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
