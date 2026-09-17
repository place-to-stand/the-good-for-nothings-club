# SEO Remediation Changelog

Source: Ahrefs Site Audit project 10156879, crawl 2026-08-03. This repo is the
MAIN property (thegoodfornothings.club). SHOP tasks are documented in
`SEO-TODO-OTHER-PROPERTY.md` and were not executed here.

## T4 — Meta description too long (MAIN portion)

- Files: `app/members/[slug]/page.tsx`
- URLs: `/members/jason-desiderio` (161 chars → 154), plus the other four
  member pages which shrink proportionally (template-level fix: role list now
  joins with `&` and member-since month renders short form, e.g. "Nov 2022").
- Verify: `curl -s https://thegoodfornothings.club/members/jason-desiderio |
  grep -o '<meta name="description"[^>]*>'` and count chars — must be ≤ 158.
  The SHOP portion of T4 (25 product descriptions) is in
  `SEO-TODO-OTHER-PROPERTY.md`.

## T8 — Image file size too large (6 animated GIFs, the audit's 6 errors)

- Files: `public/gif-videos/*` (6 MP4s + 6 JPEG posters), `data/gifVideos.ts`,
  `components/GifVideo.tsx`, `components/ProjectCard.tsx`,
  `components/ProjectCardSmall.tsx`,
  `app/projects/[slug]/components/{Photo,Audio,Event,Video,Web,Build}Project.tsx`
- URLs: `/projects` and the project pages embedding the six Convex GIFs
  (worst: 6.7 MB → 290 KB; all six now 290–390 KB MP4 + ≤106 KB poster).
- What changed: next/image passes animated GIFs through unoptimized, so the
  full originals shipped. Each GIF now has a pre-compressed H.264 MP4 +
  poster committed to `/public/gif-videos`, keyed by Convex storage ID in
  `data/gifVideos.ts`. Components render `<video autoplay muted loop
  playsinline poster>` when a mapping exists; unmapped GIFs fall back to the
  old `<Image>` path. Poster + width/height prevent layout shift.
- Follow-up in the same task: five of the six GIFs turned out to be the
  member hover profile pictures on `/about` (rendered by
  `components/MemberProfilePicture.tsx`, now also mapped), not project
  cards; `data/gifVideos.ts` keys each asset under both its prod and dev
  deployment storage IDs. GIFs uploaded to Convex in the future need a new
  entry (ffmpeg commands documented in `data/gifVideos.ts`).
- Verify: after deploy, load `/projects` — network panel must show
  `/gif-videos/*.mp4` requests and no `image/gif` response over 500 KB.

## T10 — Indexable page not in sitemap (MAIN portion)

- Files: none (verification only)
- URLs: `/`, `/projects/limo-zine-volume-1`, `/projects/hijk-studios-chip`,
  `/members/jason-desiderio`
- Finding: working as intended. `app/sitemap.ts` already enumerates the
  homepage, every `/projects/*` (from Convex `projects.forSitemap`), every
  allowlisted `/members/*`, and the static routes; `app/robots.ts` references
  `https://thegoodfornothings.club/sitemap.xml`. All four flagged URLs return
  200 and are present in the live sitemap today — the 03-08 crawl appears to
  predate the current sitemap contents. Cross-links to SHOP already exist
  (`/projects/limo-zine-volume-1` → `SHOP/collections/limo-zine`,
  `/projects/hijk-studios-chip` → `SHOP/products/chip-baby-photo-t-shirt`).
- Verify: `curl -s https://thegoodfornothings.club/sitemap.xml` contains all
  four URLs; each returns 200. SHOP sitemap items are in
  `SEO-TODO-OTHER-PROPERTY.md`.

## T11 — Small cleanups

- **11a Redirect chain** — not actionable from this repo. The extra hop is
  Vercel's automatic edge TLS redirect (`http://www` → 308 → `https://www`),
  which runs before any vercel.json/next.config rule and is not
  configurable; the `www` → apex hop is already a single 308 at the domain
  level. Non-www apex remains canonical. No change made.
- **11b External 4XX** — both targets verified in a real browser on
  2026-08-04: `https://www.icecreamfactorystudio.com/` and
  `https://dandysounds.com/` load normally (titles render, content present).
  The 403/406 are bot-blocking, not dead links. Links left in place.
- **11c `dpl` param on facilities images** — notice-level Vercel skew
  protection cache-buster; harmless for images. Left as is per the brief
  ("do not disable skew protection"). Optional static pre-optimization of
  `/facilities/*.jpg` deliberately skipped as lowest priority.

## Global verification — scripts/seo-check.mjs

- Files: `scripts/seo-check.mjs`, `package.json` (`npm run seo:check`),
  `.github/workflows/seo-check.yml` (weekly + manual run against production)
- Checks per URL: exactly one non-empty `<h1>`; `<title>` ≤ 60 chars; meta
  description present and ≤ 158 chars; `og:image` present; every `<img>` has
  `alt`; no page/media response over 500 KB; no internal link resolving to a
  3XX. Seeded with the MAIN URL list (default) and the SHOP list
  (`--property shop|all`); `--base http://localhost:3001` targets a local
  server.
