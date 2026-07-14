import aggregate from '@convex-dev/aggregate/convex.config'
import { defineApp } from 'convex/server'

/**
 * Convex components used by the app. Each aggregate keeps an O(log n) running
 * count (and, for media, a byte sum) so the /admin dashboard never scans whole
 * tables — see convex/aggregates.ts and admin.counts. Component state is keyed
 * by name, so every counted table gets its own instance.
 */
const app = defineApp()
app.use(aggregate, { name: 'aggregateInquiries' })
app.use(aggregate, { name: 'aggregateProjects' })
app.use(aggregate, { name: 'aggregateMembers' })
app.use(aggregate, { name: 'aggregateMedia' })
export default app
