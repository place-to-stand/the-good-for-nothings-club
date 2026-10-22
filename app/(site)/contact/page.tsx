import Link from 'next/link'

import InquiryForm from '@/components/InquiryForm'
import { clubhouseAddressLine, clubhouseMapsUrl } from '@/data/location'
import Map from '@/components/Map'
import WidgetBoundary from '@/components/WidgetBoundary'
import PageShell, { pageColumns } from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import SocialMediaLinks from '@/components/SocialMediaLinks'
import type { Metadata, ResolvingMetadata } from 'next'
import { contactCopy } from '@/data/contact'
import { CONTACT_EMAIL } from '@/data/site'
import { searchMeta } from '@/data/site'
import { cn } from '@/lib/utils'

export const ensureStatic = 'navigation'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/contact' as const

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

export default async function Contact() {
  return (
    <PageShell title='Contact' lead={contactCopy.lead}>
      <div className={cn(pageColumns, 'gap-y-8')}>
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
            <WidgetBoundary
              label='map'
              fallbackHref={clubhouseMapsUrl}
              fallbackText='Open in Google Maps'
              className='flex h-full flex-col items-center justify-center gap-3 p-6 text-center font-sans'
            >
              <Map />
            </WidgetBoundary>
          </div>
        </div>

        {/* Same heading as the left column, so the two line up. */}
        <section className='self-start'>
          <SectionHeading title={contactCopy.formTitle} />
          <div className='mt-6'>
            <InquiryForm defaultKind='general' />
          </div>
        </section>
      </div>
    </PageShell>
  )
}
