'use client'

import { useEffect, useRef } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { captureEvent } from './analytics'

/** True when a value (or any nested value) holds user-entered content. */
function hasContent(value: unknown): boolean {
  if (typeof value === 'string') return value.trim() !== ''
  if (typeof value === 'boolean') return value
  if (Array.isArray(value)) return value.some(hasContent)
  if (value && typeof value === 'object') {
    return Object.values(value).some(hasContent)
  }
  return value != null
}

/**
 * Partial-fill analytics for the public forms: captures `form_started` on the
 * first field change and `form_abandoned` (at most once) when someone leaves
 * without a successful submit. The headline abandonment *rate* comes from the
 * form_started → *_submitted funnel in PostHog - form_abandoned is best-effort
 * diagnostics for *where* people quit (exit events can't be guaranteed for
 * killed tabs).
 *
 * Abandonment fires on pagehide (tab close, external nav), on
 * visibilitychange→hidden (mobile app-switching, where pagehide may never
 * fire), and on unmount (client-side nav, closed dialogs). `hidden` can be a
 * false alarm - someone tabs away and comes back to submit - so exclude
 * sessions that also submitted when reading form_abandoned.
 *
 * Per the analytics conventions, free-text field *values* never leave the
 * browser - that's exactly where half-typed emails and phones would live.
 * `getProperties` may add enumerated choices (selects, radios, checkboxes),
 * and is called at capture time so it always sees current values.
 *
 * `formName` should match the form's submit event, e.g. 'inquiry' for
 * inquiry_submitted.
 */
export function useFormTracking<T extends FieldValues>(
  formName: string,
  form: UseFormReturn<T>,
  getProperties?: () => Record<string, unknown>
): void {
  const startedAt = useRef<number | null>(null)
  const lastField = useRef<string | null>(null)
  const abandonSent = useRef(false)
  const propsRef = useRef(getProperties)

  // Sync after every render so captures use the latest closure.
  useEffect(() => {
    propsRef.current = getProperties
  })

  useEffect(() => {
    const subscription = form.watch((_values, { name }) => {
      // socials.0.handle → socials
      if (name) lastField.current = String(name).split('.')[0]
      if (startedAt.current === null) {
        startedAt.current = Date.now()
        captureEvent('form_started', { form: formName, ...propsRef.current?.() })
      }
    })

    const abandon = (trigger: 'pagehide' | 'hidden' | 'unmounted') => {
      if (startedAt.current === null || abandonSent.current) return
      if (form.formState.isSubmitSuccessful) return
      abandonSent.current = true
      const dirty = form.formState.dirtyFields
      const values: FieldValues = form.getValues()
      captureEvent('form_abandoned', {
        form: formName,
        trigger,
        fields_completed: Object.keys(values).filter(
          key => key in dirty && hasContent(values[key])
        ),
        last_field: lastField.current ?? undefined,
        seconds_elapsed: Math.round((Date.now() - startedAt.current) / 1000),
        submit_attempted: form.formState.submitCount > 0,
        ...propsRef.current?.(),
      })
    }

    const onPageHide = () => abandon('pagehide')
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') abandon('hidden')
    }
    window.addEventListener('pagehide', onPageHide)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('pagehide', onPageHide)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      abandon('unmounted')
    }
  }, [form, formName])
}
