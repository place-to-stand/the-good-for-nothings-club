'use client'

import type * as Behold from '@behold/types'
import { useState, useEffect } from 'react'
import Image from 'next/image'

import { Button } from './ui/Button'

export default function InstagramFeed({ feedId }: { feedId: string }) {
  const [feed, setFeed] = useState<Behold.Feed | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchFeed() {
      try {
        const rawFeed = await fetch(`/api/instagram-feed?feedId=${feedId}`, {
          next: { revalidate: 3600 },
          signal: controller.signal,
        })

        if (!rawFeed.ok) {
          const errorMessage = await rawFeed.text()
          throw new Error(errorMessage)
        }

        const feedJSON: Behold.Feed = await rawFeed.json()
        setFeed(feedJSON)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error:', err)
        }
      }
    }

    fetchFeed()

    return () => {
      controller.abort()
    }
  }, [feedId])

  if (!feed) {
    return <div>Loading...</div>
  }

  const formattedFollowers = new Intl.NumberFormat('en-US').format(
    feed.followersCount
  )

  const postEls = feed.posts.map(post => {
    // IMAGE or CAROUSEL_ALBUM
    let mediaEl = (
      <Image
        src={post.sizes.medium.mediaUrl}
        alt={post.prunedCaption}
        width={post.sizes.medium.width ?? 640}
        height={post.sizes.medium.height ?? 640}
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
        className='h-full w-full object-cover'
      />
    )

    // VIDEO
    if (post.mediaType === 'VIDEO') {
      mediaEl = (
        <video
          poster={post.sizes.medium.mediaUrl}
          src={post.mediaUrl}
          muted={true}
          autoPlay={true}
          loop={true}
          // Without playsInline, iOS Safari throws autoplaying videos into
          // the native fullscreen player.
          playsInline={true}
          className='h-full w-full object-cover'
        />
      )
    }

    return (
      <a
        key={post.id}
        href={post.permalink}
        target='_blank'
        rel='noopener noreferrer'
        className='relative aspect-square overflow-hidden'
      >
        <figure
          key={post.id}
          className='relative h-full w-full transition-transform duration-300 hover:scale-105'
        >
          {mediaEl}
        </figure>
      </a>
    )
  })

  return (
    <div className='flex aspect-square flex-col justify-between gap-4 rounded-xl bg-white/70 p-4 font-sans'>
      <div className='flex grow-1 gap-4'>
        <Image
          src={feed.profilePictureUrl}
          alt='@thegfnc Profile Picture'
          width={100}
          height={100}
          className='aspect-square h-full w-auto rounded-full'
        />
        <div className='flex flex-col items-start justify-center gap-1'>
          <a
            href={`https://www.instagram.com/${feed.username}`}
            target='_blank'
            rel='noopener noreferrer'
            className='font-bold'
          >
            @{feed.username}
          </a>
          <div className='text-xs'>{feed.biography}</div>
          <div className='text-sm font-medium'>
            {formattedFollowers} followers
          </div>
        </div>
      </div>
      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>{postEls}</div>
      <Button asChild variant='outline' className='h-auto p-3 hover:no-underline'>
        <a
          href={`https://www.instagram.com/${feed.username}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          Follow us on Instagram
        </a>
      </Button>
    </div>
  )
}
