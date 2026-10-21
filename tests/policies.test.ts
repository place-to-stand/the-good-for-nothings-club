import { describe, expect, it, vi } from 'vitest'

vi.mock('next/cache', () => ({ cacheLife: () => {}, cacheTag: () => {} }))

import { findPolicy, POLICIES } from '@/data/policies'
import { policyMarkdown } from '@/lib/markdown/shop'
import { resolvePolicy } from '@/lib/policies'
import { merchantReturnPolicyJsonLd } from '@/lib/structuredData'

const returns = findPolicy('returns')!
const privacy = findPolicy('privacy')!

describe('store policies', () => {
  it('uses the Shopify policy when it has text', () => {
    const policy = resolvePolicy(returns, {
      refundPolicy: {
        title: 'Refund policy',
        body: '<p>Shopify text &amp; more</p><p>Second</p>',
      },
    })
    expect(policy?.html).toContain('Shopify text')
    expect(policy?.paragraphs).toEqual(['Shopify text & more', 'Second'])
  })

  it('falls back to the club wording when Shopify is blank', () => {
    const policy = resolvePolicy(returns, {
      refundPolicy: { title: 'Refund policy', body: '<p> </p>' },
    })
    expect(policy?.paragraphs).toEqual(returns.fallback)
    expect(policy?.html.startsWith('<p>')).toBe(true)
  })

  it('has no page for a blank policy without fallback', () => {
    expect(resolvePolicy(privacy, {})).toBeNull()
  })

  it('renders a markdown twin', () => {
    const md = policyMarkdown(resolvePolicy(returns, {})!)
    expect(md).toMatch(/^# Returns & Refunds/)
    expect(md).toContain('/policies/returns')
  })

  it('every policy has a unique slug', () => {
    expect(new Set(POLICIES.map(p => p.slug)).size).toBe(POLICIES.length)
  })

  it('describes the 30-day free return in structured data', () => {
    expect(merchantReturnPolicyJsonLd).toMatchObject({
      '@type': 'MerchantReturnPolicy',
      applicableCountry: 'US',
      merchantReturnDays: 30,
      returnFees: 'https://schema.org/FreeReturn',
      merchantReturnLink: 'https://thegoodfornothings.club/policies/returns',
    })
  })
})

describe('tidyPolicyHtml', () => {
  it('turns Shopify <br> spacing into plain paragraphs', async () => {
    const { tidyPolicyHtml } = await import('@/lib/policies')
    const html =
      '<p>One. <br><br>Two. <br></p>\n<br>\n<p><strong>Head</strong> <br>Body</p><p><br></p>'
    expect(tidyPolicyHtml(html)).toBe(
      '<p>One. </p><p>Two. </p><p><strong>Head</strong> <br>Body</p>'
    )
  })
})
