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
      lead='The Good for Nothings Club is a creators club based in Austin, TX made up of musicians, photographers, writers, filmmakers, and engineers. It started as a weekly accountability meeting between friends and grew into a clubhouse: studios, rehearsal rooms, and workspace under one roof.'
    >
      <SectionHeading title='Overview' />
      <div className='mt-4 max-w-3xl space-y-4 font-sans leading-snug'>
        <p>
          As members, we have always tried to strike a balance between work and
          pursuing our passions such as film, music, app development, and more.
          Our growth is deliberate and gradual, focused on keeping the work
          within our team and close friends. We are not building a business of
          infinite revenue and scale — that tends to consume all of your time
          and prevent you from pursuing your creative endeavors. The club
          exists to keep the space sustainable and the work flowing.
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
      </ul>

      <SectionHeading
        title={leadershipCopy.title}
        lead={leadershipCopy.lead}
      />
      <ul className='mt-6 grid max-w-4xl grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4'>
        {founding.map(member => (
          <MemberProfilePicture key={member._id} member={member} />
        ))}
      </ul>

      {past.length > 0 && (
        <details className='group mt-14 md:mt-20'>
          <summary className='flex cursor-pointer list-none items-center justify-between gap-4 border-2 border-black px-5 py-4 font-sans text-lg font-extrabold tracking-[-0.02em] uppercase transition-colors hover:bg-black/10 active:bg-black/20 [&::-webkit-details-marker]:hidden'>
            {leadershipCopy.pastTitle}
            <FaCaretDown
              aria-hidden
              className='size-5 transition-transform duration-300 group-open:rotate-180'
            />
          </summary>
          <ul className='mt-6 grid max-w-4xl grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4'>
            {past.map(member => (
              <MemberProfilePicture key={member._id} member={member} />
            ))}
          </ul>
        </details>
      )}
    </PageShell>
  )
}
