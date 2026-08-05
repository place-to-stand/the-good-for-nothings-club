import { getAuthUserId } from '@convex-dev/auth/server'
import { paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'

// Trigger-aware builder: writes to inquiries must keep its aggregate in sync.
import { mediaStats, mutation } from './aggregates'
import type { Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { query } from './_generated/server'
import { inquiryStatusValidator, memberRoleValidator } from './schema'

/**
 * Queries for the /admin pages, plus the inquiry-editing mutations (status,
 * notes, dates, waitlist order, manual entry). Every function requires a
 * signed-in user (accounts are allowlist-only — see convex/auth.ts). CMS
 * content stays read-only by design: the admin is a viewer, not an editor.
 */
async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx)
  if (userId === null) {
    throw new Error('Not authenticated')
  }
  return userId
}

/** Cheap grand totals for the media page header (avoids scanning the table). */
export const mediaTotals = query({
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    const [count, bytes] = await Promise.all([mediaStats.count(ctx), mediaStats.sum(ctx)])
    return { count, bytes }
  },
})

const inquiryKindValidator = v.union(
  v.literal('facility'),
  v.literal('service'),
  v.literal('membership'),
  v.literal('event'),
  v.literal('general')
)

/** Mirrors PIPELINE_FOR_KIND in data/schemas.ts, inverted per board. */
const PIPELINE_KINDS = {
  membership: ['membership', 'facility'],
  services: ['service'],
  inbox: ['event', 'general'],
} as const

const pipelineValidator = v.union(
  v.literal('membership'),
  v.literal('services'),
  v.literal('inbox')
)

/** Mirrors CLOSED_INQUIRY_STATUSES in data/schemas.ts. */
const CLOSED_STATUSES = ['joined', 'declined', 'not_a_fit', 'closed']

export const listInquiries = query({
  args: {
    paginationOpts: paginationOptsValidator,
    /** Restrict to one board's kinds; omit for every inquiry. */
    pipeline: v.optional(pipelineValidator),
    /** Show only these stages; omit for every stage. */
    statuses: v.optional(v.array(inquiryStatusValidator)),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const kinds = args.pipeline ? PIPELINE_KINDS[args.pipeline] : undefined
    const statuses = args.statuses
    // Post-scan filters are fine at this table's size. 'new' also matches
    // rows predating the status field.
    const filtered = ctx.db.query('inquiries').filter(q => {
      const conditions = []
      if (kinds) {
        conditions.push(q.or(...kinds.map(kind => q.eq(q.field('kind'), kind))))
      }
      if (statuses && statuses.length > 0) {
        conditions.push(
          q.or(
            ...statuses.flatMap(status => {
              const matches = [q.eq(q.field('status'), status)]
              if (status === 'new') {
                matches.push(q.eq(q.field('status'), undefined))
              }
              return matches
            })
          )
        )
      }
      return conditions.length > 0 ? q.and(...conditions) : true
    })
    return await filtered.order('desc').paginate(args.paginationOpts)
  },
})

/** One inquiry for the detail sheet — live, so edits reflect immediately. */
export const getInquiry = query({
  args: { id: v.id('inquiries') },
  handler: async (ctx, { id }) => {
    await requireUser(ctx)
    return await ctx.db.get(id)
  },
})

/** The approved-members queue, in call order (rank 1 first). */
export const listWaitlist = query({
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    const waitlisted = await ctx.db
      .query('inquiries')
      .filter(q => q.eq(q.field('status'), 'waitlisted'))
      .take(200)
    return waitlisted.sort(
      (a, b) => (a.waitlistRank ?? Infinity) - (b.waitlistRank ?? Infinity)
    )
  },
})

/**
 * Move one waitlisted inquiry up/down/to the top of the call order, then
 * renumber the whole queue 1..n so ranks stay dense.
 */
export const reorderWaitlist = mutation({
  args: {
    id: v.id('inquiries'),
    to: v.union(v.literal('up'), v.literal('down'), v.literal('top')),
  },
  handler: async (ctx, { id, to }) => {
    await requireUser(ctx)
    const waitlisted = (
      await ctx.db
        .query('inquiries')
        .filter(q => q.eq(q.field('status'), 'waitlisted'))
        .take(200)
    ).sort((a, b) => (a.waitlistRank ?? Infinity) - (b.waitlistRank ?? Infinity))
    const from = waitlisted.findIndex(inquiry => inquiry._id === id)
    if (from === -1) {
      throw new Error('Not on the waitlist')
    }
    const target =
      to === 'top'
        ? 0
        : to === 'up'
          ? Math.max(0, from - 1)
          : Math.min(waitlisted.length - 1, from + 1)
    const [moved] = waitlisted.splice(from, 1)
    waitlisted.splice(target, 0, moved)
    await Promise.all(
      waitlisted.map((row, index) =>
        row.waitlistRank === index + 1
          ? Promise.resolve()
          : ctx.db.patch(row._id, { waitlistRank: index + 1 })
      )
    )
  },
})

