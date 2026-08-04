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
- Note: keys cover the six prod storage IDs plus the one matching asset that
  exists on the dev deployment. GIFs uploaded to Convex in the future need a
  new entry (ffmpeg commands documented in `data/gifVideos.ts`).
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
