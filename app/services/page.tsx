import type { Metadata, ResolvingMetadata } from 'next'

import InquiryDialog from '@/components/InquiryDialog'
import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import { services, servicesCopy, type Service } from '@/data/services'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/services'

  return {
    title: 'Services',
    description:
      'Bring the project, we’ll make it — photography, video, music production, zines, photo booth, pop-up cinema, sound systems, and event planning from The Good for Nothings Club in Austin, TX.',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

function ServiceCard({ service }: { service: Service }) {
  const groups = service.items
    ? [...new Set(service.items.map(item => item.group))]
    : []

  return (
    <article
      id={service.slug}
      className='flex scroll-mt-28 flex-col border-2 border-black p-6 md:p-8'
    >
      <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1'>
        <h3 className='text-[28px] leading-none font-black tracking-[-0.03em] md:text-[32px]'>
          {service.name}
        </h3>
        <span className='font-sans text-sm font-black tracking-tight uppercase'>
          {service.price}
        </span>
      </div>

      <p className='mt-4 font-sans leading-snug'>{service.blurb}</p>

      {service.items && (
        <div className='mt-5 divide-y-2 divide-black border-2 border-black font-sans text-sm'>
          {groups.map(group => (
            <div key={group ?? 'flat'}>
              {group && (
                <div className='bg-black/5 px-4 py-1.5 font-black tracking-wide uppercase'>
                  {group}
                </div>
              )}
              {service
                .items!.filter(item => item.group === group)
                .map(item => (
                  <div
                    key={item.label}
                    className='flex items-center justify-between gap-4 px-4 py-2'
                  >
                    <span>{item.label}</span>
                    <span className='font-bold whitespace-nowrap'>
                      {item.price}
                    </span>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {service.detail && (
        <p className='mt-3 font-sans text-xs font-semibold uppercase'>
          {service.detail}
        </p>
      )}

      <div className='mt-auto pt-6'>
        <InquiryDialog
          kind='service'
          item={service.name}
          triggerLabel='Start a project'
          title={service.name}
          description="Tell us what you have in mind and we'll get back to you with a quote."
          submitLabel='Send'
        />
      </div>
    </article>
  )
}

export default function Services() {
  return (
    <PageShell
      title='Services'
      lead={`Bring the project. We'll make it. ${servicesCopy.lead}`}
    >
      {servicesCopy.categories.map(category => {
        const categoryServices = services.filter(
          service => service.category === category.key
        )
        if (categoryServices.length === 0) return null

        return (
          <div key={category.key} id={category.key} className='scroll-mt-28'>
            <SectionHeading title={category.title} lead={category.lead} />
            <div className='mt-6 grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2'>
              {categoryServices.map(service => (
                <ServiceCard key={service.slug} service={service} />
              ))}
            </div>
          </div>
        )
      })}
    </PageShell>
  )
}
