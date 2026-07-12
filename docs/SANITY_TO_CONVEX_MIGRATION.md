# Sanity → Convex Migration Plan (GFNC only)

_Drafted 2026-07-11. Scope: move all GFNC content out of Sanity into the existing
Convex instance, add a read-only admin, and rewire the site — so the GFNC site no
longer depends on the Sanity subscription._

## Background & key facts

- The Sanity project `ojzttvlq` / dataset `production` is a **shared "general data"
  instance** (repo: `place-to-stand/general-data`) holding five properties:
  GFNC, DIMR (blog), IIHD (~3,875 geo docs), NINE (band media), RSID (prompts).
- **Scope decision:** migrate GFNC only. The other four properties stay in Sanity
  "for another day" — the Sanity project therefore stays alive (downgrade the plan
  / shed paid seats once GFNC editing moves off it, but do not cancel).
- The site consumes exactly two document types via GROQ (`data/client.ts` →
  `cmsFetch`): `GFNC_project` (46 docs) and `GFNC_member` (5 docs). Consumers:
  `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`,
  `app/members/[slug]/page.tsx`, `app/about/page.tsx`, `app/sitemap.ts`,
  `app/api/events/upcoming/route.ts`, plus the `app/api/revalidate` webhook.
- GFNC-referenced assets: **158 assets, 684 MB raw** —
  144 project images (413 MB), 4 mp4s (249 MB; three ~83 MB promos from
  "Promo Videos for 3 Song EP #2"), 10 member images (22 MB).
- Convex free tier (~1 GiB file storage, ~1 GiB/mo file bandwidth) is enough,
  especially after the optimization pass below (~150–200 MB expected).
- 50 orphaned assets (0.17 GB) in the dataset are **not** GFNC-referenced → skipped.
- Migrating published docs only, unless a `SANITY_API_READ_TOKEN` is provided
  (needed to read drafts).

## Phase 1 — Convex schema

Extend `convex/schema.ts` (keeping `inquiries`) with:

- **`media`** — one row per migrated asset: `sanityAssetId` (indexed; idempotency +
  reference rewriting), `storageId` (Convex file storage), served `url`, kind
  (image/file), mimeType, extension, optimized + original byte sizes, dimensions,
  `lqip` blur placeholder.
- **`projects`** — mirrors `GFNC_project` from the studio schema: title, clientName,
  slug (indexed), type (indexed), status, mainLink, dateStarted/dateCompleted,
  featured, `membersInvolved` as Convex refs (joined in queries — only 5 members),
  `mainMedia`/`photoGallery` as inline media objects (url/dimensions/lqip/hotspot
  denormalized for zero-join renders), `summary`/`overview`/`caseStudy` as Portable
  Text JSON (image/video blocks rewritten to carry inline media info).
- **`members`** — fullName, slug (indexed), profilePicture + hoverProfilePicture
  (inline media objects with hotspot), roles, startDate, memberNumber.
- Both document tables keep `sanityId` + `sanityUpdatedAt` (sitemap `lastModified`,
  idempotent re-runs).

Portable Text is stored as-is (`v.array(v.any())`) — the block shape is
heterogeneous by design and `@portabletext/react` renders it unchanged.

## Phase 2 — Migration script (`scripts/migrate-sanity/`) with optimization pass

1. **Fetch** — GROQ-pull all GFNC docs + their referenced asset documents.
2. **Archive** — download every original binary to a local archive folder
   (byte-for-byte backup; never touched by optimization). Keep this archive
   somewhere durable before downgrading Sanity.
3. **Optimize** (on copies):
   - Images: cap long edge at ~2560px, re-encode high-quality (sharp). Small
     files/SVGs pass through.
   - The three ~83 MB mp4s: re-encode with ffmpeg (H.264, `-crf 23`,
     `+faststart`). The 0.2 MB mp4 passes through.
   - Regenerate dimensions + **lqip** from the optimized files so blur-up
     placeholders match what's served. Hotspot/crop are fractional (0–1) and
     survive resizing untouched.
4. **Upload** — optimized binaries to Convex file storage; insert `media` rows.
5. **Transform + insert** — docs via internal mutations; asset `_ref`s rewritten to
   inline media objects; member references converted to Convex ids; idempotent on
   Sanity `_id` (safe to re-run).
