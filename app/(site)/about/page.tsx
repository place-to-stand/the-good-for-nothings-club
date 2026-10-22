import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'
import { FaCaretDown } from 'react-icons/fa'

import MemberProfilePicture from '@/components/MemberProfilePicture'
import PageShell, { pageColumns } from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import {
  leadershipCopy,
  leadershipSlugs,
  pastMemberSlugs,
} from '@/data/leadership'
import { getListedMembers } from '@/lib/content'
import { aboutCopy, aboutItems } from '@/data/about'
import { searchMeta } from '@/data/site'

// Member list comes from cached Convex data (refreshed hourly, see
// lib/content.ts); the rest of the page is static copy.
export const ensureStatic = 'navigation'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/about' as const

  return {
    ...searchMeta(pathname),
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
  const membersData = await getListedMembers()

  const founding = membersData.filter(member =>
    leadershipSlugs.includes(member.slug.current)
  )
  const past = membersData.filter(member =>
    pastMemberSlugs.includes(member.slug.current)
  )

  return (
    <PageShell title='About' lead={aboutCopy.lead}>
      <div className={pageColumns}>
        <div>
          <SectionHeading title={aboutCopy.overviewTitle} />
          <div className='mt-4 max-w-3xl space-y-4 font-sans text-lg leading-snug'>
            <p>{aboutCopy.overview}</p>
          </div>

          <SectionHeading title={aboutCopy.happensTitle} />
          <ul className='mt-4 max-w-3xl list-disc space-y-2 pl-5 font-sans text-base leading-snug'>
            {aboutItems.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className='font-bold'
                  {...(item.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {item.link}
                </Link>
                {item.rest}
              </li>
            ))}
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
