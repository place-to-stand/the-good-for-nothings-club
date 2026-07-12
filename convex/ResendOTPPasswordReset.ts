import Resend from '@auth/core/providers/resend'
import { Resend as ResendAPI } from 'resend'

/**
 * Emails an 8-digit code for the admin forgot-password flow (the `reset`
 * option on the Password provider in convex/auth.ts). Runs inside Convex,
 * so RESEND_API_KEY must be set on the Convex deployment (dev and prod) —
 * separate from the Vercel env var of the same name.
 */
export const ResendOTPPasswordReset = Resend({
  id: 'resend-otp-password-reset',
  apiKey: process.env.RESEND_API_KEY,
  async generateVerificationToken() {
    const random = new Uint32Array(1)
    crypto.getRandomValues(random)
    return String(random[0] % 100_000_000).padStart(8, '0')
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey)
    const { error } = await resend.emails.send({
      from: 'GFNC Admin <no-reply@updates.thegoodfornothings.club>',
      to: [email],
      subject: 'Reset your GFNC admin password',
      text: [
        `Your password reset code is: ${token}`,
        '',
        'Enter it on the admin sign-in page along with your new password.',
        "If you didn't request this, you can ignore this email.",
      ].join('\n'),
    })
    if (error) {
      throw new Error('Could not send the password reset email')
    }
  },
})
