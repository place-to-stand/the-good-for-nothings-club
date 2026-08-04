# SEO TODO — SHOP property (shop.thegoodfornothings.club)

These tasks from the 2026-08-03 Ahrefs audit (project 10156879) target the
Shopify storefront (theme `t/32`) and cannot be executed from this Next.js
repo. Run them from the Shopify theme repo / Admin. Task IDs match the
original remediation brief; `SHOP/` = `https://shop.thegoodfornothings.club/`.

Priority order: T1 → T2 → T3 → T5 → T6 → T7 → T9, then the SHOP halves of
T4 and T10.

## T1 — Remove the sitewide link to the 302 account redirect (67 pages)

Every crawled shop page links once to
`SHOP/customer_authentication/redirect?locale=en&region_country=US` (302) —
the account/login link in the shared header of theme `t/32`. Replace the
hardcoded href with `{{ routes.account_url }}` / `{{ routes.account_login_url }}`
in `layout/theme.liquid` / `sections/header.liquid` / the header snippet. If
the redirect is unavoidable (new customer accounts), add `rel="nofollow"`.
Acceptance: `grep -r "customer_authentication/redirect"` empty in the theme;
rendered header links to a 200 account URL.

## T2 — Missing alt text (4 theme images × 67 pages = 268 instances)

The four files, almost certainly a promo/featured grid section:

- `SHOP/cdn/shop/files/Instagram_post_-_10_1.jpg`
- `SHOP/cdn/shop/files/Instagram_post_-_9_1.jpg`
- `SHOP/cdn/shop/files/LIMO-Product1-1_f5a3d841-55a9-49a1-a18b-10ddf5df520e.jpg`
- `SHOP/cdn/shop/files/PREORDER_fd434cd8-e01e-459a-9a36-672ad64bdd56.jpg`

Add `alt="{{ image.alt | default: section.settings.heading | escape }}"` to
the rendering `image_tag`/`<img>` calls, then audit the whole theme: every
`<img>` gets an `alt` (decorative images get `alt=""`, not a missing
attribute).

## T3 — Meta description missing on 14 pages

Two parts:
1. Theme fallback chain in the `<head>` (page/collection description →
   truncated body copy → shop description) so no page renders empty.
2. Hand-written 120–158 char unique descriptions via the Shopify product/
   collection CSV import (`shopify-seo-import.csv`, columns
   `Handle,SEO Title,SEO Description`) for: SHOP homepage, `/collections`,
   `/collections/all`, `/collections/bestsellers`, `/collections/limo-zine`,
   `/collections/practice-space`, `/collections/hijk-studios`,
   `/collections/chris-donahue-photo`, `/collections/the-loveshakers`,
   `/pages/contact`. Policy pages (terms/privacy/refund) can share a short
   templated description. Do NOT write one for `/collections/all?page=2` —
   paginated URLs get the theme fallback only.

## T4 (SHOP half) — 25 over-length meta descriptions (316–320 chars)

Auto-generated from full product body copy and duplicated across product
families. Write per-product descriptions in `shopify-seo-import.csv` that
lead with what is unique (issue title / photo subject / garment design),
then the spec detail; also cap any template auto-truncation at 155 chars on
a word boundary. Groups (see the brief for the full 24-product list):
- A: 8 LIMO zine issues/combos — currently share a generic art-zine line
- B: 5 × 35mm 5x7 photo prints — identical poster-stock boilerplate
- C: 7 t-shirts — identical ring-spun cotton boilerplate
- D: 4 hats
The 24 "not indexable" duplicates are `?variant=` URLs and resolve
automatically. (The MAIN half — `/members/jason-desiderio` — is done in this
repo, see SEO-CHANGELOG.md.)

## T5 — 6 over-length title tags (72–84 chars)

Set explicit SEO titles ≤ 60 chars in `shopify-seo-import.csv`; shorten the
brand suffix to `| GFNC` and compress format descriptors
(`- 35mm 5x7" Photo` → `35mm Print`, `- Volume 01 | Issue 01` → `Vol 1 #1`).
Products: a-summer-sunset-on-the-city-skyline-35mm-5x7-photo (84),
pink-flowers-from-a-honeymoon-35mm-5x7-photo (78),
limozine-new-year-same-old-shit-volume-01-issue-01 (77),
limozine-summer-flings-things-volume-01-issue-03 (76),
box-full-of-broken-glass-35mm-5x7-photo (73),
italy-literally-a-film-photography-zine (72).

## T6 — H1 missing on `SHOP/pages/contact` and `SHOP/collections`

Render the page/collection-list title as exactly one `<h1>` in the page and
collection-list templates (check whether it exists but is emitted as a
`<div>`).

## T7 — og:image (and Twitter card) missing on the 14 T3 pages

In the theme's social-meta snippet add `og:image`, `og:image:width`,
`og:image:height`, `og:image:alt` (resolution: collection/page featured
image → shop social sharing image → brand fallback, 1200×630), point
`og:description` at the page's own meta description (currently the generic
shop name on all 14), and add `twitter:card` = `summary_large_image` +
title/description/image if absent.

## T9 — Trim `compiled_assets/styles.css` (49.5 KB, all 67 pages)

Audit for dead sections/unused vendor resets/duplicate utilities, split
single-template CSS into conditionally-loaded assets, inline critical CSS.
Target < 30 KB uncompressed. Verify no visual regression on homepage,
collection, product, cart, contact before committing.

## T10 (SHOP half) — sitemap discoverability

Shopify auto-generates `/sitemap.xml`; the audit says 38 shop URLs are in no
sitemap. Confirm `SHOP/robots.txt` exposes
`Sitemap: https://shop.thegoodfornothings.club/sitemap.xml` and that every
product/collection in the brief's T10 list is published to the Online Store
channel (unpublished resources are omitted). Exclude `?page=2` and
`?variant=` URLs. Report anything not fixable from the theme repo instead of
guessing. Also cross-link SHOP → MAIN (e.g. collection descriptions linking
to the matching `thegoodfornothings.club/projects/*` page).

## Explicitly out of scope (both properties)

Change-tracking notices (meta/title/H1/word-count changed, IndexNow),
"one dofollow incoming link" on `?variant=` URLs, and the two "Slow page"
variant URLs — see the brief. Do not add variant URLs to sitemaps or
internal links; just confirm variant pages carry a canonical to the clean
product URL.