- Results on this branch (local): every MAIN URL passes except `/projects`,
  whose HTML payload is ~700 KB — a pre-existing RSC-payload issue outside
  the audit's flagged items, spun off as a separate follow-up task.
  Production will pass the image checks once this branch deploys.

## Follow-up — /projects HTML payload under 500 KB

- Files: `convex/projects.ts` (`list` query), `app/projects/page.tsx`
- URLs: `/projects` (704 KB → 486 KB locally; production lands lower still,
  since dev-mode module paths inflate the local RSC payload)
- What changed, two parts:
  1. `projects.list` now returns only what `ProjectCardSmall` renders. The
     old shape shipped `overview`, `caseStudy`, `photoGallery`, a duplicated
     `mainMedia`/`mainImage`, and full member objects (hover pictures,
     roles, lqips) per project. The card image drops unused
     hotspot/crop/aspectRatio; avatar `profilePicture` keeps only
     `asset.url` (the stack renders at 28 px and never blurs).
  2. `page.tsx` swaps each project's member copies for shared instances, so
     React Flight serializes each member once by reference instead of ~90×.
- Backward/forward compatible both ways: the deployed site code only reads
  retained fields, and the new page code works against the old fat query —
  so the Convex deploy and Vercel deploy can land in either order.
- ⚠️ Deploy note: this touches `convex/` — run `npx convex deploy` when this
  branch ships (see the standing runbook rule).
