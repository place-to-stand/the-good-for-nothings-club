import type { Metadata, ResolvingMetadata } from 'next'

import FeatureBand from '@/components/FeatureBand'
import InquiryDialog from '@/components/InquiryDialog'
import OfferCard from '@/components/OfferCard'
import PageShell from '@/components/PageShell'
import PriceMenu from '@/components/PriceMenu'
import SectionHeading from '@/components/SectionHeading'
import {
  amenities,
  facilities,
  facilitiesCopy,
  type Facility,
} from '@/data/facilities'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/facilities'

  return {
    title: 'Facilities',
    description:
      'The clubhouse, room by room — permanent desks, band practice, photo studio, and recording control room in Austin, TX. Monthly and hourly rental.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

function FacilityCard({ facility }: { facility: Facility }) {
  return (
    <OfferCard
      id={facility.slug}
      title={facility.name}
      price={facility.rate}
      meta={[facility.quantity, facility.rateNote].filter(Boolean).join(' · ')}
      description={facility.description}
      footer={
        <InquiryDialog
          kind='facility'
          item={facility.name}
          triggerLabel={
            facility.model === 'monthly'
              ? 'Ask about availability'
              : 'Book time'
          }
          title={facility.name}
          description={
            facility.model === 'monthly'
              ? "Spots are limited. Tell us who you are and we'll reach out about availability."
              : `${facility.rate}${facility.rateNote ? ` · ${facility.rateNote}` : ''} We'll confirm timing by email.`
          }
          submitLabel={
            facility.model === 'monthly' ? 'Send' : 'Request booking'
          }
        />
      }
    >
      {facility.rateCard && <PriceMenu lines={facility.rateCard} />}
    </OfferCard>
  )
}

export default function Facilities() {
  const monthly = facilities.filter(
    f => f.model === 'monthly' && f.status !== 'planned'
  )
  const hourly = facilities.filter(
    f => f.model === 'hourly' && f.status !== 'planned'
  )
  const planned = facilities.filter(f => f.status === 'planned')

  return (
    <PageShell
      title='Facilities'
      lead={facilitiesCopy.lead}
    >
      <SectionHeading
        title={facilitiesCopy.monthlyTitle}
        lead={facilitiesCopy.monthlyLead}
      />
      <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2'>
        {monthly.map(facility => (
          <FacilityCard key={facility.slug} facility={facility} />
        ))}
      </div>

      <SectionHeading
        title={facilitiesCopy.hourlyTitle}
        lead={`${facilitiesCopy.hourlyLead}`}
      />
      <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2'>
        {hourly.map(facility => (
          <FacilityCard key={facility.slug} facility={facility} />
        ))}
      </div>

      {planned.length > 0 && (
        <>
          <SectionHeading title={facilitiesCopy.plannedTitle} />
          <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2'>
            {planned.map(facility => (
              <article
                key={facility.slug}
                id={facility.slug}
                className='border-2 border-dashed border-black/60 p-6 md:p-8'
              >
                <h3 className='text-[24px] leading-none font-black tracking-[-0.03em]'>
                  {facility.name}
                </h3>
                <p className='mt-3 font-sans leading-snug'>
                  {facility.description}
                </p>
              </article>
            ))}
          </div>
        </>
      )}

      <div className='mt-14 md:mt-20'>
        <FeatureBand label='Included with every rental' items={amenities} />
      </div>
    </PageShell>
  )
}
