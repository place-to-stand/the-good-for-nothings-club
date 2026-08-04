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
