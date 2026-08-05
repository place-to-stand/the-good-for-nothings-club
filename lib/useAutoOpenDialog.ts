'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Controlled-dialog open state that also opens itself on load when the URL
 * has ?inquire=<autoOpenId>. Lets us hand out deep links that land with a
 * specific form already open, e.g. /services?inquire=photo-booth.
 *
 * Scrolls the matching card (element with id === autoOpenId) into view so
 * the page is in the right place when the dialog closes.
 */
export function useAutoOpenDialog(
  autoOpenId: string | undefined,
  onAutoOpen: () => void
) {
  const [open, setOpen] = useState(false)
  // Latest-ref so an inline callback doesn't retrigger the effect.
  const onAutoOpenRef = useRef(onAutoOpen)
  useEffect(() => {
    onAutoOpenRef.current = onAutoOpen
  })

  useEffect(() => {
    if (!autoOpenId) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('inquire') !== autoOpenId) return
    document
      .getElementById(autoOpenId)
      ?.scrollIntoView({ block: 'center', behavior: 'instant' })
    // Must start closed for hydration, then sync from the URL on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true)
    onAutoOpenRef.current()
  }, [autoOpenId])

  return [open, setOpen] as const
}
