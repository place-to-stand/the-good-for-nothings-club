#!/usr/bin/env node
/**
 * Minimal Convex HTTP stand-in so `next build` / `next start` can run
 * without a deployment (offline CI, local verification). Answers the site's
 * public queries with one fixture member and one fixture project; anything
 * else returns null. Not for the admin.
 *
 * Usage:
 *   node scripts/convex-stub.mjs &
 *   NEXT_PUBLIC_CONVEX_URL=http://127.0.0.1:3999 RESEND_API_KEY=re_stub \
 *     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=stub npx next build && npx next start --port 3005
 *   node scripts/agent-check.mjs --base http://127.0.0.1:3005
 */
import http from 'node:http'
const member = {
  _id: 'm1',
  fullName: 'Jason Desiderio',
  slug: { current: 'jason-desiderio' },
  roles: ['Engineer'],
  startDate: '2022-11-01',
  memberNumber: 1,
  profilePicture: {
    _type: 'image',
    caption: 'Jason',
    asset: {
      extension: 'jpg',
      url: 'https://example.convex.cloud/api/storage/x.jpg',
      metadata: {
        lqip: 'data:image/jpeg;base64,/9j/4AAQ',
        dimensions: { aspectRatio: 1, height: 100, width: 100 },
      },
    },
  },
  hoverProfilePicture: {
    _type: 'image',
    caption: 'Jason',
    asset: {
      extension: 'jpg',
      url: 'https://example.convex.cloud/api/storage/x.jpg',
      metadata: {
        lqip: 'data:image/jpeg;base64,/9j/4AAQ',
        dimensions: { aspectRatio: 1, height: 100, width: 100 },
      },
    },
  },
}
const project = {
  _id: 'p1',
  _updatedAt: '2025-01-01',
  title: 'Sluggish EP1',
  clientName: 'Sluggish',
  slug: { current: 'sluggish-ep1' },
  seoDescription: 'A four-track EP recorded at the clubhouse.',
  type: 'Audio',
  status: 'Completed',
  mainLink: 'https://example.com',
  dateStarted: '2024-03-03',
  dateCompleted: '2024-06-09',
  mainMedia: [
    {
      _type: 'image',
      caption: 'Cover',
      asset: {
        extension: 'jpg',
        url: 'https://example.convex.cloud/api/storage/c.jpg',
        metadata: {
          lqip: 'data:image/jpeg;base64,/9j/4AAQ',
          dimensions: { aspectRatio: 1, height: 100, width: 100 },
        },
      },
    },
  ],
  summary: [
    {
      _type: 'block',
      _key: 's',
      style: 'normal',
      children: [
        { _type: 'span', text: 'Recorded at the clubhouse.', marks: [] },
      ],
      markDefs: [],
    },
  ],
  overview: [
    {
      _type: 'block',
      _key: 'o',
      style: 'normal',
      children: [{ _type: 'span', text: 'Overview text.', marks: [] }],
      markDefs: [],
    },
  ],
  photoGallery: [],
  caseStudy: [],
  membersInvolved: [member],
}
const answers = {
  'members:bySlugs': () => [member],
  'members:bySlug': a => (a?.slug === 'jason-desiderio' ? member : null),
  'members:forSitemap': () => [
    { slug: { current: 'jason-desiderio' }, _updatedAt: '2025-01-01' },
  ],
  'projects:forSitemap': () => [
    { slug: { current: 'sluggish-ep1' }, _updatedAt: '2025-01-01' },
  ],
  'projects:listPage': () => ({
    members: [
      {
        _id: 'm1',
        fullName: member.fullName,
        slug: member.slug,
        profilePicture: {
          asset: { url: member.profilePicture.asset.url, metadata: {} },
        },
      },
    ],
    projects: [
      { ...project, memberIds: ['m1'], mainImage: project.mainMedia[0] },
    ],
  }),
  'projects:bySlug': a => (a?.slug === 'sluggish-ep1' ? project : null),
  'projects:byMemberId': () => [project],
}
http
  .createServer((req, res) => {
    let body = ''
    req.on('data', c => (body += c))
    req.on('end', () => {
      let payload = {}
      try {
        payload = JSON.parse(body || '{}')
      } catch {}
      const fn = answers[payload.path]
      const value = fn
        ? fn(Array.isArray(payload.args) ? payload.args[0] : payload.args)
        : null
      console.log('stub', req.method, req.url, payload.path)
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ status: 'success', value, logLines: [] }))
    })
  })
  .listen(3999, () => console.log('convex stub on :3999'))
