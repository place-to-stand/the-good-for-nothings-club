import Link from 'next/link'
import type { Metadata } from 'next'

import PageShell from '@/components/PageShell'
import SectionHeading from '@/components/SectionHeading'
import { CONTACT_EMAIL, notFoundCopy } from '@/data/site'
import { SITE_PAGES } from '@/lib/markdown/site'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

/**
 * HTML 404 (Next sends a real 404 status). Lists the site map so a person
 * or a crawler can recover; the markdown twin lives in lib/markdown/site.ts
 * and is what `Accept: text/markdown` clients get.
 */
export default function NotFound() {
  return (
    <PageShell title={notFoundCopy.title} lead={notFoundCopy.lead}>
      <SectionHeading title={notFoundCopy.nextTitle} />
      <ul className='mt-4 max-w-3xl list-disc space-y-2 pl-5 font-sans text-base leading-snug'>
        {SITE_PAGES.map(page => (
          <li key={page.path}>
            <Link href={page.path} className='font-bold'>
              {page.title}
            </Link>{' '}
            {page.description}
          </li>
        ))}
      </ul>
      <p className='mt-8 max-w-3xl font-sans text-base leading-snug'>
        {notFoundCopy.machineReadable} Try{' '}
        <a href='/llms.txt' className='font-bold'>
          /llms.txt
        </a>{' '}
        or{' '}
        <a href='/sitemap.xml' className='font-bold'>
          /sitemap.xml
        </a>
        . {notFoundCopy.stillStuck}{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className='font-bold'>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </PageShell>
  )
}
