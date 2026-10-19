'use client'

import { Button } from './ui/Button'
import NewsletterSignUpForm from './NewsletterSignUpForm'
import SocialMediaLinks from './SocialMediaLinks'
import ScrollTopLink from './ScrollTopLink'
import { clubhouse, clubhouseMapsUrl } from '../data/location'

// Site map, two columns. The wordmark covers Home. (/projects is still
// live, just unlinked.)
const FOOTER_LINKS = [
  { href: '/facilities', text: 'Facilities' },
  { href: '/services', text: 'Services' },
  { href: '/events', text: 'Events' },
  { href: '/membership', text: 'Membership' },
  { href: '/shop', text: 'Shop' },
  { href: '/about', text: 'About' },
  { href: '/contact', text: 'Contact' },
]

/**
 * A client component so every page's RSC payload carries one reference to
 * it instead of its whole serialized tree (twice, with Partial
 * Prefetching). The year comes from the server layout, which reads it from
 * a daily cache (lib/copyrightYear.ts).
 */
export default function Footer({ year }: { year: number }) {
  return (
    <footer className='pt-8 pb-8 font-sans md:px-8 md:pt-16 xl:px-16 xl:pb-16'>
      <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black md:border-x-2'>
        <div className='grid grid-cols-1 gap-12 px-4 py-8 md:px-12 md:py-12 lg:grid-cols-3 lg:gap-16'>
          <div>
            <ScrollTopLink
              href='/'
              className='inline-block text-[40px] leading-[0.9] font-black tracking-[-0.02em] uppercase hover:no-underline'
            >
              GFNC
            </ScrollTopLink>
            {/* The pin sits outside the link so the link keeps its hover
                underline. */}
            <p className='mt-4 flex items-start gap-1.5 text-sm leading-snug'>
              <PinIcon />
              <a
                href={clubhouseMapsUrl}
                target='_blank'
                rel='noopener noreferrer'
              >
                {clubhouse.street}, {clubhouse.city}, {clubhouse.state}{' '}
                {clubhouse.zip}
              </a>
            </p>
            <nav className='mt-8 grid grid-flow-col grid-rows-4 justify-start gap-x-14 gap-y-2'>
              {FOOTER_LINKS.map(link => (
                <ScrollTopLink
                  key={link.href}
                  href={link.href}
                  className='text-[15px] font-extrabold tracking-[0.06em] uppercase'
                >
                  {link.text}
                </ScrollTopLink>
              ))}
            </nav>
          </div>
          <div>
            <h3 className='text-[20px] font-black tracking-[0.06em] uppercase'>
              Membership
            </h3>
            <p className='mt-2 text-sm leading-snug'>
              Join the club, at your level. Apply anytime to join the waitlist.
              Onboarding happens in waves as space opens up.
            </p>
            <Button asChild className='mt-4 hover:no-underline'>
              <ScrollTopLink href='/membership'>Apply to Join</ScrollTopLink>
            </Button>
          </div>
          <div>
            <h3 className='text-[20px] font-black tracking-[0.06em] uppercase'>
              Newsletter
            </h3>
            <p className='mt-2 text-sm leading-snug'>
              Occasional updates from the clubhouse: events, openings, and new
              work.
            </p>
            <div className='@container mt-4'>
              <NewsletterSignUpForm />
            </div>
          </div>
        </div>
        <div className='flex flex-col-reverse items-center justify-between gap-4 border-t-2 border-black px-4 py-5 md:flex-row md:px-12'>
          <div className='text-center text-sm'>
            &copy; {year} The Good for Nothings Club LLC. All rights reserved.
          </div>
          <div className='text-xl'>
            <SocialMediaLinks />
          </div>
        </div>
      </div>
    </footer>
  )
}

/** Map pin, drawn like the shop icons: heavy stroke, square ends. */
function PinIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox='0 0 24 24'
      aria-hidden='true'
      className='mt-px shrink-0'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.5}
      strokeLinecap='square'
      strokeLinejoin='miter'
    >
      <path d='M12 21.5s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z' />
      <circle cx='12' cy='9.5' r='2.5' />
    </svg>
  )
}
