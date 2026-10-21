import type { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import PageShell from '@/components/PageShell'
import ProductDescription from '@/components/shop/ProductDescription'
import ShopFallback from '@/components/shop/ShopFallback'
import { POLICIES, findPolicy, policyPath } from '@/data/policies'
import { CONTACT_EMAIL } from '@/data/site'
import { getPolicy } from '@/lib/policies'

/**
 * Store policies (returns, shipping, privacy, terms). The text is the
 * Shopify policy from Settings > Policies, so editing it there updates
 * this page within a minute or so.
 */

export const ensureStatic = 'navigation'

export function generateStaticParams() {
  return POLICIES.map(policy => ({ policy: policy.slug }))
}

type Props = PageProps<'/policies/[policy]'>

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { policy: slug } = await props.params
  const info = findPolicy(slug)
  if (!info) notFound()
  const { openGraph } = await parent
  const url = policyPath(info.slug)
  return {
    title: info.title,
    description: info.description,
    alternates: { canonical: url },
    openGraph: { ...openGraph, url },
  }
}

export default function PolicyPage(props: Props) {
  return (
    <Suspense fallback={<ShopFallback />}>
      <PolicyContent params={props.params} />
    </Suspense>
  )
}

async function PolicyContent({ params }: Pick<Props, 'params'>) {
  const { policy: slug } = await params
  const policy = await getPolicy(slug)
  if (!policy) notFound()

  return (
    <PageShell title={policy.title}>
      <ProductDescription html={policy.html} className='mt-6 max-w-3xl' />
      <p className='mt-10 max-w-3xl font-sans text-base'>
        Questions? Email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className='font-bold'>
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </PageShell>
  )
}
