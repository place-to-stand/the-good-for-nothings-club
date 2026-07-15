'use client'

import { Suspense, useState } from 'react'
import ReactPlayer from 'react-player'

type MediaPlayerProps = {
  url: string
  playing?: boolean
  controls?: boolean
  loop?: boolean
  playsinline?: boolean
  volume?: number
  muted?: boolean
  className?: string
  /**
   * Show a poster button and only mount the player (and start streaming the
   * file) after the user clicks. Video files served from Convex storage are
   * raw file egress per viewer, so autoplaying them is expensive — case study
   * videos opt in to this instead of `playing`.
   */
  clickToPlay?: boolean
}

export default function MediaPlayer({
  url,
  playing = false,
  controls = false,
  loop = false,
  playsinline = false,
  volume = 0,
  muted = false,
  className = 'w-full',
  clickToPlay = false,
}: MediaPlayerProps) {
  const [started, setStarted] = useState(false)

  if (clickToPlay && !started) {
    return (
      <div className={className}>
        <button
          type='button'
          onClick={() => setStarted(true)}
          aria-label='Play video'
          className='group flex h-full w-full cursor-pointer items-center justify-center gap-4 bg-black text-white'
        >
          <svg
            viewBox='0 0 24 24'
            fill='currentColor'
            aria-hidden='true'
            className='h-12 w-12 transition-transform group-hover:scale-110'
          >
            <path d='M8 5v14l11-7z' />
          </svg>
          <span className='font-sans text-sm font-black uppercase tracking-[1px]'>
            Play video
          </span>
        </button>
      </div>
    )
  }

  return (
    <Suspense>
      <div className={className}>
        <ReactPlayer
          src={url}
          playing={clickToPlay ? true : playing}
          controls={clickToPlay ? true : controls}
          loop={loop}
          playsInline={playsinline}
          volume={volume}
          muted={muted}
          width='100%'
          height='100%'
        />
      </div>
    </Suspense>
  )
}
