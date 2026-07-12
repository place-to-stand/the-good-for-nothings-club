'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fieldLabelClassName } from '@/components/ui/fieldStyles'

/**
 * Sign-in for the read-only admin. "First sign-in" runs the signUp flow to
 * set a password, but account creation only succeeds for emails on the
 * ADMIN_ALLOWED_EMAILS allowlist (enforced in convex/auth.ts) — there is no
 * open registration.
 */
export default function AdminLoginPage() {
  const { signIn } = useAuthActions()
  const router = useRouter()
  const [flow, setFlow] = useState<'signIn' | 'signUp'>('signIn')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  return (
    <div className='mx-auto max-w-sm py-8 md:py-12'>
      <h2 className='mb-6 text-center text-[28px] font-black tracking-[-0.03em]'>
        Sign in
      </h2>
      <form
        onSubmit={async event => {
          event.preventDefault()
          setError(null)
          setSubmitting(true)
          const formData = new FormData(event.currentTarget)
          formData.set('flow', flow)
          try {
            await signIn('password', formData)
            router.push('/admin')
          } catch {
            setError(
              flow === 'signIn'
                ? 'Invalid email or password.'
                : 'Could not create the account. Only pre-approved emails can be used.'
            )
            setSubmitting(false)
          }
        }}
        className='flex flex-col gap-4'
      >
        <label className='flex flex-col gap-1'>
          <span className={fieldLabelClassName}>Email</span>
          <Input name='email' type='email' autoComplete='email' required />
        </label>
        <label className='flex flex-col gap-1'>
          <span className={fieldLabelClassName}>Password</span>
          <Input
            name='password'
            type='password'
            autoComplete={flow === 'signIn' ? 'current-password' : 'new-password'}
            required
          />
        </label>
        {error && <p className='font-sans text-sm text-red-600'>{error}</p>}
        <Button type='submit' disabled={submitting}>
          {flow === 'signIn' ? 'Sign in' : 'Set password & sign in'}
        </Button>
        <button
          type='button'
          onClick={() => setFlow(flow === 'signIn' ? 'signUp' : 'signIn')}
          className='font-sans text-sm text-black/60 underline-offset-2 hover:text-black hover:underline'
        >
          {flow === 'signIn' ? 'First sign-in? Set your password' : 'Already have a password? Sign in'}
        </button>
      </form>
    </div>
  )
}
