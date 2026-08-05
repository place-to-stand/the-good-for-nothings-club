import { internalMutation } from './aggregates'

/**
 * One-off content fixes, run by hand with e.g.:
 *   npx convex run maintenance:fixProjectLinks --prod
 *
 * projects.seoDescription was seeded on dev and prod on 2026-07-28 from a
 * since-deleted slug → description map (see git history: data/projectSeo.ts).
 */

// Stale hrefs inside project portable text (Ahrefs crawl 2026-07-27):
// http:// variants that now redirect, a link to the www alias of our own
// domain (308s to the bare domain), and lifepacks.co which 301s to www.
const LINK_FIXES: [from: string, to: string][] = [
  [
    'http://www.icecreamfactorystudio.com',
    'https://www.icecreamfactorystudio.com',
  ],
  ['http://www.dandysounds.com', 'https://dandysounds.com'],
  ['https://lifepacks.co/', 'https://www.lifepacks.co/'],
  ['https://www.thegoodfornothings.club/', 'https://thegoodfornothings.club/'],
]

const DAY = 24 * 60 * 60 * 1000

/**
 * DEV ONLY — reset the inquiry boards to one row per interesting state so
 * the /admin inquiries page has something to exercise. Deletes previous
 * mock rows (matched by @example.com email) first, so it's rerunnable.
 * Never run with --prod:
 *   npx convex run maintenance:seedMockInquiries
 */
export const seedMockInquiries = internalMutation({
  args: {},
  handler: async ctx => {
    const now = Date.now()
    const existing = await ctx.db.query('inquiries').collect()
    let deleted = 0
    for (const inquiry of existing) {
      if (inquiry.email.endsWith('@example.com')) {
        await ctx.db.delete(inquiry._id)
        deleted++
      }
    }

    const rows = [
      // ── Membership board ─────────────────────────────────────────────
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Nina Vasquez',
        email: 'nina@example.com',
        phone: '(512) 555-0141',
        message: 'Photographer looking for darkroom access and a desk a few days a week.',
        referralSource: 'Instagram',
        attribution: { utmSource: 'instagram', utmMedium: 'bio-link', landingPage: '/membership' },
        mailingList: true,
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Marcus Cole',
        email: 'marcus@example.com',
        message: 'Heard about the club from a friend — what does membership include?',
        referralSource: 'Friend or word of mouth',
        status: 'replied' as const,
        repliedAt: now - 2 * DAY,
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Priya Raman',
        email: 'priya@example.com',
        phone: '(512) 555-0177',
        status: 'tour_booked' as const,
        repliedAt: now - 5 * DAY,
        tourAt: now + 2 * DAY,
        notes: '8/3 — ceramicist, sounded great on email. Tour booked for this week.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Owen Zhu',
        email: 'owen@example.com',
        status: 'tour_booked' as const,
        repliedAt: now - 6 * DAY,
        tourAt: now - 1 * DAY,
        notes: '8/2 — woodworker. TOURED YESTERDAY — write up how it went and move him along.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Theo Brandt',
        email: 'theo@example.com',
        status: 'toured' as const,
        repliedAt: now - 10 * DAY,
        touredAt: now - 4 * DAY,
        notes: '8/1 — toured well, gets the etiquette stuff. Solid candidate for the next wave.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Sasha Ives',
        email: 'sasha@example.com',
        status: 'toured' as const,
        repliedAt: now - 9 * DAY,
        touredAt: now - 3 * DAY,
        notes: '8/2 — nice person but mostly wants storage. On the fence.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Alba Reyes',
        email: 'alba@example.com',
        status: 'waitlisted' as const,
        repliedAt: now - 20 * DAY,
        touredAt: now - 14 * DAY,
        waitlistRank: 1,
        followUpAt: now + 30 * DAY,
        notes: '7/21 — printmaker, perfect fit. First call when a spot opens.',
        manual: true,
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Jonah Petty',
        email: 'jonah@example.com',
        status: 'waitlisted' as const,
        repliedAt: now - 18 * DAY,
        touredAt: now - 12 * DAY,
        waitlistRank: 2,
        notes: '7/23 — good energy, wants evenings/weekends only.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Ren Okabe',
        email: 'ren@example.com',
        status: 'waitlisted' as const,
        repliedAt: now - 16 * DAY,
        touredAt: now - 11 * DAY,
        waitlistRank: 3,
        notes: '7/24 — fine fit but flexible timeline; effectively backlog.',
      },
      {
        kind: 'facility' as const,
        item: 'Darkroom',
        offering: 'Recurring rental',
        name: 'June Park',
        email: 'june@example.com',
        status: 'joined' as const,
        memberRole: 'member' as const,
        repliedAt: now - 40 * DAY,
        touredAt: now - 30 * DAY,
        joinedAt: now - 7 * DAY,
        notes: '6/25 — toured, loved it. Joined 7/28 as a monthly member.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Gus Herrera',
        email: 'gus@example.com',
        status: 'joined' as const,
        memberRole: 'associate' as const,
        repliedAt: now - 50 * DAY,
        touredAt: now - 42 * DAY,
        joinedAt: now - 20 * DAY,
        notes: '6/20 — hourly access for podcast recording. In the system.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Lena Wolfe',
        email: 'lena@example.com',
        status: 'joined' as const,
        memberRole: 'friend' as const,
        repliedAt: now - 35 * DAY,
        joinedAt: now - 15 * DAY,
        notes: '7/1 — old friend of Matt. Discord only for now.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Dev Okafor',
        email: 'dev@example.com',
        status: 'future' as const,
        repliedAt: now - 25 * DAY,
        followUpAt: now + 90 * DAY,
        notes: '7/10 — interested but moving apartments this fall; check back around November.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Cara Muniz',
        email: 'cara@example.com',
        status: 'declined' as const,
        repliedAt: now - 15 * DAY,
        touredAt: now - 9 * DAY,
        notes: '7/27 — the shared-space agreements were a dealbreaker for her.',
      },
      {
        kind: 'membership' as const,
        item: 'Studio Membership',
        name: 'Rex Dalton',
        email: 'rex@example.com',
        status: 'not_a_fit' as const,
        repliedAt: now - 12 * DAY,
        touredAt: now - 9 * DAY,
        notes: '7/26 — mostly wanted cheap storage for gear, not looking to make anything.',
        manual: true,
      },
      // ── Services board ───────────────────────────────────────────────
      {
        kind: 'service' as const,
        item: 'Web Design',
        name: 'Colin Hayes',
        email: 'colin@example.com',
        message: 'Need a site for my coffee trailer before SXSW.',
        referralSource: 'Google or search',
      },
      {
        kind: 'service' as const,
        item: 'Photography',
        name: 'Mara Quinn',
        email: 'mara@example.com',
        status: 'vetted' as const,
        repliedAt: now - 3 * DAY,
        followUpAt: now + 1 * DAY,
        notes: '8/2 — brand shoot for her bakery, budget checks out. Send the quote.',
      },
      {
        kind: 'service' as const,
        item: 'Video Production',
        name: 'Felix Nash',
        email: 'felix@example.com',
        status: 'joined' as const,
        repliedAt: now - 30 * DAY,
        joinedAt: now - 10 * DAY,
        notes: '7/5 — music video, shot mid-July. Would work with him again.',
      },
      // ── Inbox ────────────────────────────────────────────────────────
      {
        kind: 'general' as const,
        item: 'General',
        name: 'Tess Whitaker',
        email: 'tess@example.com',
        message: 'Do you ever host figure drawing nights?',
      },
      {
        kind: 'event' as const,
        item: 'Open House',
        name: 'Iris Chen',
        email: 'iris@example.com',
        status: 'closed' as const,
        repliedAt: now - 8 * DAY,
        notes: '7/29 — asked about the open house, sent her the events page.',
      },
    ]
    for (const row of rows) {
      await ctx.db.insert('inquiries', row)
    }
    return { deleted, inserted: rows.length }
  },
})

