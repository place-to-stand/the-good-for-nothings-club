import type { Metadata, ResolvingMetadata } from 'next'

import FeatureBand from '@/components/FeatureBand'
import MembershipApplicationDialog from '@/components/MembershipApplicationDialog'
import OfferCard from '@/components/OfferCard'
import PageShell from '@/components/PageShell'
import PriceMenu from '@/components/PriceMenu'
import SectionHeading from '@/components/SectionHeading'
import {
  amenities,
  facilities,
  facilitiesCopy,
  storefrontCopy,
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
      'The clubhouse, room by room - permanent desks, band practice, photo studio, mixing control room, and consignment shop in Austin, TX. Rented by the month or by the hour.',
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
        <MembershipApplicationDialog
          triggerLabel={
            facility.model === 'monthly'
              ? 'Apply for membership'
              : 'Apply to book time'
          }
          title={facility.name}
          description={facility.description}
          defaultTier={facility.model === 'monthly' ? 'Member' : 'Associate'}
          defaultOffering={facility.name}
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
    <PageShell title='Facilities' lead={facilitiesCopy.lead}>
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

      <SectionHeading title={storefrontCopy.title} />
      <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2'>
        <OfferCard
          id='online-store'
          title={storefrontCopy.name}
          price={storefrontCopy.rate}
          meta={storefrontCopy.note}
          description={storefrontCopy.description}
          footer={
            <MembershipApplicationDialog
              triggerLabel='Apply to sell'
              title={storefrontCopy.name}
              description={storefrontCopy.description}
              defaultTier='Associate'
              defaultOffering={storefrontCopy.name}
            />
          }
        />
      </div>

      <div className='mt-14 md:mt-20'>
        <FeatureBand label='The Clubhouse is stocked with' items={amenities} />
      </div>
    </PageShell>
  )
}
