#!/usr/bin/env node
/**
 * SEO regression check (Ahrefs audit follow-up, see SEO-CHANGELOG.md).
 *
 * For each URL asserts:
 *   - exactly one non-empty <h1>
 *   - <title> ≤ 60 chars
 *   - meta description present and ≤ 158 chars
 *   - og:image present
 *   - every <img> has an alt attribute
 *   - no fetched response over 500 KB (page HTML + <img>/<video>/<source>)
 *   - no internal link resolves to a 3XX
 *
 * Usage:
 *   node scripts/seo-check.mjs                  # MAIN urls against production
 *   node scripts/seo-check.mjs --base http://localhost:3001
 *   node scripts/seo-check.mjs --property shop  # shopify storefront urls
 *   node scripts/seo-check.mjs --property all
 *
 * Exits 1 if any check fails.
 */

const MAIN = 'https://thegoodfornothings.club'
const SHOP = 'https://shop.thegoodfornothings.club'

const MAIN_PATHS = [
  '/',
  '/about',
  '/contact',
  '/events',
  '/facilities',
  '/membership',
  '/projects',
  '/projects/limo-zine-volume-1',
  '/projects/hijk-studios-chip',
  '/projects/16-channel-switcher',
  '/projects/is-weed-legal-here-global-cannabis-legality-tracker',
  '/services',
  '/members/jason-desiderio',
  '/members/chris-donahue',
  '/members/max-marschark',
  '/members/matt-schaefer',
  '/members/eric-fenny',
]

const SHOP_PATHS = [
  '/',
  '/collections',
  '/collections/all',
  '/collections/bestsellers',
  '/collections/limo-zine',
  '/collections/practice-space',
  '/collections/hijk-studios',
  '/collections/chris-donahue-photo',
  '/collections/the-loveshakers',
  '/pages/contact',
  '/policies/terms-of-service',
  '/policies/privacy-policy',
  '/policies/refund-policy',
  '/products/limozine-new-year-same-old-shit-volume-01-issue-01',
  '/products/limozine-summer-flings-things-volume-01-issue-03',
  '/products/a-summer-sunset-on-the-city-skyline-35mm-5x7-photo',
  '/products/pink-flowers-from-a-honeymoon-35mm-5x7-photo',
  '/products/box-full-of-broken-glass-35mm-5x7-photo',
  '/products/italy-literally-a-film-photography-zine',
  '/products/gfnc-skull-t-shirt-light',
  '/products/gfnc-block-letters-dad-hat-black',
]

const MAX_RESPONSE_BYTES = 500 * 1024
const UA = 'gfnc-seo-check/1.0 (+https://thegoodfornothings.club)'

const args = process.argv.slice(2)
const argOf = flag => {
  const i = args.indexOf(flag)
  return i === -1 ? undefined : args[i + 1]
}
const property = argOf('--property') ?? 'main'
const baseOverride = argOf('--base')

const targets = []
if (property === 'main' || property === 'all') {
  const base = baseOverride ?? MAIN
  targets.push(...MAIN_PATHS.map(p => ({ url: base + p, origin: base })))
}
if (property === 'shop' || property === 'all') {
  targets.push(...SHOP_PATHS.map(p => ({ url: SHOP + p, origin: SHOP })))
}

const decode = s =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const stripTags = s => s.replace(/<[^>]*>/g, '').trim()

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return m ? decode(m[2] ?? m[3]) : undefined
}

// Cache cross-page checks (headers/sizes) so shared assets and nav links are
// only fetched once per run.
const headCache = new Map()
async function headInfo(url) {
  if (headCache.has(url)) return headCache.get(url)
  const promise = (async () => {
    try {
      let res = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual',
        headers: { 'user-agent': UA },
      })
      // Some servers reject HEAD; fall back to GET for status/size.
      if (res.status === 405 || res.status === 501) {
        res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': UA } })
        const buf = await res.arrayBuffer()
        return { status: res.status, size: buf.byteLength }
      }
      const len = res.headers.get('content-length')
      return { status: res.status, size: len ? Number(len) : undefined }
    } catch (err) {
      return { error: String(err) }
    }
  })()
  headCache.set(url, promise)
  return promise
}

