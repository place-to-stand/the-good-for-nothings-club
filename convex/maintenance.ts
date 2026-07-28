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