- Verify: `node scripts/seo-check.mjs --base http://localhost:3001` — the
  `/projects` "page HTML > 500 KB" failure is gone (all 17 URLs pass).
  Rendered output confirmed unchanged: tag/class skeleton and text content
  of `<main>` are identical to the pre-change production capture (sole diff
  is T8's intentional img→video swap).

## Code-review fixes (PR #50)

Eight review findings addressed:

1. **Hover videos never autoplayed from display:none** — GifVideo now takes
   `autoPlay`/`preload`/`videoRef` props; MemberProfilePicture starts the
   hover loop from onMouseEnter via ref (`play()`/`pause()`), and hover
   instances use `preload='none'`, so the five hover MP4s (~1.8 MB) no
   longer download eagerly on /about.
2. **seo-check silent passes** — request errors, media 4XX/5XX, and broken
   (4XX+) internal links now fail; when HEAD has no content-length a
   streaming GET measures up to the 500 KB budget and aborts (verified: it
   flags the 6.7 MB prod GIF after reading ~517 KB).
3. **Type lie behind `as unknown as`** — GFNC_projectListItem/GFNC_memberCard
   now mirror the real listPage projection; MemberAvatarStack accepts the
   slim member type (full GFNC_member still satisfies it structurally).
4. **Hardcoded URL list** — MAIN targets now come from `${base}/sitemap.xml`
   (~60 URLs incl. every project/member), so new pages are covered
   automatically; unreachable sitemap is a hard exit-2 failure.
5. **Flight-dedup fragility** — `projects.listPage` returns normalized
   `{members, projects(memberIds)}`; the page resolves ids to shared
   instances, so member dedup is structural, not an accident of serializer
   internals. The transitional `list` query keeps the deployed site working
   until the Vercel deploy lands (remove it afterwards).
6. **Six duplicated media blocks** — extracted
   `app/projects/[slug]/components/ProjectMainMedia.tsx`; the six detail
   templates render it in one line.
7. **Fragile CLI args** — seo-check accepts `--flag=value`, rejects unknown
   flags/values, and exits 2 instead of green when there is nothing to check.
8. **GIF map staleness** — documented in data/gifVideos.ts: no durable key
   survives a re-upload, so staleness is caught loudly by the
   sitemap-driven size/404 checks; convert-at-upload is the durable fix if
   a seventh entry lands.

Verified: tsc/lint/build clean; `node scripts/seo-check.mjs
--base=http://localhost:3001` passes all ~60 sitemap URLs; /projects HTML
485,925 bytes; rendered /projects DOM/text still identical to the prod
baseline except the intentional img→video swap.

## Agent readiness — Is Agentic / Ora audit (score 76/100)

Six items, in the audit's priority order. Verified locally against a
production build served with `scripts/convex-stub.mjs` standing in for
Convex; `node scripts/agent-check.mjs` re-checks production weekly.

### 1. Agent-friendly 404s

- Files: `app/not-found.tsx`, `lib/markdown/site.ts` (`notFoundMarkdown`),
  `app/markdown/[[...path]]/route.ts`
- What changed: unknown paths already returned a real 404; now the HTML
  404 is a site page listing every section, `/llms.txt`, `/sitemap.xml`,
  and the contact email. With `Accept: text/markdown` (or a `.md` URL) the
  404 body is markdown with the same links. Unknown project/member slugs
  behave the same.
- Verify: `curl -s -o /dev/null -w "%{http_code}" https://thegoodfornothings.club/some-path-that-does-not-exist`
  prints 404; add `-H 'Accept: text/markdown'` and the body starts `# 404`.

### 2. Content without JavaScript (text-to-HTML ratio)

- Files: `components/HeroBanner.tsx`, `public/hero/*.svg`
- What changed: the animated wordmark inlined ~29 KB of SVG paths into
  every home page response. The static letters now live in
  `/hero/base.svg` and the five glitch frames in `/hero/frame-N.svg`,
  rendered as stacked `<img>` overlays (all fetched up front; the interval
  only toggles visibility), so the animation and no-JS first frame look
  the same. Home HTML: 85 KB → 56 KB locally; text share 1.3% → 1.9%
  (4.1% excluding the RSC payload scripts).
- Not done: the audit's 5% target needs more visible homepage copy
  (~1,300 chars of body text at the current markup weight). That is a
  product/copy decision; `agent-check` reports the ratio without failing.

### 3. Markdown content negotiation (acceptmarkdown.com)

- Files: `proxy.ts` (was `middleware.ts`; Next 16 name), `lib/markdown/*`,
  `app/markdown/[[...path]]/route.ts`, `data/site.ts`, `next.config.mjs`
- What changed: every public page has a markdown twin built from the same
  data files (`data/*.ts`) or Convex queries the HTML uses. `Accept:
  text/markdown` (weighed by q-value against text/html) or the `.md`
  alternate URL (`/about.md`, `/index.md`, `/projects/<slug>.md`) is
  rewritten to the markdown route, which answers `text/markdown;
  charset=utf-8` with `Vary: Accept` and `Content-Location`. HTML
  responses carry `Link: <…md>; rel="alternate"; type="text/markdown"`.
  `Vary: Accept` on HTML is set through `next.config.mjs` headers (Vercel
  applies these by replacement, so the value also repeats Next's own
  router headers). Page titles/descriptions moved to `data/site.ts`
  (`PAGE_META`) so HTML metadata, markdown, and llms.txt share one source.
- Verify: `curl -sI -H 'Accept: text/markdown' https://thegoodfornothings.club/about`
  shows `content-type: text/markdown` and `vary: Accept`; without the
  header, `vary` still contains `Accept`. Note: `next start` re-sets Vary
  on app pages after the config header, so that one check only passes on
  Vercel.

### 4. Agent instructions (llms.txt)

- Files: `app/llms.txt/route.ts`, `app/llms-full.txt/route.ts`,
  `lib/markdown/site.ts` (`llmsTxt`)
- What changed: `/llms.txt` in llmstxt.org form (H1, blockquote summary,
  H2 link lists) with a "When to use this site" section naming the jobs
  the club is right for (workspace in Austin, hiring creatives, joining,
  events, portfolio) and what it is not for, plus "How to call this site"
  (markdown negotiation, `.md` URLs, email instead of the bot-checked
  forms). `/llms-full.txt` appends the full text of the static pages.

### 5. Organization schema completeness

- Files: `lib/structuredData.ts`, `data/social.ts`
- What changed: the LocalBusiness JSON-LD on every page now has a
  `contactPoint` (ContactPoint: customer service, email, /contact URL,
  language, area served) beside the existing PostalAddress and geo.
  Social profile URLs moved to `data/social.ts` so the JSON-LD and the
  footer icons read one list.

### 6. Trust anchor pages

- Not done, by decision. The audit wants a `/privacy` page with 500+
  characters beside `/about` and `/contact`. A draft was written and then
  pulled from this branch: the club would rather take the score hit than
  publish a policy nobody has reviewed. When one is wanted, the page needs
  an entry in `PAGE_META` (data/site.ts), a markdown renderer in
  lib/markdown/pages.ts, a sitemap entry, and a footer link; the audit
  checker in scripts/agent-check.mjs then needs `/privacy` added to its
  trust-page list.

### Tests and checks

- `npm test` — vitest (`tests/*.test.ts`): Accept parsing and q-values,
  Portable Text → markdown, every static page's markdown, project/member
  markdown from fixtures, llms.txt shape, 404 body, JSON-LD contactPoint +
  address, description length budget, the markdown route
  (200/404/503) and llms routes.
- Copy lives in `data/*.ts` only: `data/home.ts`, `data/about.ts`,
  `data/contact.ts`, and the existing facilities/services/membership/events
  copy objects feed both the HTML pages and the markdown twins.
  `tests/copySource.test.ts` fails if a page file carries prose of its own
  (a JSX text run or lead/title/description literal over 40 chars) or if
  the markdown stops rendering any copy string from the data files. The
  one deliberate difference per page is an `agentNote` field, the markdown
  stand-in for a form or dialog that needs a browser.
- `npm run agent:check [-- --base http://localhost:3005]` — live checks
  listed at the top of `scripts/agent-check.mjs`; runs weekly after
  `seo-check` in `.github/workflows/seo-check.yml`.
- Local result: 96/107 agent checks pass; the 11 failures are the
  `Vary: Accept`-on-HTML check that Next's own server cannot pass (see 3).
  `seo-check` passes every page except the stub's fake image host.
