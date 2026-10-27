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
          {/* YouTube's own play button shape (the thumbnail is designed
              around it), in the club's purple and black. */}
          <span className='absolute inset-0 flex items-center justify-center'>
            <svg
              viewBox='0 0 68 48'
              aria-hidden='true'
              className='w-[68px] overflow-visible transition-transform group-hover:scale-110 md:w-[84px]'
            >
              <path
                d='M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z'
                className='fill-background stroke-black transition-colors group-hover:fill-black'
                strokeWidth={2}
              />
              <path
                d='M45 24 27 14v20'
                className='group-hover:fill-background fill-black transition-colors'
              />
            </svg>
          </span>
        </button>
      )}
    </div>
  )
}
