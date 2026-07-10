import Link from 'next/link'

import ContactUsForm from './ContactUsForm'
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
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12'>
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
          <div className='mt-6 aspect-video border-2 border-black'>
            <Map />
          </div>
        </div>

        <OfferCard title='Send a message' className='self-start lg:mt-20'>
          <ContactUsForm />
        </OfferCard>
      </div>
    </PageShell>
  )
}