6. **Verify** — counts match live dataset, every reference resolves, all 46 project
   slugs present, before/after size report.

## Phase 3 — Read-only admin at `/admin/*`

- `@convex-dev/auth` (adds its `authTables` to the schema) with the **Password
  provider, sign-in only**: the user-creation callback rejects unknown emails, so
  signup is structurally impossible. Admin accounts seeded via a one-time internal
  mutation (Convex dashboard team members ≠ app users).
- `convexAuthNextjsMiddleware` gates `/admin/*` → redirects to `/admin/login`.
- Pages (all read-only; every query checks `ctx.auth`): dashboard with counts,
  `/admin/inquiries` (filter by kind), `/admin/projects`, `/admin/members`,
  `/admin/media` grid.

## Phase 4 — Rewire the public site

- Replace the six GROQ call sites with Convex queries via `fetchQuery`
  (`convex/nextjs`): projects list (+type filter), project by slug, member by
  slug, members by slugs, projects referencing a member, upcoming event, sitemap.
- Swap `getImageUrl` (Sanity image builder) for a Convex storage URL helper +
  `next/image` (`images.remotePatterns` for `*.convex.cloud`); lqip blur and
  hotspot `object-position` preserved from migrated metadata.
- Portable Text renders via `@portabletext/react` (already a dep) with the
  existing custom serializers pointed at inlined media fields.
- Delete `app/api/revalidate` (Sanity webhook); keep time-based ISR.

## Phase 5 — Cleanup & decommission

- Remove `next-sanity`, `@sanity/client`, `@sanity/image-url`,
  `@sanity/react-loader` (already unused) and Sanity types/plumbing.
- Drop `NEXT_PUBLIC_SANITY_*` + `SANITY_REVALIDATE_SECRET` from Vercel and env
  files (also stale `PAYLOAD_SECRET` / `DATABASE_URI` remnants).
- Archive the original-assets folder + a dataset export durably.
- Downgrade the Sanity plan / remove paid seats. **Do not cancel the project** —
  DIMR/IIHD/NINE/RSID still live there.

## Production cutover checklist (manual, before/at merge)

The branch runs entirely against the **dev** deployment (quirky-dalmatian-453).
Production (resolute-badger-392) needs the same setup before this branch ships:

1. `npx convex deploy` — push schema + functions to prod.
2. Set prod env vars (`npx convex env set --prod` or dashboard):
   `MIGRATION_SECRET` (temporary), `ADMIN_ALLOWED_EMAILS`, `SITE_URL`
   (https://www.thegoodfornothings.club), `JWT_PRIVATE_KEY` + `JWKS`
   (generate a fresh pair — don't reuse dev's).
3. Run the migration against prod:
   `MIGRATION_SECRET=<prod secret> node scripts/migrate-sanity/migrate.mjs --convex-url https://resolute-badger-392.convex.cloud`
   (re-runnable; verify step must report zero problems).
4. Merge the PR / deploy the site.
5. Sign in at /admin once (first sign-in sets your password) and spot-check.
6. Unset `MIGRATION_SECRET` on prod and dev — migration endpoints go dead.
7. Remove `NEXT_PUBLIC_SANITY_*` + `SANITY_REVALIDATE_SECRET` from Vercel env.
8. Copy `scripts/migrate-sanity/archive/` (684 MB of originals) somewhere
   durable (external drive / cloud storage).
9. Downgrade the Sanity plan / remove paid seats. **Keep the project** —
   DIMR/IIHD/NINE/RSID still read from it.

## Sequencing & rollback

Phase 1 → 2 land first (data copied, Sanity untouched — full rollback is "do
nothing"). Phase 3 next. Phase 4 on a branch with side-by-side visual checks
against the live site before merging. Phase 5 only after production is verified
on Convex. Content editing after migration happens via the Convex dashboard (or
LLM-edited data) until write features are wanted — consistent with the
local-typed-data direction.

## Decisions log

- 2026-07-11 — GFNC-only scope (other properties deferred).
- 2026-07-11 — Optimization pass baked into Phase 2; originals archived locally.
- Default: skip 50 orphaned assets; migrate published docs only (no drafts token).
