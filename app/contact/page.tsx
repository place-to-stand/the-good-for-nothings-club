import Link from 'next/link'

import ContactUsForm from './ContactUsForm'
import PageShell from '@/components/PageShell'
import SocialMediaLinks from '../../components/SocialMediaLinks'
import Map from '../../components/Map'
import type { Metadata, ResolvingMetadata } from 'next'

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { openGraph } = await parent
  const pathname = '/contact'

  return {
    title: 'Contact',
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      ...openGraph,
      url: pathname,
    },
  }
}

export default async function Contact() {
  return (
    <PageShell title='Contact'>
      <div className='mb-10 grid grid-cols-1 gap-24 pt-10 lg:grid-cols-2 lg:gap-12'>
        <div>
          <h3 className='text-[32px]'>Say Hello</h3>
          <div className='mt-6'>
            <ContactUsForm />
          </div>
        </div>
        <div className='space-y-12'>
          <div className='space-y-6'>
            <h3 className='text-[32px]'>Email</h3>
            <div>
              <Link
                href='mailto:hello@thegoodfornothings.club'
                className='text-2xl'
              >
                hello@thegoodfornothings.club
              </Link>
            </div>
          </div>
          <div className='space-y-6'>
            <h3 className='text-[32px]'>Social</h3>
            <div className='text-[32px]'>
              <SocialMediaLinks />
            </div>
          </div>
          <div className='space-y-6'>
            <h3 className='text-[32px]'>Location</h3>
            <div className='aspect-video'>
              <Map />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
