'use client'

import Image from 'next/image'
import { useState } from 'react'

type YouTubeFeatureProps = {
  videoId: string
  title: string
}

/**
 * Shows the video's YouTube thumbnail with a play button, and only loads
 * YouTube's player (and its scripts and cookies) after a click.
 */
export default function YouTubeFeature({
  videoId,
  title,
}: YouTubeFeatureProps) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className='relative aspect-video w-full overflow-hidden border-2 border-black bg-black'>
      {playing ? (
        <iframe
          className='absolute inset-0 h-full w-full'
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow='autoplay; encrypted-media; picture-in-picture; fullscreen'
          allowFullScreen
        />
      ) : (
        <button
          type='button'
          onClick={() => setPlaying(true)}
          aria-label={`Play ${title}`}
          className='group absolute inset-0 cursor-pointer'
        >
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt=''
            fill
            sizes='(min-width: 1024px) 640px, 100vw'
            className='object-cover transition-transform duration-500 group-hover:scale-[1.03]'
          />
          <span className='absolute inset-0 flex items-center justify-center'>
            <span className='bg-background flex size-20 items-center justify-center border-2 border-black shadow-[6px_6px_0_0_#000] transition-transform group-hover:-translate-y-0.5 md:size-24'>
              <svg
                viewBox='0 0 24 24'
                fill='currentColor'
                aria-hidden='true'
                className='size-10 text-black md:size-12'
              >
                <path d='M8 5v14l11-7z' />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  )
}
