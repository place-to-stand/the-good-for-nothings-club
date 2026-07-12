import { fetchQuery } from 'convex/nextjs'
import { NextResponse } from 'next/server'

import { api } from '@/convex/_generated/api'

export const revalidate = 300

type UpcomingEventResponse = {
  event:
    | null
    | {
        id: string
        title: string
        clientName: string
        slug: string
        mainLink?: string | null
        date: string
        summary: string
        image?: {
          url: string
          width: number
          height: number
          lqip?: string
          caption?: string
        }
        projectUrl: string
        ctaUrl: string
      }
}

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10)

    const event = await fetchQuery(api.projects.upcomingEvent, { today })

    const headers = {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    }

    if (!event) {
      return NextResponse.json<UpcomingEventResponse>(
        { event: null },
        { headers }
      )
    }

    const projectUrl = `/projects/${event.slug}`
    const normalizedMainLink =
      typeof event.mainLink === 'string' ? event.mainLink.trim() : ''
    const ctaUrl =
      normalizedMainLink.length > 0 ? normalizedMainLink : projectUrl

    return NextResponse.json<UpcomingEventResponse>(
      {
        event: {
          ...event,
          projectUrl,
          ctaUrl,
        },
      },
      { headers }
    )
  } catch (error) {
    console.error('Upcoming event error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming event' },
      { status: 500 }
    )
  }
}
