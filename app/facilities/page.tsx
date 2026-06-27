import Link from 'next/link'
import Image from 'next/image'
import type { Metadata, ResolvingMetadata } from 'next'

import { facilities } from '@/data/facilities'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/facilities'

  return {
    title: 'Facilities',
    description:
      'Rent space at The Good for Nothings Club — studio, recording room, maker bench, and day desks in Austin, TX.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

export default function Facilities() {
  return (
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h1 className='pt-6 text-center text-[32px] leading-none font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[96px]'>
            Facilities
          </h1>

          <div className='mt-10 border-t-2 border-black pt-12 sm:mt-12 md:mt-20'>
            <p className='mx-auto max-w-3xl text-center font-serif text-2xl leading-tight sm:text-[28px]'>
              Our space is built for making things. Rent a room by the hour or
              the day — for shoots, sessions, workshops, or just a focused place
              to work alongside the club.
            </p>

            <div className='mt-12 grid grid-cols-1 gap-6 md:mt-16 md:gap-8 lg:grid-cols-2'>
              {facilities.map(facility => (
                <article
                  key={facility.slug}
                  id={facility.slug}
                  className='flex scroll-mt-28 flex-col border-2 border-black'
                >
                  {/* Image / placeholder */}
                  <div className='relative aspect-video w-full border-b-2 border-black bg-black/5'>
                    {facility.image ? (
                      <Image
                        src={facility.image}
                        alt={facility.name}
                        fill
                        className='object-cover'
                        sizes='(min-width: 1024px) 50vw, 100vw'
                        unoptimized
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center font-sans text-sm font-black tracking-widest text-black/30 uppercase'>
                        Photo coming soon
                      </div>
                    )}
                  </div>

                  <div className='flex flex-1 flex-col p-6 md:p-8'>
                    <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
                      <h2 className='text-[28px] leading-none font-black tracking-[-0.03em] md:text-[32px]'>
                        {facility.name}
                      </h2>
                      {facility.rate && (
                        <span className='font-sans text-sm font-black tracking-tight uppercase'>
                          {facility.rate}
                        </span>
                      )}
                    </div>

                    <p className='mt-3 font-serif text-xl leading-snug'>
                      {facility.tagline}
                    </p>

                    {facility.capacity && (
                      <p className='mt-2 font-sans text-xs font-semibold tracking-wide uppercase'>
                        {facility.capacity}
                      </p>
                    )}

                    <div className='mt-4 space-y-3 font-sans leading-snug'>
                      {facility.description.map((paragraph, i) => (
                        <p key={i}>{paragraph}</p>
                      ))}
                    </div>

                    <ul className='mt-4 grid list-disc grid-cols-1 gap-1 pl-5 font-sans text-sm sm:grid-cols-2'>
                      {facility.features.map(feature => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>

                    {facility.inquiryEnabled !== false && (
                      <div className='mt-auto pt-6'>
                        <Link
                          href={`/contact?subject=${encodeURIComponent(
                            `Facility inquiry: ${facility.name}`
                          )}`}
                          className='inline-flex w-full items-center justify-center border-2 border-black bg-black px-6 py-4 text-center font-sans text-sm font-black tracking-tight text-white uppercase transition-colors hover:bg-black/80 hover:no-underline active:bg-black/70'
                        >
                          Inquire about this space
                        </Link>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
