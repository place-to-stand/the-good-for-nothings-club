import { GifVideoAsset } from '@/data/gifVideos'
import type { CSSProperties, Ref } from 'react'

type GifVideoProps = {
  video: GifVideoAsset
  alt: string
  className?: string
  style?: CSSProperties
  /**
   * Browsers never start (and actively suspend) autoplay for display:none
   * elements, so instances hidden at load must pass false and drive
   * playback through `videoRef` instead (see MemberProfilePicture).
   */
  autoPlay?: boolean
  preload?: 'none' | 'metadata' | 'auto'
  videoRef?: Ref<HTMLVideoElement>
}

/**
 * Drop-in replacement for CMS animated GIFs (see data/gifVideos.ts).
 * Behaves like a GIF — autoplays muted, loops, no controls — while the
 * poster frame reserves layout the same way <Image> width/height do.
 */
export default function GifVideo({
  video,
  alt,
  className,
  style,
  autoPlay = true,
  preload = 'metadata',
  videoRef,
}: GifVideoProps) {
  return (
    <video
      ref={videoRef}
      src={video.src}
      poster={video.poster}
      width={video.width}
      height={video.height}
      autoPlay={autoPlay}
      muted
      loop
      playsInline
      preload={autoPlay ? preload : 'none'}
      aria-label={alt}
      className={className}
      style={style}
    />
  )
}
