#!/usr/bin/env node
/**
 * Agent-readiness regression check (Is Agentic / Ora audit follow-up, see
 * SEO-CHANGELOG.md "Agent readiness").
 *
 * Asserts against a running site:
 *   - unknown paths return HTTP 404 (HTML by default, markdown for
 *     Accept: text/markdown) with a body that links /llms.txt
 *   - every static page and the sitemap's project/member URLs serve
 *     text/markdown for Accept: text/markdown, with Vary: Accept, and the
 *     .md alternate URL serves the same
 *   - HTML responses carry a Link rel="alternate" header. Vary: Accept on
 *     HTML is reported but does not fail the run: Next writes its own Vary
 *     on every page it renders and Vercel keeps that one over the
 *     next.config.mjs header, so pages cannot pass it today. proxy.ts picks
 *     the variant before Vercel's cache, so visitors never get the wrong one
 *   - /llms.txt is llmstxt.org-shaped and has a "When to use" section
 *   - the home page's LocalBusiness JSON-LD has contactPoint + address
 *   - /about and /contact each have ≥ 500 chars of text
 *   - the home page has ≥ 500 chars of text; its text-to-HTML ratio is
 *     reported (5% is the audit target) but does not fail the run, since
 *     reaching it needs more visible homepage copy, a product decision
 *
 * Usage:
 *   node scripts/agent-check.mjs                     # production
 *   node scripts/agent-check.mjs --base http://localhost:3005
 *
 * Exits 1 on failed checks, 2 on usage/setup errors.
 */

const DEFAULT_BASE = 'https://thegoodfornothings.club'
const UA = 'gfnc-agent-check/1.0 (+https://thegoodfornothings.club)'
const STATIC_PATHS = [
  '/',
  '/facilities',
  '/services',
  '/events',
  '/membership',
  '/projects',
  '/about',
  '/contact',
]

function usageError(message) {
  console.error(`agent-check: ${message}`)
  process.exit(2)
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    const eq = arg.indexOf('=')
    const flag = eq === -1 ? arg : arg.slice(0, eq)
    if (flag !== '--base') usageError(`unknown argument "${arg}"`)
    const value = eq === -1 ? argv[++i] : arg.slice(eq + 1)
    if (value === undefined) usageError(`missing value for "${flag}"`)
    out.base = value.replace(/\/+$/, '')
  }
  return out
}

const { base = DEFAULT_BASE } = parseArgs(process.argv.slice(2))

async function get(path, accept) {
  const headers = { 'user-agent': UA }
  if (accept) headers.accept = accept
  const res = await fetch(base + path, { headers, redirect: 'manual' })
  return { status: res.status, headers: res.headers, body: await res.text() }
}

const decode = s =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')

/** Visible text of an HTML document: no script/style/svg/template, tags stripped. */
function visibleText(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
  const main = body.match(/<body[\s\S]*<\/body>/i)?.[0] ?? body
  return decode(main.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail })
  console.log(
    `${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : `\n     - ${detail}`}`
  )
}

const varyHasAccept = headers =>
  (headers.get('vary') ?? '')
    .split(',')
    .map(v => v.trim().toLowerCase())
    .includes('accept')

// 1. 404s
{
  const path = '/some-path-that-does-not-exist'
  const html = await get(path)
  check(`404 status for ${path}`, html.status === 404, `got ${html.status}`)
  check(
    '404 HTML body links /llms.txt and /sitemap.xml',
    html.body.includes('/llms.txt') && html.body.includes('/sitemap.xml')
  )
  const md = await get(path, 'text/markdown')
  check(
    '404 markdown for Accept: text/markdown',
    md.status === 404 &&
      (md.headers.get('content-type') ?? '').startsWith('text/markdown') &&
      md.body.startsWith('# 404'),
    `status ${md.status}, content-type ${md.headers.get('content-type')}`
  )
  check(
    '404 markdown body points at /llms.txt',
    md.body.includes(`${DEFAULT_BASE}/llms.txt`) ||
      md.body.includes('/llms.txt')
  )
  const deep = await get(
    '/projects/this-project-does-not-exist',
    'text/markdown'
  )
  check(
    '404 markdown for unknown project slug',
    deep.status === 404 && deep.body.startsWith('# 404'),
    `status ${deep.status}`
  )
}

