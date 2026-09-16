import type { Metadata, ResolvingMetadata } from 'next'

import InquiryDialog from '@/components/InquiryDialog'
import { MenuBoard, MenuBoardRow } from '@/components/MenuBoard'
import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import { services, servicesCopy } from '@/data/services'
import { PAGE_META } from '@/data/site'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/services' as const

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

export default function Services() {
  return (
    <PageShell
      title='Services'
      lead={`You bring the project. We make it. ${servicesCopy.lead}`}
    >
      {servicesCopy.categories.map(category => {
        const categoryServices = services.filter(
          service => service.category === category.key
        )
        if (categoryServices.length === 0) return null

        return (
          <div key={category.key} id={category.key} className='scroll-mt-28'>
            <SectionHeading title={category.title} lead={category.lead} />
            <MenuBoard className='mt-5'>
              {categoryServices.map(service => (
                <MenuBoardRow
                  key={service.slug}
                  id={service.slug}
                  title={service.name}
                  description={service.blurb}
                  items={service.items}
                  cta={
                    <InquiryDialog
                      kind='service'
                      item={service.name}
                      autoOpenId={service.slug}
                      triggerLabel={service.cta ?? 'Start a project'}
                      triggerVariant='outline'
                      triggerSize='sm'
                      title={service.name}
                      description="Tell us what you have in mind and we'll get back to you with a quote."
                      submitLabel='Send'
                    />
                  }
                />
              ))}
            </MenuBoard>
          </div>
        )
      })}
    </PageShell>
  )
}
