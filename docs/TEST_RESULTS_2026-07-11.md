# Test Plan Run — 2026-07-11 (automated, localhost)

Executed by Claude against `npm run dev` per docs/TEST_PLAN.md. Every
form permutation was submitted end to end (React form → /api/inquiry →
Convex dev deployment → Resend). All Convex test rows and the test
newsletter contact were deleted afterward; the ~22 TEST emails at
hello@thegoodfornothings.club are the remaining artifact — search
"TEST" or filter from no-reply@updates.thegoodfornothings.club and
bulk-delete.

## Bugs found and fixed during the run

1. **/projects returned 500** (every render). MemberAvatarStack passed
   an `asChild` child across the RSC boundary; Radix Slot rejects the
   serialized reference. Fixed with `'use client'` on the component.
2. **Events calendar showed 7 dates, page asks for 8** — the recurrence
   scan window was 120 days; 8 occurrences of 2 monthly events needs
   ~4.5 months. Widened to 400 days.
3. **Social links could exceed the 5-link cap** on rapid clicks (stale
   `fields.length` under batched renders), then failed zod's max(5)
   with no visible error. Now gated on the live form store.
4. **Mobile horizontal scroll on /contact** — the Google Maps tile
   renders 562px wide inside a 375px viewport. Fixed with
   `overflow-hidden` on the map's bordered wrapper.

## Findings for Jason to decide (not changed)

- **Shop link opens in the same tab** (header + footer), while social
  links open new tabs. Intentional?
- **/members index 404s** — only /members/[slug] detail pages exist.
  Sitemap links the detail pages; nothing links an index. Fine, or
  worth a redirect to /about?
- **Sitemap still lists all 48 /projects/_ and 5 /members/_ detail
  pages.** The pages work (post-fix), but if projects are deprioritized
  you may want them out of the sitemap.
- **Radio tap target is 47×20px** on mobile — below the ~44px Apple
  guideline. Works, but tight for thumbs.

## Pass summary

- §1 Global chrome: PASS (nav, selected states, hamburger open/links/
  close-on-navigate, footer links, newsletter valid + invalid,
  scroll-top handler fires on same-page nav click)
- §2 Pages: PASS on all 7 public pages + /projects + /members/[slug]
  (after fixes above); sitemap excludes /projects index
- §3A Contact form: PASS — all 6 subjects submitted and verified in
  Convex with correct kind/item; validation battery all caught (empty
  required, foo@bar, short phone); mask verified typing/backspace/
  11-digit paste/international passthrough
- §3B Services: PASS — all 8 dialogs submitted; titles correct; quote
  line persists on switch; switch test recorded item "Video" after
  opening Photography
- §3C RSVPs: PASS — both events; schedule lines correct; switch test
  recorded "Off Genre Jam" with updated title + schedule
- §3D Membership: PASS — all 5 facility prefills correct; tier→facility
  options correct per tier incl. reset to "Not sure yet"; Friend hides
  the dropdown; submissions for Member+desk (full fields), Associate+
  Not sure, Friend; references + portfolio validation blocked properly
- §3E Failure path: PASS — forced 500 shows "Something went wrong.
  Email us at hello@thegoodfornothings.club.", keeps the typed message,
  and leaves the form editable for retry
- §4 Mobile (375px emulation): PASS after map fix — no horizontal
  scroll on any page; fields stack; tiers stack in order; dialog fits
  (344×648), opaque purple, inner scroller works; calendar lines don't
  wrap; accordion opens
- §5 Keyboard: PASS structurally — tab order = Regarding → Name →
  Phone → Email → Message → Send, no tabindex overrides, every label
  targets its field; dialog close + Radix focus management confirmed
  via close button

## Needs a human / real device (environment couldn't produce it)

- Escape-closes-dialog and focus-return-to-trigger (pane can't send
  trusted key events; Radix built-ins, expected to work)
- Real iPhone Safari pass: tel keypad, elastic overscroll feel, tap
  comfort
- Email spot-check at hello@: subjects should read `Contact form: X`
  ×6, `Service inquiry: X` ×9, `Event RSVP: X` ×3, `Membership
application: X` ×3, one newsletter notification, and each should end
  with "Saved to inquiries table."
- Hover states and the button wipe animation (verified earlier in dev,
  but eyeball on the preview)
