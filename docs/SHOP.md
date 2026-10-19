# Shop (/shop)

The shop lives on this site. Shopify holds the products and runs checkout;
the site reads the catalog through the Storefront API (`lib/shopify`).

## Pages

| URL | File |
|---|---|
| `/shop` | `app/(site)/shop/page.tsx` |
| `/shop/collections/<handle>` | `app/(site)/shop/collections/[handle]/page.tsx` |
| `/shop/collections/all` | same page; lists every product |
| `/shop/products/<handle>` | `app/(site)/shop/products/[handle]/page.tsx` |
| `/shop/search?q=` | `app/(site)/shop/search/page.tsx` |

Each has a markdown twin (`/shop.md`, `/shop/products/<handle>.md`, …).

The shop bar's search box suggests products, collections and searches as
you type, from `/api/shop/suggest?q=` (Shopify predictive search).

## A custom landing page for a collection

1. Find the collection's handle: the last part of its URL in Shopify.
2. Copy `docs/examples/collection-landing-page.tsx` to
   `app/(site)/shop/collections/<handle>/page.tsx`.
3. Change `HANDLE` and design the page. Reuse `CollectionBrowser` for the
   product grid so prices, stock and sorting keep working, or `Carousel`
   for a single scrolling row of `ProductCard`s.

Next serves the named folder instead of the standard page. Delete the
folder to go back to the standard page.

## Setup

Set `SHOPIFY_STORE_DOMAIN` (the `something.myshopify.com` address) and
`SHOPIFY_STOREFRONT_ACCESS_TOKEN` (Headless sales channel, public token) in
Vercel. Without the domain, /shop shows an "offline" note.

Catalog reads are cached for about a minute, so Shopify edits show up on
their own.

## Working offline

`scripts/shopify-stub.mjs` answers the shop's queries with fixture
products:

```bash
node scripts/convex-stub.mjs & node scripts/shopify-stub.mjs &
NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3999 SHOPIFY_STORE_DOMAIN=http://127.0.0.1:3998 \
  RESEND_API_KEY=re_stub NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=stub npx next build
```

## Google Shopping at launch

Google Merchant Center lists products from the Shopify feed. To keep those
listings working once the shop moves here:

- Each product page carries Product structured data with one offer per
  variant (price, currency, stock, SKU, and a `?variant=` link). Prices come
  from Shopify and refresh about once a minute, so they match the feed.
  Opening a `?variant=` link starts the page on that variant.
- The feed links to the old Shopify store pages. At launch, either point
  the feed at these pages or redirect old product URLs by handle
  (`/products/<handle>` to `/shop/products/<handle>`, and the same for
  `/collections/<handle>`).
- Keep product handles stable. Merging duplicate products should keep the
  handle the feed already uses.
- Product pages are in the sitemap with canonical URLs.
