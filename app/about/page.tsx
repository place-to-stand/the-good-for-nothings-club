import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'
import { FaCaretDown } from 'react-icons/fa'

import MemberProfilePicture from '@/components/MemberProfilePicture'
import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import { fetchQuery } from 'convex/nextjs'
import { api } from '@/convex/_generated/api'
import {
  leadershipCopy,
  leadershipSlugs,
  pastMemberSlugs,
} from '@/data/leadership'
import { GFNC_member } from '@/types'

// Regenerate hourly — matches the old cmsFetch revalidate window.
export const revalidate = 3600

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/about'

  return {
    title: 'About',
    description:
      'How the club started, how it runs, and the founding team behind it. The Good for Nothings Club grew from a weekly accountability meeting into a creators clubhouse in Austin, TX.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

export default async function About() {
  const membersData = (await fetchQuery(api.members.bySlugs, {
    slugs: [...leadershipSlugs, ...pastMemberSlugs],
  })) as unknown as GFNC_member[]

  const founding = membersData.filter(member =>
    leadershipSlugs.includes(member.slug.current)
  )
  const past = membersData.filter(member =>
    pastMemberSlugs.includes(member.slug.current)
  )

  return (
    <PageShell
      title='About'
      lead='The Good for Nothings Club is a creators club based in Austin, TX made up of musicians, photographers, writers, filmmakers, and engineers.'
    >
      <div className='grid grid-cols-1 gap-x-12 lg:grid-cols-[1fr_minmax(300px,26rem)]'>
        <div>
          <SectionHeading title='Overview' />
          <div className='mt-4 max-w-3xl space-y-4 font-sans text-lg leading-snug'>
            <p>
              The club started as a weekly accountability meeting between
              friends and grew into a clubhouse: studios, rehearsal rooms, and
              workspace under one roof. Today it runs as a members&apos;
              creative space for Austin. Monthly members get keys and full run
              of the house, associates book the rooms by the hour, and friends
              of the club come out for the events. Membership isn&apos;t about
              who you know. It&apos;s about making things and contributing to
              the space. We accept applications in waves, so the community grows
              deliberately around people who actually show up, and each new wave
              has time to make the place their own. The point was never scale.
              It&apos;s keeping the space sustainable and the work flowing.
            </p>
          </div>

          <SectionHeading title='What happens here' />
          <ul className='mt-4 max-w-3xl list-disc space-y-2 pl-5 font-sans text-base leading-snug'>
            <li>
              <Link href='/facilities' className='font-bold'>
                The clubhouse
              </Link>{' '}
              rents desks, band practice slots, a photo studio, and a mixing
              control room.
            </li>
            <li>
              <Link href='/services' className='font-bold'>
                Club members take on client work
              </Link>{' '}
              for photo, video, music, print, and events.
            </li>
            <li>
              <Link href='/events' className='font-bold'>
                Regular events
              </Link>
              , including a monthly show &amp; tell for works in progress.
            </li>
            <li>
              <Link href='/membership' className='font-bold'>
                Membership
              </Link>{' '}
              at three levels: member, associate, and friend.
            </li>
            <li>
              <Link
                href='https://shop.thegoodfornothings.club/'
                className='font-bold'
              >
                The shop
              </Link>{' '}
              carries works and merch from members and friends of the club.
            </li>
            <li>
              <Link href='/contact' className='font-bold'>
                Got an idea?
              </Link>{' '}
              Reach out to see if we can make it happen.
            </li>
          </ul>
        </div>

        <div>
          <SectionHeading
            title={leadershipCopy.title}
            lead={leadershipCopy.lead}
          />
          <ul className='mt-6 grid grid-cols-2 gap-6'>
            {founding.map(member => (
              <MemberProfilePicture key={member._id} member={member} />
            ))}
          </ul>

          {past.length > 0 && (
            <details className='group details-animated mt-10'>
              <summary className='block cursor-pointer list-none font-sans text-sm font-bold text-black/60 uppercase transition-colors hover:text-black [&::-webkit-details-marker]:hidden'>
                <div className='group/summary flex items-center gap-3'>
                  <span
                    aria-hidden
                    className='h-px flex-1 bg-black/25 transition-colors group-hover/summary:bg-black'
                  />
                  <span className='inline-flex items-center gap-1'>
                    {leadershipCopy.pastTitle}
                    <FaCaretDown
                      aria-hidden
                      className='size-4 transition-transform duration-300 group-open:rotate-180'
                    />
                  </span>
                  <span
                    aria-hidden
                    className='h-px flex-1 bg-black/25 transition-colors group-hover/summary:bg-black'
                  />
                </div>
              </summary>
              <ul className='mt-8 grid grid-cols-2 gap-6'>
                {past.map(member => (
                  <MemberProfilePicture key={member._id} member={member} />
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>
    </PageShell>
  )
}
