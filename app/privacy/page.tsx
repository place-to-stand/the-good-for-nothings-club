import type { Metadata, ResolvingMetadata } from 'next'

import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import { privacyCopy, privacySections } from '@/data/privacy'
import { PAGE_META } from '@/data/site'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/privacy' as const

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

const updatedLabel = new Date(
  `${privacyCopy.updated}T12:00:00Z`
).toLocaleDateString('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
})

export default function Privacy() {
  return (
    <PageShell title={privacyCopy.title} lead={privacyCopy.lead}>
      <p className='mt-4 font-sans text-sm text-black/60'>
        Last updated {updatedLabel} · {privacyCopy.operator}
      </p>
      <div className='max-w-3xl'>
        {privacySections.map(section => (
          <section
            key={section.title}
            id={section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
          >
            <SectionHeading title={section.title} />
            <div className='mt-4 space-y-4 font-sans text-base leading-snug'>
              {section.paragraphs.map(paragraph => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
              {section.points && (
                <ul className='list-disc space-y-2 pl-5'>
                  {section.points.map(point => (
                    <li key={point.slice(0, 40)}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  )
}
