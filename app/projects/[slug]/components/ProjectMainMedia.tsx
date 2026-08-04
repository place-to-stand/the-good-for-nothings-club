import Image from 'next/image'
import dynamic from 'next/dynamic'
import { getImageUrl } from '../../../../data/client'
import { getGifVideo } from '@/data/gifVideos'
import GifVideo from '@/components/GifVideo'
import type { Image as GFNC_image, VideoFile } from '../../../../types'

const MediaPlayer = dynamic(() => import('@/components/MediaPlayer'))

type ProjectMainMediaProps = {
  mainMedia: GFNC_image | VideoFile
}

/** The hero media block shared by every project detail template. */
export default function ProjectMainMedia({ mainMedia }: ProjectMainMediaProps) {
  if (mainMedia._type === 'videoFile') {
    return (
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
    )
  }

  const gifVideo = getGifVideo(mainMedia.asset.url)
  if (gifVideo) {
    return <GifVideo video={gifVideo} alt={mainMedia.caption} className='w-full' />
  }

  return (
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
      sizes='(min-width: 1440px) 1440px, 100vw'
      priority
      placeholder={mainMedia.asset.metadata.lqip}
    />
  )
}
