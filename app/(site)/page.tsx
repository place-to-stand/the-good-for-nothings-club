import SpotifyPlaylistEmbed from '@/components/SpotifyPlaylistEmbed'
import InstagramFeed from '@/components/InstagramFeed'
import { Suspense } from 'react'
import Link from 'next/link'
import HeroBanner from '@/components/HeroBanner'
import { FaCaretRight } from 'react-icons/fa'
import { homeCopy, homeOffering } from '@/data/home'
import WidgetBoundary from '@/components/WidgetBoundary'
import YouTubeFeature from '@/components/YouTubeFeature'

export const ensureStatic = 'navigation'

export default function Home() {
  return (
    <main>
      <section className='py-14 text-center md:px-8 md:py-20 xl:px-16'>
        <div className='mx-auto max-w-(--page-max-width)'>
          <h1 className='visually-hidden'>{homeCopy.heading}</h1>
          <HeroBanner />
        </div>
      </section>
      <section className='md:px-8 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h2 className='text-[44px] leading-[0.95] font-black tracking-[-0.04em] sm:text-[64px] lg:text-[96px]'>
            {homeCopy.headline[0]}{' '}
            <span className='font-sans-glitch font-normal tracking-normal whitespace-nowrap'>
              {homeCopy.headline[1]}
            </span>{' '}
            {homeCopy.headline[2]}
          </h2>
        </div>
        <div className='bg-background mx-auto grid max-w-(--page-max-width) border-b-2 border-black md:border-x-2 lg:grid-cols-2'>
          <div className='space-y-4 px-4 py-6 font-serif text-xl leading-snug sm:text-2xl md:px-12 md:py-12'>
            <p className='pb-2 text-2xl leading-tight italic sm:text-[32px]'>
              {homeCopy.story[0]}
            </p>
            {homeCopy.story.slice(1).map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <p>
              <em>{homeCopy.introName}</em> {homeCopy.introBody}
            </p>
          </div>
          <div className='border-t-2 border-black bg-black px-4 py-6 text-white md:px-12 md:py-12 lg:border-t-0 lg:border-l-2'>
            <p className='bg-background inline-block px-2 py-1 font-sans text-xs font-extrabold tracking-wide text-black uppercase md:text-sm'>
              {homeCopy.proofLabel}
            </p>
            <div className='mt-4'>
              <YouTubeFeature
                videoId={homeCopy.proofVideoId}
                title={`So Many Cults, ${homeCopy.proofTitle}`}
              />
            </div>
            <p className='mt-5 font-sans text-[32px] leading-none font-black tracking-[-0.04em] uppercase md:text-[40px]'>
              {homeCopy.proofTitle}
            </p>
            <p className='mt-2 font-serif text-xl leading-snug sm:text-2xl'>
              {homeCopy.proof}
            </p>
            <ul className='mt-4 space-y-1 font-sans text-sm text-white/75 md:text-base'>
              {homeCopy.proofCredits.map(credit => (
                <li key={credit}>{credit}</li>
              ))}
            </ul>
            <a
              className='group mt-5 inline-flex items-center gap-0.5 font-sans text-sm font-extrabold text-white uppercase hover:no-underline md:text-base'
              href={homeCopy.proofUrl}
              rel='noopener noreferrer'
              target='_blank'
            >
              <span>{homeCopy.proofCta}</span>
              <FaCaretRight className='size-4.5 transition-transform duration-500 group-hover:translate-x-1' />
            </a>
          </div>
        </div>
        <div className='mx-auto max-w-(--page-max-width) border-b-2 border-black bg-black px-4 py-5 text-center md:border-x-2 md:py-6'>
          <p className='text-background font-sans text-xl font-black tracking-[-0.02em] uppercase sm:text-2xl lg:text-[32px]'>
            {homeCopy.tagline}
          </p>
        </div>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-b-2 border-black md:border-x-2'>
          <Link
            className='group flex w-full items-center justify-center gap-0.5 py-4 text-center font-sans text-sm leading-none font-extrabold uppercase transition-colors hover:bg-black/10 hover:no-underline active:bg-black/20 md:py-5 md:text-base'
            href='/about'
          >
            <span>{homeCopy.learnMore}</span>{' '}
            <FaCaretRight className='size-4.5 transition-transform duration-500 group-hover:translate-x-1' />
          </Link>
        </div>
      </section>

      {/* The offering */}
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black md:border-x-2'>
          {homeOffering.map(card => (
            <Link
              key={card.href}
              href={card.href}
              {...(card.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
              className='group flex flex-col justify-between gap-2 border-black p-6 transition-colors not-first:border-t-2 hover:bg-black/10 hover:no-underline active:bg-black/20 md:flex-row md:items-center md:gap-8 md:px-12 md:py-10'
            >
              <span className='flex items-center gap-0.5 font-sans text-[32px] font-black tracking-[-0.04em] uppercase md:text-[40px]'>
                {card.title}
                <FaCaretRight className='size-6 transition-transform duration-500 group-hover:translate-x-1' />
              </span>
              <span className='font-sans text-lg leading-snug md:text-right md:text-xl'>
                {card.body}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h2 className='pt-6 text-[32px] font-black tracking-[-0.04em] md:pt-4 md:text-[48px] lg:text-[64px]'>
            {homeCopy.findUsTitle}
          </h2>
          <div className='mt-10 grid grid-cols-1 gap-8 md:mt-14 lg:grid-cols-2'>
            <Suspense fallback={<div>Loading...</div>}>
              <WidgetBoundary
                label='Instagram feed'
                fallbackHref='https://www.instagram.com/thegfnc/'
                fallbackText='See it on Instagram'
              >
                <InstagramFeed feedId='y09WG1s5frlBs5IYL0XM' />
              </WidgetBoundary>
              <WidgetBoundary
                label='playlist'
                fallbackHref='https://open.spotify.com/playlist/62Qrlx4xvolQWc7GCprAi0'
                fallbackText='Listen on Spotify'
              >
                <SpotifyPlaylistEmbed />
              </WidgetBoundary>
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  )
}
