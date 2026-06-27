import Link from 'next/link'
import type { Metadata, ResolvingMetadata } from 'next'

import { services } from '@/data/services'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/services'

  return {
    title: 'Services',
    description:
      'What our members can do for you — web & app development, video, photography, audio, and design from The Good for Nothings Club.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

export default function Services() {
  return (
    <main>
      <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
        <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black px-4 py-6 md:border-x-2 md:px-12 md:py-12'>
          <h1 className='pt-6 text-center text-[32px] leading-none font-black tracking-[-0.04em] md:pt-8 md:text-[48px] lg:text-[96px]'>
            Services
          </h1>

          <div className='mt-10 border-t-2 border-black pt-12 sm:mt-12 md:mt-20'>
            <p className='mx-auto max-w-3xl text-center font-serif text-2xl leading-tight sm:text-[28px]'>
              We are designers, engineers, filmmakers, musicians, and writers.
              Bring us a project — our members take on client work across every
              craft in the club.
            </p>

            <div className='mt-12 grid grid-cols-1 gap-6 md:mt-16 md:gap-8 lg:grid-cols-2'>
              {services.map(service => (
                <article
                  key={service.slug}
                  id={service.slug}
                  className='flex scroll-mt-28 flex-col border-2 border-black p-6 md:p-8'
                >
                  <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
                    <h2 className='text-[28px] leading-none font-black tracking-[-0.03em] md:text-[32px]'>
                      {service.name}
                    </h2>
                    {service.startingPrice && (
                      <span className='font-sans text-sm font-black tracking-tight uppercase'>
                        {service.startingPrice}
                      </span>
                    )}
                  </div>

                  <p className='mt-3 font-serif text-xl leading-snug'>
                    {service.summary}
                  </p>

                  <div className='mt-4 space-y-3 font-sans leading-snug'>
                    {service.description.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>

                  <ul className='mt-4 grid list-disc grid-cols-1 gap-1 pl-5 font-sans text-sm sm:grid-cols-2'>
                    {service.deliverables.map(item => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>

                  {service.inquiryEnabled !== false && (
                    <div className='mt-auto pt-6'>
                      <Link
                        href={`/contact?subject=${encodeURIComponent(
                          `Service inquiry: ${service.name}`
                        )}`}
                        className='inline-flex w-full items-center justify-center border-2 border-black bg-black px-6 py-4 text-center font-sans text-sm font-black tracking-tight text-white uppercase transition-colors hover:bg-black/80 hover:no-underline active:bg-black/70'
                      >
                        Inquire about this service
                      </Link>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
