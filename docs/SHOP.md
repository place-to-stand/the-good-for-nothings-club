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
2. Copy `app/(site)/shop/collections/so-many-cults/` to a folder named
   after that handle.
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
