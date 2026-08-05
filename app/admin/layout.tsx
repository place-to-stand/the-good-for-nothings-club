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
 * Admin frame: the same bordered card as PageShell, minus the display
 * title (which spent a screenful of space saying "Admin"), with the nav
 * as a left sidebar so the content column reads like a tool, not a page.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main>
      <ConvexAuthNextjsServerProvider>
        <AdminProviders>
          {/* No bottom padding: the footer's own pt provides the gap, same as PageShell pages. */}
          <section className='pt-8 md:px-8 md:pt-16 xl:px-16'>
            <div className='bg-background mx-auto max-w-(--page-max-width) border-y-2 border-black md:flex md:items-stretch md:border-x-2'>
              <AdminNav />
              <div className='min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8'>
                {children}
              </div>
            </div>
          </section>
        </AdminProviders>
      </ConvexAuthNextjsServerProvider>
    </main>
  )
}
