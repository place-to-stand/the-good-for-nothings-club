import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'
import { FaCaretDown } from 'react-icons/fa'

import MemberProfilePicture from '@/components/MemberProfilePicture'
import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import { cmsFetch } from '@/data/client'
import {
  leadershipCopy,
  leadershipSlugs,
  pastMemberSlugs,
} from '@/data/leadership'
import { GFNC_member } from '@/types'

const MEMBERS_BY_SLUGS_QUERY = `
  *[_type == 'GFNC_member' && slug.current in $slugs] | order(memberNumber) {
    _id,
    fullName,
    slug,
    profilePicture {
      asset-> {
        url,
        metadata {
          lqip,
          dimensions {
            height,
            width
          }
        }
      },
      hotspot {
        x,
        y,
      },
      caption
    },
    hoverProfilePicture {
      asset-> {
        url,
        metadata {
          lqip,
          dimensions {
            height,
            width
          }
        }
      },
      caption
    },
    roles,
    startDate,
    memberNumber
  }
`

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/about'

  return {
    title: 'About',
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
  const membersData = await cmsFetch<GFNC_member[]>({
    query: MEMBERS_BY_SLUGS_QUERY,
    tags: ['GFNC_member'],
    params: { slugs: [...leadershipSlugs, ...pastMemberSlugs] },
  })

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
          <div className='mt-4 max-w-3xl space-y-4 font-sans leading-snug'>
            <p>
              The club started as a weekly accountability meeting between
              friends and grew into a clubhouse: studios, rehearsal rooms, and
              workspace under one roof. Today it runs as a members&apos;
              creative space for Austin — monthly members get keys and full
              run of the house, associates book the rooms by the hour, and
              friends of the club fill out the events. Membership isn&apos;t
              about who you know; it&apos;s about using the space and putting
              into it. We accept applications in waves, so the community grows
              deliberately around people who actually show up. The point was
              never scale — it&apos;s keeping the space sustainable and the
              work flowing.
            </p>
          </div>

          <SectionHeading title='What happens here' />
          <ul className='mt-4 max-w-3xl list-disc space-y-2 pl-5 font-sans leading-snug'>
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
              — photo, video, music, print, and events.
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
              at three levels — member, associate, and friend.
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
              <summary className='inline-flex cursor-pointer list-none items-center gap-1 font-sans text-base font-bold text-black/80 uppercase transition-colors hover:text-black [&::-webkit-details-marker]:hidden'>
                {leadershipCopy.pastTitle}
                <FaCaretDown
                  aria-hidden
                  className='size-4 transition-transform duration-300 group-open:rotate-180'
                />
              </summary>
              <ul className='mt-4 grid grid-cols-2 gap-6'>
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
