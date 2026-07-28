# Shopify SEO punch list — shop.thegoodfornothings.club

From the Ahrefs site audit crawled 2026-07-27. The main-site items from that
audit were fixed in this repo on 2026-07-28 (metadata, sitemap, robots.txt,
image sizing, stale links in Convex content). Everything below has to be done
in the Shopify admin (Online Store → Themes → Edit code, unless noted).

Ordered by leverage — the first two items clear ~340 of the ~400 flagged
instances.

Status: items 1–4 completed in the Shopify admin on 2026-07-28.

## 1. ✅ Header/footer links to `www.thegoodfornothings.club` (68 inlinks)

Every shop page links twice (header + footer) to
`https://www.thegoodfornothings.club/`, which 308-redirects to the bare
domain. In the theme editor, find the "back to main site" link — likely a
menu item under Online Store → Navigation, or hardcoded in
`sections/header.liquid` / `sections/footer.liquid` — and change it to
`https://thegoodfornothings.club/`. This single change clears the
"links to redirect", "3XX redirect", "HTTP to HTTPS redirect", and
"redirect chain" issues in one shot.

## 2. ✅ Missing alt text — 268 images, exactly 4 per page

The "exactly 4 on every page" pattern means it's a theme snippet (logo,
payment icons, social icons, or similar), not product data. Find the four
`<img>` tags rendered on every page (view source on any page, look for
`alt=""` or missing alt) and add alt attributes in the snippet. All 268
instances clear at once.

## 3. ✅ Collection template has no H1 (12 pages)

`sections/main-collection-banner.liquid` (Dawn-based themes) or the
collection template renders the title in something other than an `<h1>`.
Make it `<h1>{{ collection.title }}</h1>`. Same for `templates/list-collections`
and `pages/contact`.

## 4. ✅ Shop homepage has two H1s

"The Good for Nothings Club" and "SHOP NOW" are both H1s. Demote the
"SHOP NOW" CTA to a styled `<span>`/`<div>` or button in the hero section
settings (many themes let you pick the heading tag per section).

## 5. Meta descriptions missing (14 pages) + og:image missing (same 14)

- Homepage: Online Store → Preferences → meta description (also fixes
  `og:description`). Set a social sharing image there too — that fixes
  `og:image` for the homepage and acts as the fallback for other pages.
- Collections: each collection's admin page → Search engine listing → edit
  description (150–160 chars).
- `/pages/contact` and policies: same per-page Search engine listing box.

## 6. Product meta descriptions auto-truncated at ~320 chars (20 products)

Shopify falls back to the product body when no SEO description is set. For
each of the 20 products flagged, write a 150–160 char description in
Product → Search engine listing. Product list is in the audit; includes the
skull tees, dad hats, LIMO zine issues/combos, 35mm photos, Loveshakers
merch, The Omen tee.

## 7. Product titles too long (6 products)

`limozine-new-year-same-old-shit…`, `box-full-of-broken-glass…`,
`a-summer-sunset-on-the-city-skyline…`, `pink-flowers-from-a-honeymoon…`,
`limozine-summer-flings-things…`, `italy-literally…` — set a shorter SEO
title (under ~60 chars incl. "| The Good for Nothings Club" suffix, or
drop the suffix) in each product's Search engine listing.

## 8. Collection grids link to `?variant=` URLs (16 orphaned canonicals)

Product cards link to `/products/x?variant=123`, so the canonical clean URL
gets zero internal links. In the product card snippet
(`snippets/card-product.liquid` or similar), link to `{{ product.url }}`
without the variant parameter.

## 9. Sitemap coverage (41 shop URLs "not in sitemap")

`robots.txt` already declares `https://shop.thegoodfornothings.club/sitemap.xml`
(verified 2026-07-28). The fix is in Google Search Console: add
`shop.thegoodfornothings.club` as its own property and submit the sitemap.
Ahrefs also only discovers sitemaps referenced for the crawled property —
recrawl after adding the property.

## 10. Slow page (11.9s): `/products/the-omen-t-shirt?variant=…`

TTFB was 13ms — the delay is client-side JS/apps/images. Check installed
apps' scripts (Online Store → Themes → App embeds) and the product's image
weights. Low priority; verify it reproduces before chasing it.

## Safe to ignore

- Shopify `customer_authentication` 302 redirect — platform behavior.
- Compiled `styles.css` size warnings — Shopify's own critical-CSS subsetting.
- "Canonical URL changed" / "Pages added to sitemaps" / "IndexNow" rows —
  informational notices, not defects.
- Main-site `/_next/image` "more than 3 URL params" — framework-internal.
