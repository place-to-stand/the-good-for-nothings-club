'use client'

import { useEffect, useState } from 'react'
import { cn } from '../lib/utils'

/**
 * The animated wordmark. The static letters live in /hero/base.svg and the
 * five glitch frames in /hero/frame-N.svg (same 1852×638 viewBox, so the
 * overlays line up). They were inline SVG paths before; as static files the
 * home page HTML drops ~29 KB, which is what keeps its text-to-markup ratio
 * healthy for crawlers. Every frame is in the DOM from the first paint
 * (hidden with `invisible`, so the browser still fetches and decodes it),
 * and the interval just moves the visible one.
 */
const FRAME_COUNT = 5
const FRAME_INTERVAL_MS = 140
const WIDTH = 1852
const HEIGHT = 638

const frames = Array.from(
  { length: FRAME_COUNT },
  (_, i) => `/hero/frame-${i + 1}.svg`
)

export default function HeroBanner() {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrameIndex(index => (index + 1) % FRAME_COUNT)
    }, FRAME_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [])

  // Decorative: the visually-hidden <h1> beside it carries the words.
  /* eslint-disable @next/next/no-img-element */
  return (
    <div className='relative w-full' aria-hidden>
      <img
        src='/hero/base.svg'
        alt=''
        width={WIDTH}
        height={HEIGHT}
        className='h-auto w-full'
        fetchPriority='high'
      />
      {frames.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=''
          width={WIDTH}
          height={HEIGHT}
          className={cn(
            'absolute inset-0 h-auto w-full',
            index !== currentFrameIndex && 'invisible'
          )}
        />
      ))}
    </div>
  )
  /* eslint-enable @next/next/no-img-element */
}
