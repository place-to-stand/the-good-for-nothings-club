'use client'

import { useAuthActions } from '@convex-dev/auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { fieldLabelClassName } from '@/components/ui/fieldStyles'

type Mode = 'signIn' | 'forgotPassword' | 'resetPassword'

/**
 * Sign-in for the read-only admin. There is no sign-up UI — accounts are
 * seeded for allowlisted emails only (see convex/auth.ts). "Forgot
 * password" emails an 8-digit code, which is entered here with a new
 * password ('reset' → 'reset-verification' flows on the Password provider).
 */
export default function AdminLoginPage() {
  const { signIn } = useAuthActions()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signIn')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const run = async (action: () => Promise<void>, failureMessage: string) => {
    setError(null)
    setSubmitting(true)
    try {
      await action()
    } catch {
      setError(failureMessage)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='mx-auto max-w-sm py-8 md:py-12'>
      <h2 className='mb-6 text-center text-[28px] font-black tracking-[-0.03em]'>
        {mode === 'signIn' ? 'Sign in' : 'Reset password'}
      </h2>

      {mode === 'signIn' && (
        <form
          onSubmit={event => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            run(async () => {
              formData.set('flow', 'signIn')
              await signIn('password', formData)
              router.push('/admin')
            }, 'Invalid email or password.')
          }}
          className='flex flex-col gap-4'
        >
          <label className='flex flex-col gap-1'>
            <span className={fieldLabelClassName}>Email</span>
            <Input
              name='email'
              type='email'
              autoComplete='email'
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </label>
          <label className='flex flex-col gap-1'>
            <span className={fieldLabelClassName}>Password</span>
            <Input
              name='password'
              type='password'
              autoComplete='current-password'
              required
            />
          </label>
          {error && <p className='font-sans text-sm text-red-600'>{error}</p>}
          <Button type='submit' disabled={submitting}>
            Sign in
          </Button>
          <button
            type='button'
            onClick={() => {
              setError(null)
              setMode('forgotPassword')
            }}
            className='font-sans text-sm text-black/60 underline-offset-2 hover:text-black hover:underline'
          >
            Forgot password?
          </button>
        </form>
      )}

      {mode === 'forgotPassword' && (
        <form
          onSubmit={event => {
            event.preventDefault()
            run(async () => {
              await signIn('password', { email, flow: 'reset' })
              setMode('resetPassword')
            }, 'Could not send a reset code to that email.')
          }}
          className='flex flex-col gap-4'
        >
          <p className='font-sans text-sm text-black/70'>
            Enter your email and we&apos;ll send you an 8-digit reset code.
          </p>
          <label className='flex flex-col gap-1'>
            <span className={fieldLabelClassName}>Email</span>
            <Input
              name='email'
              type='email'
              autoComplete='email'
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </label>
          {error && <p className='font-sans text-sm text-red-600'>{error}</p>}
          <Button type='submit' disabled={submitting}>
            Email me a reset code
          </Button>
          <button
            type='button'
            onClick={() => {
              setError(null)
              setMode('signIn')
            }}
            className='font-sans text-sm text-black/60 underline-offset-2 hover:text-black hover:underline'
          >
            Back to sign in
          </button>
        </form>
      )}

      {mode === 'resetPassword' && (
        <form
          onSubmit={event => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)
            run(async () => {
              await signIn('password', {
                email,
                code: formData.get('code') as string,
                newPassword: formData.get('newPassword') as string,
                flow: 'reset-verification',
              })
              router.push('/admin')
            }, 'Invalid or expired code. Request a new one and try again.')
          }}
          className='flex flex-col gap-4'
        >
          <p className='font-sans text-sm text-black/70'>
            We sent an 8-digit code to {email}. Enter it below with your new
            password.
          </p>
          <label className='flex flex-col gap-1'>
            <span className={fieldLabelClassName}>Reset code</span>
            <Input
              name='code'
              inputMode='numeric'
              autoComplete='one-time-code'
              required
            />
          </label>
          <label className='flex flex-col gap-1'>
            <span className={fieldLabelClassName}>New password</span>
            <Input
              name='newPassword'
              type='password'
              autoComplete='new-password'
              required
            />
          </label>
          {error && <p className='font-sans text-sm text-red-600'>{error}</p>}
          <Button type='submit' disabled={submitting}>
            Set new password & sign in
          </Button>
          <button
            type='button'
            onClick={() => {
              setError(null)
              setMode('forgotPassword')
            }}
            className='font-sans text-sm text-black/60 underline-offset-2 hover:text-black hover:underline'
          >
            Resend code
          </button>
        </form>
      )}
    </div>
  )
}