/**
 * Status spellings retired when the boards were rebuilt 2026-08-06:
 * met/interested → toured (prod never had them), won → joined,
 * lost → declined. 'toured' itself is canonical again. Run on dev and
 * prod, then drop the retired literals from inquiryStatusValidator:
 *   npx convex run maintenance:migrateInquiryStatuses --prod
 */
export const migrateInquiryStatuses = internalMutation({
  args: {},
  handler: async ctx => {
    const REMAP = {
      met: 'toured',
      interested: 'toured',
      won: 'joined',
      lost: 'declined',
    } as const
    const inquiries = await ctx.db.query('inquiries').collect()
    let patched = 0
    for (const inquiry of inquiries) {
      const next =
        inquiry.status && inquiry.status in REMAP
          ? REMAP[inquiry.status as keyof typeof REMAP]
          : undefined
      if (next) {
        await ctx.db.patch(inquiry._id, { status: next })
        patched++
      }
    }
    return { patched }
  },
})

export const fixProjectLinks = internalMutation({
  args: {},
  handler: async ctx => {
    const projects = await ctx.db.query('projects').collect()
    const patched: string[] = []

    for (const project of projects) {
      const { _id, _creationTime, ...fields } = project
      const before = JSON.stringify(fields)
      let after = before
      for (const [from, to] of LINK_FIXES) {
        after = after.split(from).join(to)
      }
      if (after !== before) {
        await ctx.db.patch(_id, JSON.parse(after))
        patched.push(project.slug)
      }
    }

    return { patched }
  },
})
