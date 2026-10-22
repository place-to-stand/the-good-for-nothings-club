'use client'

import { Button } from './ui/Button'
import NewsletterSignUpForm from './NewsletterSignUpForm'
import { SOCIAL_LINKS } from './SocialMediaLinks'
import ScrollTopLink from './ScrollTopLink'
import { clubhouse, clubhouseMapsUrl } from '../data/location'
import { POLICIES, policyPath } from '../data/policies'
import { CONTACT_EMAIL } from '../data/site'

// Site map, in its own strip above the legal bar. The wordmark covers Home. (/projects is still
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
            {/* One list so the icons line up. Icon and text share one
                link; hovering underlines only the text (.link-line). */}
            <ul className='mt-4 space-y-2 text-sm leading-snug'>
              <li>
                <a
                  href={clubhouseMapsUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='group inline-flex items-start gap-1.5'
                >
                  <PinIcon />
                  <span className='link-line'>
                    {clubhouse.street}, {clubhouse.city}, {clubhouse.state}{' '}
                    {clubhouse.zip}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className='group inline-flex items-start gap-1.5'
                >
                  <MailIcon />
                  <span className='link-line'>{CONTACT_EMAIL}</span>
                </a>
              </li>
              {SOCIAL_LINKS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group inline-flex items-start gap-1.5'
                  >
                    <Icon aria-hidden className='mt-px size-4 shrink-0' />
                    <span className='link-line'>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
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
        {/* Site map strip, ruled like the legal bar below it. Two columns
            on phones, one spread-out row from md up. */}
        <nav
          aria-label='Site'
          className='grid grid-cols-2 gap-x-4 gap-y-2 border-t-2 border-black px-4 py-5 md:flex md:flex-wrap md:justify-between md:gap-x-6 md:px-12'
        >
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
        <div className='flex flex-col items-center justify-between gap-2 border-t-2 border-black px-4 py-5 text-center text-sm md:flex-row md:gap-4 md:px-12 md:text-left'>
          <div>
            &copy; {year} The Good for Nothings Club LLC. All rights reserved.
          </div>
          <nav
            aria-label='Store policies'
            className='flex flex-wrap justify-center gap-x-4 gap-y-1'
          >
            {POLICIES.map(policy => (
              <ScrollTopLink key={policy.slug} href={policyPath(policy.slug)}>
                {policy.label}
              </ScrollTopLink>
            ))}
          </nav>
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

function MailIcon() {
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
      <path d='M3 5.5h18v13H3z' />
      <path d='m3 6 9 7 9-7' />
    </svg>
  )
}