/**
 * Per-board status counts for the sidebar badges and board tiles. Unlike
 * media (whose scans caused the egress problem), inquiry rows are small and
 * few, and the reactive payload here is just numbers — a scan per change is
 * cheap. No args, so every subscriber shares one cached result.
 */
export const pipelineSummary = query({
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    const all = await ctx.db.query('inquiries').collect()
    const emptyBoard = () =>
      ({ active: 0, total: 0 }) as Record<string, number>
    const boards = {
      membership: emptyBoard(),
      services: emptyBoard(),
      inbox: emptyBoard(),
    }
    for (const inquiry of all) {
      const pipeline = (
        Object.keys(PIPELINE_KINDS) as (keyof typeof PIPELINE_KINDS)[]
      ).find(p => (PIPELINE_KINDS[p] as readonly string[]).includes(inquiry.kind))!
      const status = inquiry.status ?? 'new'
      const board = boards[pipeline]
      board[status] = (board[status] ?? 0) + 1
      board.total++
      if (!CLOSED_STATUSES.includes(status)) board.active++
    }
    return { boards }
  },
})

/**
 * The work queue, in three sections: tours to run or log (booked, and the
 * date is today/past/unset), follow-ups due, and untouched new inquiries.
 * Bounded takes instead of pagination — if any section nears 100 the club
 * has bigger problems.
 */
export const listTodo = query({
  args: { dueBefore: v.number() },
  handler: async (ctx, { dueBefore }) => {
    await requireUser(ctx)
    const booked = await ctx.db
      .query('inquiries')
      .filter(q => q.eq(q.field('status'), 'tour_booked'))
      .take(100)
    // Unset tour dates need scheduling; keep them visible, after dated ones.
    const tours = booked
      .filter(inquiry => inquiry.tourAt === undefined || inquiry.tourAt <= dueBefore)
      .sort((a, b) => (a.tourAt ?? Infinity) - (b.tourAt ?? Infinity))
    // Missing fields sort before numbers in Convex, so gt(0) skips rows
    // with no follow-up date.
    const followUps = await ctx.db
      .query('inquiries')
      .withIndex('by_follow_up', q =>
        q.gt('followUpAt', 0).lte('followUpAt', dueBefore)
      )
      .order('asc')
      .take(100)
    const fresh = await ctx.db
      .query('inquiries')
      .filter(q =>
        q.or(q.eq(q.field('status'), 'new'), q.eq(q.field('status'), undefined))
      )
      .order('desc')
      .take(100)
    const seen = new Set<Id<'inquiries'>>([
      ...tours.map(i => i._id),
      ...followUps.map(i => i._id),
    ])
    return {
      tours,
      followUps: followUps.filter(i => !tours.some(t => t._id === i._id)),
      fresh: fresh.filter(i => !seen.has(i._id)),
    }
  },
})

/** Highest current waitlist rank, so new entries land at the bottom. */
async function nextWaitlistRank(ctx: MutationCtx) {
  const waitlisted = await ctx.db
    .query('inquiries')
    .filter(q => q.eq(q.field('status'), 'waitlisted'))
    .take(200)
  return (
    waitlisted.reduce((max, row) => Math.max(max, row.waitlistRank ?? 0), 0) + 1
  )
}

export const setInquiryStatus = mutation({
  args: {
    id: v.id('inquiries'),
    status: inquiryStatusValidator,
  },
  handler: async (ctx, { id, status }) => {
    await requireUser(ctx)
    const inquiry = await ctx.db.get(id)
    if (!inquiry) {
      throw new Error('Inquiry not found')
    }
    if ((inquiry.status ?? 'new') === status) {
      return
    }
    const patch: {
      status: typeof status
      statusHistory: { status: string; at: number }[]
      repliedAt?: number
      touredAt?: number
      joinedAt?: number
      followUpAt?: number | undefined
      waitlistRank?: number | undefined
    } = {
      status,
      // Append-only transition log — the raw material for funnel analysis
      // (time-in-stage, stage-to-stage conversion).
      statusHistory: [
        ...(inquiry.statusHistory ?? []),
        { status, at: Date.now() },
      ],
    }
    // Stamp first contact once, so time-to-first-reply survives later moves.
    if (status !== 'new' && inquiry.repliedAt === undefined) {
      patch.repliedAt = Date.now()
    }
    // The tour date defaults to the scheduled one; both stay editable.
    if (status === 'toured' && inquiry.touredAt === undefined) {
      patch.touredAt = inquiry.tourAt ?? Date.now()
    }
    if (status === 'joined' && inquiry.joinedAt === undefined) {
      patch.joinedAt = Date.now()
    }
    // Closing an inquiry cancels its pending follow-up, so it leaves the
    // to-do queue instead of lingering as a ghost task.
    if (CLOSED_STATUSES.includes(status)) {
      patch.followUpAt = undefined
    }
    // Entering the waitlist lands at the bottom of the call order; leaving
    // it (in any direction) gives the rank back.
    if (status === 'waitlisted') {
      if (inquiry.waitlistRank === undefined) {
        patch.waitlistRank = await nextWaitlistRank(ctx)
      }
    } else if (inquiry.waitlistRank !== undefined) {
      patch.waitlistRank = undefined
    }
    await ctx.db.patch(id, patch)
  },
})