// 2. Markdown negotiation + Vary, on static pages and sitemap URLs
let paths = [...STATIC_PATHS]
{
  const sitemap = await get('/sitemap.xml')
  if (sitemap.status !== 200)
    usageError(`GET ${base}/sitemap.xml returned ${sitemap.status}`)
  const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    m => new URL(decode(m[1].trim())).pathname
  )
  const dynamicPaths = locs.filter(
    p => p.startsWith('/projects/') || p.startsWith('/members/')
  )
  // Spot-check a few dynamic pages rather than every one.
  paths.push(
    ...dynamicPaths.filter(p => p.startsWith('/projects/')).slice(0, 2),
    ...dynamicPaths.filter(p => p.startsWith('/members/')).slice(0, 1)
  )
  paths = [...new Set(paths)]
}

for (const path of paths) {
  const html = await get(path)
  check(`${path} HTML 200`, html.status === 200, `got ${html.status}`)
  if (!varyHasAccept(html.headers))
    console.log(
      `info ${path} HTML has no Vary: Accept (Vary: ${html.headers.get('vary')})`
    )
  check(
    `${path} HTML advertises markdown alternate`,
    /rel="alternate";\s*type="text\/markdown"/.test(
      html.headers.get('link') ?? ''
    ),
    `Link: ${html.headers.get('link')}`
  )

  const md = await get(path, 'text/markdown')
  const ct = md.headers.get('content-type') ?? ''
  check(
    `${path} Accept: text/markdown → text/markdown`,
    md.status === 200 && ct.startsWith('text/markdown'),
    `status ${md.status}, content-type ${ct}`
  )
  check(
    `${path} markdown has Vary: Accept`,
    varyHasAccept(md.headers),
    `Vary: ${md.headers.get('vary')}`
  )
  check(
    `${path} markdown starts with an H1`,
    /^# \S/.test(md.body),
    md.body.slice(0, 80)
  )

  const altPath = path === '/' ? '/index.md' : `${path}.md`
  const alt = await get(altPath)
  check(
    `${altPath} serves the same markdown`,
    alt.status === 200 && alt.body === md.body,
    `status ${alt.status}`
  )

  const browser = await get(
    path,
    'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  )
  check(
    `${path} browser Accept still gets HTML`,
    (browser.headers.get('content-type') ?? '').startsWith('text/html')
  )
}

// 3. llms.txt
{
  const llms = await get('/llms.txt')
  const lines = llms.body.split('\n')
  check(
    '/llms.txt 200 text/markdown',
    llms.status === 200 &&
      (llms.headers.get('content-type') ?? '').startsWith('text/markdown'),
    `status ${llms.status}, ${llms.headers.get('content-type')}`
  )
  check(
    '/llms.txt starts with H1 then blockquote',
    lines[0]?.startsWith('# ') && lines[2]?.startsWith('> ')
  )
  check(
    '/llms.txt has a "When to use" section',
    /^## When to use/m.test(llms.body)
  )
  check(
    '/llms.txt says how to call the site',
    llms.body.includes('Accept: text/markdown') &&
      llms.body.includes('hello@thegoodfornothings.club')
  )
  const full = await get('/llms-full.txt')
  check(
    '/llms-full.txt 200 text/markdown',
    full.status === 200 &&
      (full.headers.get('content-type') ?? '').startsWith('text/markdown')
  )
}

// 4. JSON-LD on the home page, content ratio, trust pages
{
  const home = await get('/')
  const blocks = [
    ...home.body.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g
    ),
  ].map(m => JSON.parse(m[1]))
  const org = blocks.find(b =>
    ['Organization', 'LocalBusiness'].includes(b['@type'])
  )
  check('home has Organization/LocalBusiness JSON-LD', Boolean(org))
  check(
    'JSON-LD has contactPoint with email + contactType',
    Boolean(org?.contactPoint?.email && org?.contactPoint?.contactType)
  )
  check(
    'JSON-LD has PostalAddress',
    org?.address?.['@type'] === 'PostalAddress' &&
      Boolean(org?.address?.streetAddress)
  )

  const text = visibleText(home.body)
  const ratio = text.length / home.body.length
  check(
    `home has ≥ 500 chars of visible text (${text.length})`,
    text.length >= 500
  )
  const noScript = home.body.replace(/<script[\s\S]*?<\/script>/gi, '').length
  console.log(
    `info home text/HTML ratio ${(ratio * 100).toFixed(1)}% of ${home.body.length} bytes (${((text.length / noScript) * 100).toFixed(1)}% excluding scripts); audit target 5%`
  )
  check(
    'home has exactly one H1',
    (home.body.match(/<h1[\s>]/g) ?? []).length === 1
  )

  for (const path of ['/about', '/contact']) {
    const page = await get(path)
    const len = visibleText(page.body).length
    check(
      `${path} is a real page with ≥ 500 chars (${len})`,
      page.status === 200 && len >= 500
    )
  }
}

const failed = results.filter(r => !r.ok)
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed`
)
process.exit(failed.length ? 1 : 0)
