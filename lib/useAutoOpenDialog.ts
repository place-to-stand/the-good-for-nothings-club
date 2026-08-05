'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Controlled-dialog open state synced with a ?inquire=<autoOpenId> URL param
 * in both directions:
 *
 * - Landing with the param opens the dialog on load, so deep links like
 *   /services?inquire=photo-booth go straight to a form.
 * - Opening the dialog writes the param into the address bar (and closing
 *   removes it), so copying the URL with a form open IS the deep link.
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

  // replaceState (not pushState) keeps the back button leaving the page
  // instead of replaying modal opens; Next's router syncs with it natively.
  const setOpenAndSyncUrl = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen)
      if (!autoOpenId) return
      const url = new URL(window.location.href)
      if (nextOpen) {
        url.searchParams.set('inquire', autoOpenId)
      } else if (url.searchParams.get('inquire') === autoOpenId) {
        url.searchParams.delete('inquire')
      } else {
        return
      }
      window.history.replaceState(window.history.state, '', url)
    },
    [autoOpenId]
  )

  return [open, setOpenAndSyncUrl] as const
}