export const updateInquiryDetails = mutation({
  args: {
    id: v.id('inquiries'),
    /** Empty string clears the notes field. */
    notes: v.optional(v.string()),
    // For dates: a number sets, null clears, absent leaves untouched.
    tourAt: v.optional(v.union(v.number(), v.null())),
    touredAt: v.optional(v.union(v.number(), v.null())),
    joinedAt: v.optional(v.union(v.number(), v.null())),
    followUpAt: v.optional(v.union(v.number(), v.null())),
    /** Null clears the role. */
    memberRole: v.optional(v.union(memberRoleValidator, v.null())),
  },
  handler: async (ctx, { id, notes, memberRole, ...dates }) => {
    await requireUser(ctx)
    const inquiry = await ctx.db.get(id)
    if (!inquiry) {
      throw new Error('Inquiry not found')
    }
    // Patching a key to undefined removes it from the document.
    const patch: Record<string, number | string | undefined> = {}
    if (notes !== undefined) {
      patch.notes = notes.trim() || undefined
    }
    if (memberRole !== undefined) {
      patch.memberRole = memberRole ?? undefined
    }
    for (const key of ['tourAt', 'touredAt', 'joinedAt', 'followUpAt'] as const) {
      const value = dates[key]
      if (value !== undefined) {
        patch[key] = value ?? undefined
      }
    }
    await ctx.db.patch(id, patch)
  },
})

/**
 * An inquiry entered by hand — someone met at an open house or through word
 * of mouth who never touched a website form. Lands in the same table so the
 * whole pipeline lives in one place; `manual: true` marks the provenance.
 */
export const addInquiry = mutation({
  args: {
    kind: inquiryKindValidator,
    item: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(inquiryStatusValidator),
    tourAt: v.optional(v.number()),
    followUpAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    const status = args.status ?? 'new'
    await ctx.db.insert('inquiries', {
      ...args,
      notes: args.notes?.trim() || undefined,
      status,
      manual: true,
      // No repliedAt: time-to-first-reply only means something for form
      // submissions. Direct-to-'toured' entries get today as the tour date.
      touredAt: status === 'toured' ? Date.now() : undefined,
      waitlistRank:
        status === 'waitlisted' ? await nextWaitlistRank(ctx) : undefined,
      // Seed the funnel log when a hand-added row starts past 'new'.
      statusHistory:
        status === 'new' ? undefined : [{ status, at: Date.now() }],
    })
  },
})

export const listProjects = query({
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    const projects = await ctx.db.query('projects').collect()
    const members = await ctx.db.query('members').collect()
    const memberNames = new Map(members.map(m => [m._id, m.fullName]))
    return projects
      .sort((a, b) => (b.dateCompleted ?? b.dateStarted ?? '').localeCompare(a.dateCompleted ?? a.dateStarted ?? ''))
      .map(project => ({
        _id: project._id,
        title: project.title,
        clientName: project.clientName,
        slug: project.slug,
        type: project.type,
        status: project.status,
        dateStarted: project.dateStarted,
        dateCompleted: project.dateCompleted,
        featured: project.featured ?? false,
        members: project.membersInvolved.map(id => memberNames.get(id) ?? '?'),
        thumbnail:
          project.mainMedia.flatMap(item => (item.kind === 'image' ? [item.image] : []))[0] ?? null,
      }))
  },
})

export const listMembers = query({
  args: {},
  handler: async ctx => {
    await requireUser(ctx)
    const members = await ctx.db
      .query('members')
      .withIndex('by_member_number')
      .order('asc')
      .collect()
    return members
  },
})

export const listMedia = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await requireUser(ctx)
    // Largest assets first (by_size index) so the storage hogs surface on page one.
    return await ctx.db
      .query('media')
      .withIndex('by_size')
      .order('desc')
      .paginate(args.paginationOpts)
  },
})
