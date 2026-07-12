import { Password } from '@convex-dev/auth/providers/Password'
import { convexAuth } from '@convex-dev/auth/server'

/**
 * Email+password sign-in for the read-only /admin. There is no open
 * sign-up: account creation is limited to the ADMIN_ALLOWED_EMAILS
 * deployment env var (comma-separated). Everyone else — including valid
 * emails not on the list — is rejected before a user row is created.
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
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
