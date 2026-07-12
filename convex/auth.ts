import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'

import { ResendOTPPasswordReset } from './ResendOTPPasswordReset'

/**
 * Email+password sign-in for the read-only /admin, with an emailed-code
 * forgot-password flow. There is no open sign-up: account creation is
 * limited to the ADMIN_ALLOWED_EMAILS deployment env var (comma-separated)
 * and has no UI — seed a new admin with a one-off signUp action call
 * (see docs/SANITY_TO_CONVEX_MIGRATION.md), then they set their own
 * password via "Forgot password" on /admin/login.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ reset: ResendOTPPasswordReset })],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId
      }
      const allowed = (process.env.ADMIN_ALLOWED_EMAILS ?? '')
        .split(',')
        .map(email => email.trim().toLowerCase())
        .filter(Boolean)
      const email = typeof args.profile.email === 'string' ? args.profile.email.toLowerCase() : ''
      if (!email || !allowed.includes(email)) {
        throw new Error('Sign-up is disabled')
      }
      return ctx.db.insert('users', { email })
    },
  },
})
