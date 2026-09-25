import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

import AdminNav from '@/components/admin/AdminNav'
import AdminProviders from '@/components/admin/AdminProviders'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

/**
 * Full-screen app shell, outside the (site) route group so none of the
 * marketing Header, Footer, or page-width card applies. On desktop the
 * shell is exactly one viewport tall: the sidebar stays put and the main
 * column scrolls on its own. On mobile it falls back to normal document
 * scrolling under a sticky nav bar.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <AdminProviders>
        <div className='bg-background flex min-h-dvh flex-col md:h-dvh md:flex-row'>
          <AdminNav />
          <main className='min-w-0 flex-1 px-4 py-6 md:overflow-y-auto md:px-8 md:py-8'>
            {children}
          </main>
        </div>
      </AdminProviders>
    </ConvexAuthNextjsServerProvider>
  )
}
