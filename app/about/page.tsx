import Link from 'next/link'

import MemberProfilePicture from '@/components/MemberProfilePicture'
import { cmsFetch } from '@/data/client'
import { leadershipCopy, leadershipSlugs } from '@/data/leadership'
import { GFNC_member } from '@/types'
import type { Metadata, ResolvingMetadata } from 'next'

const LEADERSHIP_QUERY = `
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
  const leadershipData = await cmsFetch<GFNC_member[]>({
    query: LEADERSHIP_QUERY,
    tags: ['GFNC_member'],
    params: { slugs: leadershipSlugs },
  })

  return (
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h1 className='pt-6 text-center text-[32px] leading-none font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[96px]'>
            About
          </h1>
          <div className='mt-10 flex flex-col gap-24 border-t-2 border-black pt-12 sm:mt-12 md:mt-20 lg:flex-row lg:gap-12'>
            <div className='prose prose-lg not-first-of-type:md:prose-xl prose-li:my-1 prose-ol:my-1 mx-auto font-sans leading-snug'>
              <h2>Overview</h2>
              <p>
                The Good for Nothings Club is a creators club based in Austin,
                TX made up of musicians, photographers, writers, filmmakers,
                and engineers. It started as a weekly accountability meeting
                between
                friends and grew into a clubhouse: studios, rehearsal rooms,
                and workspace under one roof.
              </p>
              <p>
                As members, we have always tried to strike a balance between
                work and pursuing our passions such as film, music, app
                development, and more. Our growth is deliberate and gradual,
                focused on keeping the work within our team and close friends.
                We are not building a business of infinite revenue and scale —
                that tends to consume all of your time and prevent you from
                pursuing your creative endeavors. The club exists to keep the
                space sustainable and the work flowing.
              </p>

              <h3>What happens here</h3>
              <ul>
                <li>
                  <Link href='/facilities'>The clubhouse</Link> rents desks,
                  band practice slots, a photo studio, and a recording control
                  room.
                </li>
                <li>
                  <Link href='/services'>Club members take on client work</Link>{' '}
                  — photo, video, music, print, and events.
                </li>
                <li>
                  <Link href='/events'>Regular events</Link>, including the
                  weekly Accountability Hour that started it all.
                </li>
                <li>
                  <Link href='/membership'>Membership</Link> at three levels —
                  member, associate, and friend.
                </li>
              </ul>
            </div>
            <div className='min-w-[300px] xl:min-w-[480px]'>
              <h2 className='text-[30px] leading-snug font-bold'>
                {leadershipCopy.title}
              </h2>
              <p className='mt-2 font-sans text-sm leading-snug'>
                {leadershipCopy.lead}
              </p>
              <div className='mt-8'>
                <ul className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-x-8 md:gap-y-10 lg:grid-cols-1 xl:grid-cols-2'>
                  {leadershipData.map(member => (
                    <MemberProfilePicture key={member._id} member={member} />
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
