'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'

import { Button } from '@/components/ui/Button'

/**
 * Admin-scoped error boundary. Without one, anything that throws under
 * /admin — most likely a Convex query rejecting because the session lapsed
 * mid-render — escapes to app/global-error.tsx, which throws away the root
 * layout and repaints the whole document as an unstyled "Something went
 * wrong!". Catching it here keeps the failure inside the admin shell, keeps
 * the sidebar intact, and leaves a way back to the login page.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (posthog.__loaded) posthog.captureException(error)
  }, [error])

  return (
    <div className='mx-auto max-w-sm py-8 text-center md:py-12'>
      <h2 className='mb-2 text-[28px] font-black tracking-[-0.03em]'>
        Something went wrong
      </h2>
      <p className='mb-6 font-sans text-sm text-black/70'>
        The admin hit an error loading this page. If you have been away a
        while, your session may have lapsed — sign in again.
      </p>
      <div className='flex flex-col gap-3'>
        <Button type='button' onClick={reset}>
          Try again
        </Button>
        <a
          href='/admin/login'
          className='font-sans text-sm text-black/60 underline-offset-2 hover:text-black hover:underline'
        >
          Back to sign in
        </a>
      </div>
    </div>
  )
}
