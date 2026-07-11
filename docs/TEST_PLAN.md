# GFNC Site Test Plan

A full walkthrough of the public site on desktop and mobile, with every
form permutation exercised end to end. The goal: no matter where someone
is on the site or what they're asking about, their message reaches
hello@thegoodfornothings.club with the right subject line.

## Setup

- **Where to test:** the Vercel preview URL for the branch (closest to
  production: real Resend sending), or `npm run dev` locally.
- **Test convention:** use your own email as the sender and start every
  message with `TEST` so submissions are easy to find and delete.
- **Inbox check:** after each submission block, confirm arrival at
  hello@thegoodfornothings.club, correct subject line, and that
  Reply-To is the sender's address.
- **Database note:** until `NEXT_PUBLIC_CONVEX_URL` is set in Vercel,
  every email should end with "NOT saved to database - this email is the
  only record." That's expected. Once Convex is connected, re-run one
  submission per form and confirm it flips to "Saved to inquiries table"
  and the row appears in the Convex dashboard's `inquiries` table.

## Device matrix

Full pass on the first two; spot-check the rest.

| Pass | Device                   | Size                                 |
| ---- | ------------------------ | ------------------------------------ |
| Full | Desktop Chrome           | 1440 wide                            |
| Full | iPhone Safari            | ~390 wide                            |
| Spot | Desktop Safari + Firefox | 1440                                 |
| Spot | Android Chrome           | ~412                                 |
| Spot | Tablet                   | 768 (hamburger vs full nav boundary) |

---

## 1. Global chrome (check once per device)

Header

- [ ] Logo links home; no selected-state on logo when hamburger is showing
- [ ] Nav: Facilities, Services, Events, Membership, Shop, About, Contact all navigate; current page shows selected state
- [ ] Shop opens shop.thegoodfornothings.club in a new tab
- [ ] Apply to Join button goes to /membership and the hover wipe animates
- [ ] Clicking the link for the page you're already on scrolls to top
- [ ] Mobile: hamburger opens/closes, all links present, menu closes after navigating

Footer

- [ ] Logo links home; menu links all work (no Projects entry)
- [ ] Newsletter: valid email → success state
- [ ] Newsletter: invalid email (`foo@`) → validation error, no submission
- [ ] Membership column CTA works; hover states on buttons and social icons
- [ ] Social icons open Instagram etc. in new tabs

## 2. Page-by-page

Home `/`

- [ ] Hero renders; page-list section links all navigate; descriptions vertically centered
- [ ] Instagram feed loads (or fails gracefully if the API is down)
- [ ] No projects/leadership sections present

Facilities `/facilities`

- [ ] Four facility cards with prices; group labels and dotted leaders legible
- [ ] Consignment Shop section renders (Online Store card)
- [ ] Amenities band lists items (includes "Creamer")
- [ ] All five CTAs open the right application dialog (see §3C)

Services `/services`

- [ ] All 8 service cards render with prices and inquiry buttons

Events `/events`

- [ ] Calendar shows 8 upcoming dates grouped by month, weekday format like `Thu 13 · 4 PM`
- [ ] Both recurring event cards show schedule and RSVP buttons
- [ ] "Apply to join as a friend" link goes to /membership

Membership `/membership`

- [ ] Three tier cards in order Member / Associate / Friend; "Includes" bars align across the row (desktop)
- [ ] How to join: 3 numbered steps, policies box, column divider (desktop)
- [ ] Embedded application form renders (full permutations in §3D)

About `/about`

- [ ] Founding Members grid renders with photos, member #, since date, roles
- [ ] Past Members accordion: loads closed, opens smoothly, shows Eric Fenny, hairlines darken on hover
- [ ] "What happens here" bullets incl. Shop and "Got an idea?" → /contact link

Contact `/contact`

- [ ] Email link, social icons, location + map render
- [ ] Form renders on the right (desktop) / below (mobile)

Legacy routes

