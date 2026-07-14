import { TableAggregate } from '@convex-dev/aggregate'
import { customCtx, customMutation } from 'convex-helpers/server/customFunctions'
import { Triggers } from 'convex-helpers/server/triggers'
import { v } from 'convex/values'

import { components, internal } from './_generated/api'
import type { DataModel } from './_generated/dataModel'
import {
  internalMutation as rawInternalMutation,
  mutation as rawMutation,
} from './_generated/server'

/**
 * O(log n) running totals for the /admin dashboard, so `admin.counts` reads a
 * few B-tree nodes instead of scanning whole tables (which was chewing through
 * Convex egress on every dashboard load). Each is count-only (`sortKey` → null);
 * media additionally sums `size` for the stored-bytes figure.
 *
 * These are kept in sync by triggers (below) plus a one-time `backfill`.
 */
export const inquiriesCount = new TableAggregate<{
  Key: null
  DataModel: DataModel
  TableName: 'inquiries'
}>(components.aggregateInquiries, { sortKey: () => null })

export const projectsCount = new TableAggregate<{
  Key: null
  DataModel: DataModel
  TableName: 'projects'
}>(components.aggregateProjects, { sortKey: () => null })

export const membersCount = new TableAggregate<{
  Key: null
  DataModel: DataModel
  TableName: 'members'
}>(components.aggregateMembers, { sortKey: () => null })

export const mediaStats = new TableAggregate<{
  Key: null
  DataModel: DataModel
  TableName: 'media'
}>(components.aggregateMedia, { sortKey: () => null, sumValue: doc => doc.size })

/**
 * Wire each aggregate to its table so any insert/patch/replace/delete flowing
 * through a mutation built here updates the running total atomically. Inquiries
 * is the only runtime writer today; projects/members/media are registered so a
 * future editor mutation stays correct without extra wiring.
 */
const triggers = new Triggers<DataModel>()
triggers.register('inquiries', inquiriesCount.trigger())
triggers.register('projects', projectsCount.trigger())
triggers.register('members', membersCount.trigger())
triggers.register('media', mediaStats.trigger())

/** Trigger-aware replacements for the generated mutation builders. */
export const mutation = customMutation(rawMutation, customCtx(triggers.wrapDB))
export const internalMutation = customMutation(rawInternalMutation, customCtx(triggers.wrapDB))

/**
 * One-time (per deploy) seed of the aggregates from existing rows. Paginates and
 * self-schedules the next page, so it stays within a single mutation's limits no
 * matter how large the media table is. `insertIfDoesNotExist` makes it safe to
 * re-run and safe to race against live inserts. Kick off per table with:
 *   npx convex run aggregates:backfill '{"table":"media"}' --prod
 */
export const backfill = rawInternalMutation({
  args: {
    table: v.union(
      v.literal('inquiries'),
      v.literal('projects'),
      v.literal('members'),
      v.literal('media')
    ),
    cursor: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, { table, cursor }) => {
    const opts = { numItems: 200, cursor: cursor ?? null }
    let isDone: boolean
    let continueCursor: string

    switch (table) {
      case 'inquiries': {
        const r = await ctx.db.query('inquiries').paginate(opts)
        for (const doc of r.page) await inquiriesCount.insertIfDoesNotExist(ctx, doc)
        ;({ isDone, continueCursor } = r)
        break
      }
      case 'projects': {
        const r = await ctx.db.query('projects').paginate(opts)
        for (const doc of r.page) await projectsCount.insertIfDoesNotExist(ctx, doc)
        ;({ isDone, continueCursor } = r)
        break
      }
      case 'members': {
        const r = await ctx.db.query('members').paginate(opts)
        for (const doc of r.page) await membersCount.insertIfDoesNotExist(ctx, doc)
        ;({ isDone, continueCursor } = r)
        break
      }
      case 'media': {
        const r = await ctx.db.query('media').paginate(opts)
        for (const doc of r.page) await mediaStats.insertIfDoesNotExist(ctx, doc)
        ;({ isDone, continueCursor } = r)
        break
      }
    }

    if (!isDone) {
      await ctx.scheduler.runAfter(0, internal.aggregates.backfill, {
        table,
        cursor: continueCursor,
      })
    }
    return { table, isDone }
  },
})
