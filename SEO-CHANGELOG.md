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
