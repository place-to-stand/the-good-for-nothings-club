import Link from 'next/link'

import InquiryForm from '@/components/InquiryForm'
import Map from '../../components/Map'
import OfferCard from '@/components/OfferCard'
import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import SocialMediaLinks from '../../components/SocialMediaLinks'
import type { Metadata, ResolvingMetadata } from 'next'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/contact'

  return {
    title: 'Contact',
    description:
      'Say hello, ask a question, or start something - email hello@thegoodfornothings.club, find the club on socials, or send a message and come by the clubhouse in Austin, TX.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

export default async function Contact() {
  return (
    <PageShell
      title='Contact'
      lead='Say hello, ask a question, or start something.'
    >
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-20'>
        <div>
          <SectionHeading title='Email' />
          <Link
            href='mailto:hello@thegoodfornothings.club'
            className='mt-4 inline-block font-sans text-xl font-normal'
          >
            hello@thegoodfornothings.club
          </Link>

          <SectionHeading title='Social' />
          <div className='mt-4 text-[32px]'>
            <SocialMediaLinks />
          </div>

          <SectionHeading title='Location' />
          <div className='mt-6 aspect-video overflow-hidden border-2 border-black'>
            <Map />
          </div>
        </div>

        <OfferCard
          title='Send a message'
          className='self-start border-0 p-0 md:p-0 lg:mt-20'
        >
          <InquiryForm defaultKind='general' />
        </OfferCard>
      </div>
    </PageShell>
  )
}
