import { NextRequest, NextResponse } from 'next/server'

import { predictiveSearch } from '@/lib/shopify'

/** Search-as-you-type for the shop bar: GET /api/shop/suggest?q=hat */
export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get('q') ?? '').slice(0, 100)

  try {
    const results = await predictiveSearch(query)
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('shop suggest failed', error)
    return NextResponse.json(
      { queries: [], products: [], collections: [] },
      { status: 502 }
    )
  }
}
