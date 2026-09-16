import { beforeEach, describe, expect, it, vi } from 'vitest'

const fetchQuery = vi.fn()
vi.mock('convex/nextjs', () => ({
  fetchQuery: (...args: unknown[]) => fetchQuery(...args),
}))

import { GET as markdownGET } from '@/app/markdown/[[...path]]/route'
import { GET as llmsGET } from '@/app/llms.txt/route'
import { GET as llmsFullGET } from '@/app/llms-full.txt/route'

const call = (path: string[] | undefined) =>
  markdownGET(new Request('http://localhost/markdown'), {
    params: Promise.resolve(path === undefined ? {} : { path }),
  })

describe('markdown route', () => {
  // clearAllMocks, not mockReset: under vitest 5 a reset mock's rejection
  // surfaces as a test failure even when the code under test catches it.
  beforeEach(() => {
    vi.clearAllMocks()
    fetchQuery.mockResolvedValue(null)
  })

  it('serves static pages as text/markdown with Vary: Accept', async () => {
    const res = await call(undefined)
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
    expect(res.headers.get('vary')).toBe('Accept')
    expect(res.headers.get('content-location')).toBe(
      'https://thegoodfornothings.club/'
    )
    expect((await res.text()).startsWith('# The Good for Nothings Club')).toBe(
      true
    )
    expect(fetchQuery).not.toHaveBeenCalled()

    const privacy = await call(['privacy'])
    expect(privacy.status).toBe(200)
    expect((await privacy.text()).startsWith('# Privacy')).toBe(true)
  })

  it('returns a markdown 404 for unknown paths without touching Convex', async () => {
    const res = await call(['some-path-that-does-not-exist'])
    expect(res.status).toBe(404)
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
    const body = await res.text()
    expect(body).toContain('# 404: Page not found')
    expect(body).toContain('`/some-path-that-does-not-exist`')
    expect(body).toContain('/llms.txt')
    expect(fetchQuery).not.toHaveBeenCalled()
  })

  it('404s an unknown project or member slug', async () => {
    fetchQuery.mockResolvedValue(null)
    expect((await call(['projects', 'nope'])).status).toBe(404)
    expect((await call(['members', 'nope'])).status).toBe(404)
    expect(fetchQuery).toHaveBeenCalledTimes(2)
  })

  it('renders the about page with members from Convex', async () => {
    fetchQuery.mockResolvedValue([
      {
        _id: '1',
        fullName: 'Jason Desiderio',
        slug: { current: 'jason-desiderio' },
      },
      { _id: '2', fullName: 'Eric Fenny', slug: { current: 'eric-fenny' } },
    ])
    const res = await call(['about'])
    const body = await res.text()
    expect(res.status).toBe(200)
    expect(body).toContain(
      '- [Jason Desiderio](https://thegoodfornothings.club/members/jason-desiderio)'
    )
    expect(body).toContain('## Past Members')
  })

  it('answers 503 markdown when Convex is unreachable', async () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    fetchQuery.mockImplementation(async () => {
      throw new Error('boom')
    })
    const res = await call(['projects'])
    expect(quiet).toHaveBeenCalledOnce()
    quiet.mockRestore()
    expect(res.status).toBe(503)
    expect(res.headers.get('retry-after')).toBe('60')
    expect(await res.text()).toContain('# 503')
  })
})

describe('llms routes', () => {
  it('serve markdown', async () => {
    const res = llmsGET()
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8')
    expect((await res.text()).startsWith('# The Good for Nothings Club')).toBe(
      true
    )

    const full = llmsFullGET()
    const body = await full.text()
    expect(body).toContain('## When to use this site')
    expect(body).toContain('# Facilities')
    expect(body).toContain('# Privacy')
  })
})
