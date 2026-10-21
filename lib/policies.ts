import { type PolicyInfo, findPolicy } from '@/data/policies'
import { getShopPolicies, type ShopPolicies } from '@/lib/shopify'
import { htmlToText } from '@/lib/shopify/format'

export type ResolvedPolicy = PolicyInfo & {
  /** Policy body as HTML (Shopify's, or the fallback paragraphs). */
  html: string
  /** The same body as plain paragraphs, for the markdown twin. */
  paragraphs: string[]
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const BR = String.raw`<br\s*\/?>\s*`

/**
 * Shopify's policy editor spaces sections with <br>s: a pair inside a
 * paragraph, one at its end and one between paragraphs. On top of the
 * paragraph margins they leave wide gaps, so pairs become real paragraph
 * breaks and the rest go.
 */
export function tidyPolicyHtml(html: string) {
  return html
    .replace(new RegExp(`(?:${BR})+</p>`, 'gi'), '</p>')
    .replace(new RegExp(`</p>\\s*(?:${BR})+`, 'gi'), '</p>')
    .replace(new RegExp(`<p>\\s*(?:${BR})+`, 'gi'), '<p>')
    .replace(new RegExp(`(?:${BR}){2,}`, 'gi'), '</p><p>')
    .replace(/<p>\s*<\/p>/gi, '')
}

/** Shopify's HTML split into plain paragraphs at block boundaries. */
function htmlParagraphs(html: string) {
  return html
    .split(/<\/(?:p|h[1-6]|li|div)>|<br\s*\/?>/i)
    .map(htmlToText)
    .filter(Boolean)
}

/**
 * The Shopify policy when it has text, else the club's fallback wording,
 * else null (the page 404s).
 */
export function resolvePolicy(
  info: PolicyInfo,
  policies: ShopPolicies
): ResolvedPolicy | null {
  const body = policies[info.shopifyField]?.body ?? ''
  if (htmlToText(body)) {
    const html = tidyPolicyHtml(body)
    return { ...info, html, paragraphs: htmlParagraphs(html) }
  }
  if (info.fallback?.length)
    return {
      ...info,
      html: info.fallback.map(p => `<p>${escapeHtml(p)}</p>`).join(''),
      paragraphs: info.fallback,
    }
  return null
}

export async function getPolicy(slug: string) {
  const info = findPolicy(slug)
  if (!info) return null
  const policies = await getShopPolicies().catch(() => ({}))
  return resolvePolicy(info, policies)
}