- [ ] /projects and /members still render (linked nowhere, but shouldn't 404)
- [ ] /sitemap.xml includes main pages, excludes /projects

---

## 3. Form permutations

For each submission: fill minimum required fields, submit, confirm the
success message appears, then confirm the email (subject + body) arrived.

### A. Contact form (6 subjects)

Success copy: "Got it. We'll get back to you soon."

- [ ] General Inquiry → subject `Contact form: General Inquiry`
- [ ] Booking the clubhouse → `Contact form: Booking the clubhouse`
- [ ] Hiring the club for a project → `Contact form: Hiring the club for a project`
- [ ] Membership questions → `Contact form: Membership questions`
- [ ] Press or partnerships → `Contact form: Press or partnerships`
- [ ] Other → `Contact form: Other`

Validation (once, on this form)

- [ ] Empty name/email → blocked with errors
- [ ] Bad email (`foo@bar`) → error
- [ ] Phone `123` (under 7 digits) → "Enter a valid phone number."
- [ ] Phone typing `5125551234` → masks to `(512) 555-1234` as you type
- [ ] Backspacing through the mask never gets stuck
- [ ] Pasting `15125551234` → `(512) 555-1234` (leading 1 stripped)
- [ ] `+44 20 7946 0958` → left as typed, submits fine
- [ ] Phone/message empty → still submits (both optional)
- [ ] Email body shows the phone in its masked format

### B. Service inquiry dialogs (8 launch points)

Open each from its card on /services. Success copy: "Got it. We'll get
back to you to talk through the project."

For every dialog: title matches the service, the quote line ("Tell us
what you have in mind...") stays put when you switch the dropdown, and
the dropdown lists only the 8 services.

- [ ] Photography → subject `Service inquiry: Photography`
- [ ] Video → `Service inquiry: Video`
- [ ] Music production → `Service inquiry: Music production`
- [ ] Branded zines → `Service inquiry: Branded zines`
- [ ] Photo booth → `Service inquiry: Photo booth`
- [ ] Pop-up cinema → `Service inquiry: Pop-up cinema`
- [ ] Sound system + operator → `Service inquiry: Sound system + operator`
- [ ] Event planning → `Service inquiry: Event planning`
- [ ] Switch test: open Photography, change dropdown to Video → title
      becomes "Video", submit → email says Video, not Photography

### C. Event RSVP dialogs (2 launch points)

From /events. Success copy: "You're on the list. See you there."
Dropdown lists only the 2 events.

- [ ] Works in Progress → subject `Event RSVP: Works in Progress`;
      description reads "Second Thursday · 4 PM at the clubhouse."
- [ ] Off Genre Jam → `Event RSVP: Off Genre Jam`; "Third Sunday · 7 PM..."
- [ ] Switch test: open Works in Progress, switch to Off Genre Jam →
      title AND schedule line update; submit → email says Off Genre Jam

### D. Membership application (dialog + embedded)

Subject is always `Membership application: <Tier>` with an Offering
line in the body. Success copy: "Application received. We accept in
waves as space opens up - we'll be in touch."

Facilities-page dialog prefills (open each, verify tier + facility are
preselected, then submit one of them):

- [ ] Permanent desk → Member + Permanent desk
- [ ] Band practice room → Member + Band practice room
- [ ] Photo studio → Associate + Photo studio
- [ ] Mixing control room → Associate + Mixing control room
- [ ] Online Store (Consignment) → Associate + Online Store

Embedded form on /membership — tier logic:

- [ ] Member → "Which facility?" lists Not sure yet, Permanent desk, Band practice room (with prices)
- [ ] Associate → lists Not sure yet, Photo studio, Mixing control room, Online Store
- [ ] Friend → no facility dropdown at all
- [ ] Switching tier resets an incompatible facility back to "Not sure yet"

Submit one application per tier:

- [ ] Member (+ a facility) → email shows Offering
- [ ] Associate + Not sure yet → email shows Offering `-`
- [ ] Friend → no offering in email

Field behaviors:

- [ ] Social links: add up to 5, X removes, "+ Add another" disappears at 5; blank rows dropped from email
- [ ] Portfolio `not-a-url` → "Enter a valid URL."; empty is fine
- [ ] References unanswered → "Select yes or no." blocks submit
- [ ] Radios: rest = faint circle, hover = outline (matches inputs), checked = black ring + dot
- [ ] Phone mask works here too (shared component)

### E. Failure path (once)

- [ ] With DevTools offline (or the API blocked), submit any form →
      error shows "Something went wrong. Email us at
      hello@thegoodfornothings.club." and the form's data is not lost

---

## 4. Mobile-specific (iPhone pass)

- [ ] No horizontal scroll on any page
- [ ] Dialogs: fit within viewport, inner area scrolls, background stays
      purple when overscrolling (no transparent gap), Close/X reachable
- [ ] Phone field brings up the telephone keypad (type=tel)
- [ ] Name/phone grid collapses to single column; fields full width
- [ ] Radios and dialog buttons are comfortably tappable
- [ ] Events calendar lines don't wrap awkwardly
- [ ] About accordion animates smoothly on touch
- [ ] Tier cards stack in order; "Includes" bars still read well

## 5. Keyboard & accessibility quick pass (desktop)

- [ ] Tab through the contact form in order: Regarding → Name → Phone →
      Email → Message → Send; focus outline visible on every field
- [ ] Dialogs: focus moves in on open, Escape closes, focus returns to
      the trigger button
- [ ] Every field's label is clickable and focuses its input
- [ ] Radio group navigable with arrow keys

## 6. After testing

- [ ] Delete/mark the TEST emails in hello@
- [ ] Log anything broken as a todo; re-test that section after fixing
