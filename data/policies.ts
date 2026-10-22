import { CONTACT_EMAIL } from './site'

/**
 * Store policies, served at /policies/<slug>. The text comes from Shopify
 * (Settings > Policies) so there's one place to edit it. Returns and
 * shipping also carry the club's own wording, used while the Shopify
 * policy is blank, because Google Merchant Center won't list products
 * without them.
 */

export type PolicySlug = 'returns' | 'shipping' | 'privacy' | 'terms'

export type ShopifyPolicyField =
  'refundPolicy' | 'shippingPolicy' | 'privacyPolicy' | 'termsOfService'

export type PolicyInfo = {
  slug: PolicySlug
  title: string
  /** Footer label. */
  label: string
  description: string
  shopifyField: ShopifyPolicyField
  /** Paragraphs shown when the Shopify policy is empty. */
  fallback?: string[]
}

/** The return terms, shared by the page and the structured data. */
export const RETURN_POLICY = {
  days: 30,
  country: 'US',
  refundBusinessDays: 10,
} as const

export const POLICIES: PolicyInfo[] = [
  {
    slug: 'returns',
    title: 'Returns & Refunds',
    label: 'Returns',
    description:
      'Return policy for The Good for Nothings Club shop: 30 days, free return shipping, refunds within 10 business days.',
    shopifyField: 'refundPolicy',
    fallback: [
      `You have ${RETURN_POLICY.days} days from delivery to ask for a return. Items must be unworn or unused, with tags, in their original packaging, with a receipt or proof of purchase.`,
      `To start a return, email ${CONTACT_EMAIL}. If we accept it, we send you a prepaid return label, so return shipping is free. Items sent back without asking first won't be accepted.`,
      'Sale items and gift cards can’t be returned. To exchange an item, return it and place a new order.',
      `Please check your order when it arrives and email us right away if anything is damaged, defective or wrong. Once we receive and inspect a return, we tell you whether the refund is approved. Approved refunds go back to your original payment method within ${RETURN_POLICY.refundBusinessDays} business days.`,
    ],
  },
  {
    slug: 'shipping',
    title: 'Shipping',
    label: 'Shipping',
    description:
      'Shipping policy for The Good for Nothings Club shop: where we ship and how shipping is charged.',
    shopifyField: 'shippingPolicy',
    fallback: [
      'Most items ship within the United States only. Shipping is charged at USPS rates for your address, plus a $1 handling fee, and checkout shows the total before you pay.',
      'Some prints and apparel are made to order and shipped by our print partners. Those items can ship to more countries; checkout shows the options for your address.',
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    label: 'Privacy',
    description:
      'How The Good for Nothings Club collects, uses and shares personal information.',
    shopifyField: 'privacyPolicy',
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    label: 'Terms',
    description:
      'Terms of service for The Good for Nothings Club website and shop.',
    shopifyField: 'termsOfService',
  },
]

export const policyPath = (slug: PolicySlug) => `/policies/${slug}`

export const findPolicy = (slug: string) =>
  POLICIES.find(policy => policy.slug === slug)
