'use client'

import { useEffect } from 'react'

import { captureAttribution } from '@/lib/attribution'

/** Records first-touch attribution on the visitor's first page view. */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttribution()
  }, [])

  return null
}