async function checkPage({ url, origin }) {
  const failures = []
  let res, html
  try {
    res = await fetch(url, { headers: { 'user-agent': UA } })
    html = await res.text()
  } catch (err) {
    return [`fetch failed: ${err}`]
  }
  if (!res.ok) return [`status ${res.status}`]

  if (Buffer.byteLength(html) > MAX_RESPONSE_BYTES) {
    failures.push(`page HTML is ${Buffer.byteLength(html)} bytes (> 500 KB)`)
  }

  const bodyHtml = html.replace(/<script[\s\S]*?<\/script>/gi, '')

  // exactly one non-empty h1
  const h1s = [...bodyHtml.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map(m => stripTags(m[1]))
    .filter(Boolean)
  if (h1s.length !== 1) {
    failures.push(`expected exactly 1 non-empty <h1>, found ${h1s.length}`)
  }

  // title ≤ 60
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const titleText = title ? decode(stripTags(title[1])) : ''
  if (!titleText) failures.push('missing <title>')
  else if (titleText.length > 60) {
    failures.push(`<title> is ${titleText.length} chars (> 60): "${titleText}"`)
  }

  // meta description present, ≤ 158
  const metaTags = [...html.matchAll(/<meta\s[^>]*>/gi)].map(m => m[0])
  const desc = metaTags.find(t => attr(t, 'name')?.toLowerCase() === 'description')
  const descContent = desc ? attr(desc, 'content')?.trim() : undefined
  if (!descContent) failures.push('missing/empty meta description')
  else if (descContent.length > 158) {
    failures.push(`meta description is ${descContent.length} chars (> 158)`)
  }

  // og:image present
  const hasOgImage = metaTags.some(
    t => attr(t, 'property')?.toLowerCase() === 'og:image' && attr(t, 'content')
  )
  if (!hasOgImage) failures.push('missing og:image')

  // every <img> has an alt attribute
  const imgs = [...bodyHtml.matchAll(/<img\s[^>]*>/gi)].map(m => m[0])
  const missingAlt = imgs.filter(t => !/\salt\s*=/i.test(t))
  if (missingAlt.length > 0) {
    failures.push(`${missingAlt.length} <img> tag(s) missing alt`)
  }

  // media responses ≤ 500 KB
  const mediaUrls = new Set()
  for (const t of [...imgs, ...[...bodyHtml.matchAll(/<(?:video|source)\s[^>]*>/gi)].map(m => m[0])]) {
    const src = attr(t, 'src')
    if (src && !src.startsWith('data:')) mediaUrls.add(new URL(src, url).href)
  }
  for (const mediaUrl of mediaUrls) {
    const info = await headInfo(mediaUrl)
    if (info.size !== undefined && info.size > MAX_RESPONSE_BYTES) {
      failures.push(`media over 500 KB (${info.size} bytes): ${mediaUrl}`)
    }
  }

  // no internal link resolves to a 3XX
  const links = new Set()
  for (const t of [...bodyHtml.matchAll(/<a\s[^>]*>/gi)].map(m => m[0])) {
    const href = attr(t, 'href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    const abs = new URL(href, url)
    abs.hash = ''
    if (abs.origin === new URL(origin).origin) links.add(abs.href)
  }
  for (const link of links) {
    const info = await headInfo(link)
    if (info.status >= 300 && info.status < 400) {
      failures.push(`internal link 3XX (${info.status}): ${link}`)
    }
  }

  return failures
}

let failed = false
for (const target of targets) {
  const failures = await checkPage(target)
  if (failures.length === 0) {
    console.log(`ok   ${target.url}`)
  } else {
    failed = true
    console.log(`FAIL ${target.url}`)
    for (const f of failures) console.log(`     - ${f}`)
  }
}

process.exit(failed ? 1 : 0)
