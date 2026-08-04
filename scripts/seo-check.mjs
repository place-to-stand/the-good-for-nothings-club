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
 *   - no fetched response over 500 KB (page HTML + <img>/<video>/<source>,
 *     with a streaming-GET fallback when HEAD has no content-length)
 *   - no media request that errors or returns 4XX/5XX
 *   - no internal link that redirects (3XX), is broken (4XX/5XX), or errors
 *
 * MAIN URLs are discovered from /sitemap.xml so newly published projects and
 * members are covered automatically; the SHOP list is hardcoded (that
 * property lives outside this repo).
 *
 * Usage:
 *   node scripts/seo-check.mjs                  # MAIN urls against production
 *   node scripts/seo-check.mjs --base http://localhost:3001
 *   node scripts/seo-check.mjs --property shop  # shopify storefront urls
 *   node scripts/seo-check.mjs --property all
 *
 * Exits 1 on failed checks, 2 on usage/setup errors (bad flags, unreachable
 * sitemap, nothing to check).
 */

const MAIN = 'https://thegoodfornothings.club'
const SHOP = 'https://shop.thegoodfornothings.club'

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

function usageError(message) {
  console.error(`seo-check: ${message}`)
  process.exit(2)
}

// Supports "--flag value" and "--flag=value"; rejects unknown flags so a
// typo can't silently run the wrong checks against the wrong host.
function parseArgs(argv) {
  const known = new Set(['--base', '--property'])
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const eq = arg.indexOf('=')
    const flag = eq === -1 ? arg : arg.slice(0, eq)
    if (!known.has(flag)) usageError(`unknown argument "${arg}"`)
    const value = eq === -1 ? argv[++i] : arg.slice(eq + 1)
    if (value === undefined) usageError(`missing value for "${flag}"`)
    out[flag.slice(2)] = value
  }
  return out
}

const { base: baseOverride, property = 'main' } = parseArgs(process.argv.slice(2))
if (!['main', 'shop', 'all'].includes(property)) {
  usageError(`--property must be main, shop, or all (got "${property}")`)
}

/** MAIN paths come from the live sitemap so new pages are covered. */
async function mainPathsFromSitemap(base) {
  let xml
  try {
    const res = await fetch(`${base}/sitemap.xml`, { headers: { 'user-agent': UA } })
    if (!res.ok) usageError(`GET ${base}/sitemap.xml returned ${res.status}`)
    xml = await res.text()
  } catch (err) {
    usageError(`could not fetch ${base}/sitemap.xml: ${err}`)
  }
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => {
    const url = new URL(decode(m[1].trim()))
    return url.pathname
  })
  if (paths.length === 0) usageError(`${base}/sitemap.xml contains no <loc> entries`)
  return [...new Set(paths)]
}

const targets = []
if (property === 'main' || property === 'all') {
  const base = baseOverride ?? MAIN
  const paths = await mainPathsFromSitemap(base)
  targets.push(...paths.map(p => ({ url: base + p, origin: base })))
}
if (property === 'shop' || property === 'all') {
  targets.push(...SHOP_PATHS.map(p => ({ url: SHOP + p, origin: SHOP })))
}
if (targets.length === 0) usageError('no URLs to check')

function decode(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

const stripTags = s => s.replace(/<[^>]*>/g, '').trim()

const attr = (tag, name) => {
  const m = tag.match(
    new RegExp(`(?:^|[\\s"'])${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i')
  )
  return m ? decode(m[2] ?? m[3]) : undefined
}

// Cache cross-page requests (headers/sizes) so shared assets and nav links
// are only fetched once per run. Results: { status?, size?, error? } — an
// entry with `error` set means the request itself failed and callers MUST
// report it, never treat it as a pass.
const headCache = new Map()
function headInfo(url) {
  let promise = headCache.get(url)
  if (!promise) {
    promise = (async () => {
      try {
        const res = await fetch(url, {
          method: 'HEAD',
          redirect: 'manual',
          headers: { 'user-agent': UA },
        })
        // Some servers reject HEAD; retry as a size-measuring GET.
        if (res.status === 405 || res.status === 501) return measuredGet(url)
        const len = res.headers.get('content-length')
        const size = len ? Number(len.split(',')[0]) : undefined
        return {
          status: res.status,
          size: Number.isFinite(size) ? size : undefined,
        }
      } catch (err) {
        return { error: String(err) }
      }
    })()
    headCache.set(url, promise)
  }
  return promise
}

// Streaming GET that stops reading once the size budget is exceeded — used
// when HEAD gives no content-length, so a chunked 6 MB GIF can't slip past
// the size check unmeasured.
async function measuredGet(url) {
  try {
    const controller = new AbortController()
    const res = await fetch(url, {
      redirect: 'manual',
      headers: { 'user-agent': UA },
      signal: controller.signal,
    })
    if (res.status >= 300 || !res.body) return { status: res.status }
    let size = 0
    try {
      for await (const chunk of res.body) {
        size += chunk.length
        if (size > MAX_RESPONSE_BYTES) {
          controller.abort()
          break
        }
      }
    } catch (err) {
      if (err?.name !== 'AbortError') throw err
    }
    return { status: res.status, size }
  } catch (err) {
    return { error: String(err) }
  }
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

  // media must respond OK and stay ≤ 500 KB
  const mediaUrls = new Set()
  for (const t of [...imgs, ...[...bodyHtml.matchAll(/<(?:video|source)\s[^>]*>/gi)].map(m => m[0])]) {
    const src = attr(t, 'src')
    if (src && !src.startsWith('data:')) mediaUrls.add(new URL(src, url).href)
  }

  // internal links must resolve without redirecting or breaking
  const links = new Set()
  for (const t of [...bodyHtml.matchAll(/<a\s[^>]*>/gi)].map(m => m[0])) {
    const href = attr(t, 'href')
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    const abs = new URL(href, url)
    abs.hash = ''
    if (abs.origin === new URL(origin).origin) links.add(abs.href)
  }

  const mediaChecks = [...mediaUrls].map(async mediaUrl => {
    let info = await headInfo(mediaUrl)
    if (!info.error && info.status < 300 && info.size === undefined) {
      info = await measuredGet(mediaUrl)
    }
    if (info.error) return `media request failed: ${mediaUrl} (${info.error})`
    if (info.status >= 400) return `media ${info.status}: ${mediaUrl}`
    if (info.size !== undefined && info.size > MAX_RESPONSE_BYTES) {
      return `media over 500 KB (${info.size} bytes): ${mediaUrl}`
    }
    return null
  })
  const linkChecks = [...links].map(async link => {
    const info = await headInfo(link)
    if (info.error) return `internal link failed: ${link} (${info.error})`
    if (info.status >= 300 && info.status < 400) {
      return `internal link 3XX (${info.status}): ${link}`
    }
    if (info.status >= 400) return `internal link broken (${info.status}): ${link}`
    return null
  })
  failures.push(
    ...(await Promise.all([...mediaChecks, ...linkChecks])).filter(Boolean)
  )

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
