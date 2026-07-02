import type { Metadata, ResolvingMetadata } from 'next'

import InquiryDialog from '@/components/InquiryDialog'
import {
  amenities,
  bookingNotes,
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
    <article
      id={facility.slug}
      className='flex scroll-mt-28 flex-col border-2 border-black p-6 md:p-8'
    >
      <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
        <h3 className='text-[28px] leading-none font-black tracking-[-0.03em] md:text-[32px]'>
          {facility.name}
        </h3>
        {facility.rate && (
          <span className='font-sans text-sm font-black tracking-tight uppercase'>
            {facility.rate}
          </span>
        )}
      </div>

      {facility.quantity && (
        <p className='mt-2 font-sans text-xs font-semibold tracking-wide uppercase'>
          {facility.quantity}
        </p>
      )}

      <p className='mt-4 font-sans leading-snug'>{facility.description}</p>

      {facility.rateCard && (
        <dl className='mt-5 divide-y-2 divide-black border-2 border-black font-sans text-sm'>
          {facility.rateCard.map(line => (
            <div
              key={`${line.group}-${line.item}`}
              className='flex items-center justify-between gap-4 px-4 py-2.5'
            >
              <dt>
                <span className='font-black uppercase'>{line.group}</span>
                <span className='ml-2'>{line.item}</span>
              </dt>
              <dd className='font-bold whitespace-nowrap'>{line.price}</dd>
            </div>
          ))}
        </dl>
      )}

      {facility.rateNote && (
        <p className='mt-3 font-sans text-xs font-semibold uppercase'>
          {facility.rateNote}
        </p>
      )}

      <div className='mt-auto pt-6'>
        <InquiryDialog
          kind='facility'
          item={facility.name}
          triggerLabel={
            facility.model === 'monthly' ? 'Ask about availability' : 'Book time'
          }
          title={facility.name}
          description={
            facility.model === 'monthly'
              ? "Spots are limited. Tell us who you are and we'll reach out about availability."
              : `${facility.rate}${facility.rateNote ? ` · ${facility.rateNote}` : ''} We'll confirm timing by email.`
          }
          submitLabel={facility.model === 'monthly' ? 'Send' : 'Request booking'}
        />
      </div>
    </article>
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
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h1 className='pt-6 text-center text-[32px] leading-none font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[96px]'>
            Facilities
          </h1>

          <div className='mt-10 border-t-2 border-black pt-12 sm:mt-12 md:mt-20'>
            <p className='mx-auto max-w-3xl text-center font-serif text-2xl leading-tight sm:text-[28px]'>
              The clubhouse, room by room. {facilitiesCopy.lead}
            </p>

            <h2 className='mt-14 text-[28px] font-black tracking-[-0.03em] md:mt-20 md:text-[40px]'>
              {facilitiesCopy.monthlyTitle}
            </h2>
            <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2'>
              {monthly.map(facility => (
                <FacilityCard key={facility.slug} facility={facility} />
              ))}
            </div>

            <h2 className='mt-14 text-[28px] font-black tracking-[-0.03em] md:mt-20 md:text-[40px]'>
              {facilitiesCopy.hourlyTitle}
            </h2>
            <p className='mt-3 max-w-3xl font-sans leading-snug'>
              {facilitiesCopy.hourlyLead} Monthly members get 50% off hourly
              rates.
            </p>
            <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2'>
              {hourly.map(facility => (
                <FacilityCard key={facility.slug} facility={facility} />
              ))}
            </div>

            {planned.length > 0 && (
              <>
                <h2 className='mt-14 text-[28px] font-black tracking-[-0.03em] md:mt-20 md:text-[40px]'>
                  {facilitiesCopy.plannedTitle}
                </h2>
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

            <div className='mt-14 grid grid-cols-1 gap-6 md:mt-20 md:gap-8 lg:grid-cols-2'>
              <div className='bg-black/5 p-6 md:p-8'>
                <h2 className='text-[24px] font-black tracking-[-0.03em]'>
                  Good to know before you book
                </h2>
                <div className='mt-4 space-y-5'>
                  {bookingNotes.map(note => (
                    <div key={note.label}>
                      <h3 className='font-sans text-sm font-black tracking-wide uppercase'>
                        {note.label}
                      </h3>
                      <ul className='mt-2 list-disc space-y-1 pl-5 font-sans text-sm'>
                        {note.points.map(point => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              <div className='bg-black/5 p-6 md:p-8'>
                <h2 className='text-[24px] font-black tracking-[-0.03em]'>
                  Included amenities
                </h2>
                <ul className='mt-4 flex flex-wrap gap-2'>
                  {amenities.map(amenity => (
                    <li
                      key={amenity}
                      className='border-2 border-black px-3 py-1 font-sans text-xs font-black tracking-widest uppercase'
                    >
                      {amenity}
                    </li>
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
