'use client'

import { useEffect, useRef, type ComponentProps } from 'react'

type LazyVideoProps = Omit<ComponentProps<'video'>, 'autoPlay' | 'preload'>

/**
 * Muted, looping video that stays a poster image until it scrolls near the
 * viewport, then plays; it pauses again once scrolled away.
 *
 * Built for the Instagram reel on the home page, which is ~15 MB and sits
 * below the fold. With preload="none" and no `autoPlay` attribute the
 * browser fetches nothing until we call play(). Autoplay would defeat
 * preload="none", and when autoplay fails (tracker blockers, missing codec)
 * Firefox reports it as an unhandled DOMException that nothing can catch.
 * Driving play() from here lets us swallow that rejection and leave the
 * poster showing.
 */
export default function LazyVideo(props: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { rootMargin: '200px' }
    )
    observer.observe(video)

    return () => observer.disconnect()
  }, [])

  return <video ref={ref} preload='none' muted loop playsInline {...props} />
}
