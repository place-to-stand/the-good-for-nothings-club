import Link from 'next/link'

import InquiryForm from '@/components/InquiryForm'
import { clubhouseAddressLine, clubhouseMapsUrl } from '@/data/location'
import Map from '../../components/Map'
import OfferCard from '@/components/OfferCard'
import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import SocialMediaLinks from '../../components/SocialMediaLinks'
import type { Metadata, ResolvingMetadata } from 'next'
import { contactCopy } from '@/data/contact'
import { CONTACT_EMAIL } from '@/data/site'
import { PAGE_META } from '@/data/site'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/contact' as const

  return {
    ...PAGE_META[pathname],
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
    <PageShell title='Contact' lead={contactCopy.lead}>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-20'>
        <div>
          <SectionHeading title={contactCopy.emailTitle} />
          <Link
            href={`mailto:${CONTACT_EMAIL}`}
            className='mt-4 inline-block font-sans text-xl font-normal'
          >
            {CONTACT_EMAIL}
          </Link>

          <SectionHeading title={contactCopy.socialTitle} />
          <div className='mt-4 text-[32px]'>
            <SocialMediaLinks />
          </div>

          <SectionHeading title={contactCopy.locationTitle} />
          <Link
            href={clubhouseMapsUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-4 inline-block font-sans text-xl font-normal'
          >
            {clubhouseAddressLine}
          </Link>
          <div className='mt-6 aspect-video overflow-hidden border-2 border-black'>
            <Map />
          </div>
        </div>

        <OfferCard
          title={contactCopy.formTitle}
          className='self-start border-0 p-0 md:p-0 lg:mt-20'
        >
          <InquiryForm defaultKind='general' />
        </OfferCard>
      </div>
    </PageShell>
  )
}
