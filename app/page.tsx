import SpotifyPlaylistEmbed from '../components/SpotifyPlaylistEmbed'
import InstagramFeed from '@/components/InstagramFeed'
import { Suspense } from 'react'
import Link from 'next/link'
import HeroBanner from '../components/HeroBanner'
import { FaCaretRight } from 'react-icons/fa'

export default function Home() {
  return (
    <main>
      <section className='py-14 text-center md:px-8 md:py-20 xl:px-16'>
        <div className='mx-auto max-w-(--page-max-width)'>
          <h1 className='visually-hidden'>Good For Nothings</h1>
          <HeroBanner />
        </div>
      </section>
      <section className='md:px-8 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <p className='font-serif text-2xl leading-tight sm:text-[32px] 2xl:text-[48px] 2xl:leading-[1.16]'>
            <em>The Good for Nothings Club</em> is a creators club from Austin,
            TX made up of musicians, photographers, writers, filmmakers, and
            engineers. Our clubhouse puts studios, rehearsal rooms, and workspace
            under one roof. Good for nothings. Doing everything.
          </p>
        </div>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-b-2 border-black md:border-x-2'>
          <Link
            className='group flex w-full items-center justify-center gap-0.5 py-4 text-center font-sans text-sm leading-none font-extrabold uppercase transition-colors hover:bg-black/10 hover:no-underline active:bg-black/20 md:py-8 md:text-base'
            href='/about'
          >
            <span>Learn More</span>{' '}
            <FaCaretRight className='size-4.5 transition-transform duration-500 group-hover:translate-x-1' />
          </Link>
        </div>
      </section>

      {/* The offering */}
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black md:border-x-2'>
          {[
            {
              href: '/facilities',
              title: 'Facilities',
              body: 'Rent the clubhouse by the month or by the hour.',
            },
            {
              href: '/services',
              title: 'Services',
              body: "Bring the project. We'll make it.",
            },
            {
              href: '/events',
              title: 'Events',
              body: 'The club, in session — friends welcome.',
            },
            {
              href: '/membership',
              title: 'Membership',
              body: 'Join the club, at your level.',
            },
          ].map(card => (
            <Link
              key={card.href}
              href={card.href}
              className='group flex flex-col justify-between gap-2 border-black p-6 transition-colors not-first:border-t-2 hover:bg-black/10 hover:no-underline active:bg-black/20 md:flex-row md:items-baseline md:gap-8 md:px-12 md:py-10'
            >
              <span className='flex items-center gap-0.5 font-sans text-[32px] font-black tracking-[-0.04em] uppercase md:text-[40px]'>
                {card.title}
                <FaCaretRight className='size-6 transition-transform duration-500 group-hover:translate-x-1' />
              </span>
              <span className='font-serif text-xl leading-snug md:text-right md:text-2xl'>
                {card.body}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h2 className='pt-6 text-[32px] font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[84px]'>
            Find Us Online
          </h2>
          <div className='mt-10 grid grid-cols-1 gap-8 md:mt-18 lg:grid-cols-2'>
            <Suspense fallback={<div>Loading...</div>}>
              <InstagramFeed feedId='y09WG1s5frlBs5IYL0XM' />
              <SpotifyPlaylistEmbed />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  )
}
