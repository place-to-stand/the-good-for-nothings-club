import { GifVideoAsset } from '@/data/gifVideos'

type GifVideoProps = {
  video: GifVideoAsset
  alt: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Drop-in replacement for CMS animated GIFs (see data/gifVideos.ts).
 * Behaves like a GIF — autoplays muted, loops, no controls — while the
 * poster frame reserves layout the same way <Image> width/height do.
 */
export default function GifVideo({ video, alt, className, style }: GifVideoProps) {
  return (
    <video
      src={video.src}
      poster={video.poster}
      width={video.width}
      height={video.height}
      autoPlay
      muted
      loop
      playsInline
      preload='metadata'
      aria-label={alt}
      className={className}
      style={style}
    />
  )
}
