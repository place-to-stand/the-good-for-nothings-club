import type { Metadata, ResolvingMetadata } from 'next'

import InquiryDialog from '@/components/InquiryDialog'
import OfferCard from '@/components/OfferCard'
import PageShell from '@/components/PageShell'
import PriceMenu from '@/components/PriceMenu'
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
  return (
    <OfferCard
      id={service.slug}
      title={service.name}
      price={service.price}
      meta={service.detail}
      description={service.blurb}
      footer={
        <InquiryDialog
          kind='service'
          item={service.name}
          triggerLabel='Start a project'
          title={service.name}
          description="Tell us what you have in mind and we'll get back to you with a quote."
          submitLabel='Send'
        />
      }
    >
      {service.items && (
        <PriceMenu
          lines={service.items.map(({ group, label, price }) => ({
            group,
            item: label,
            price,
          }))}
        />
      )}
    </OfferCard>
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
