import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

import AdminNav from '@/components/admin/AdminNav'
import AdminProviders from '@/components/admin/AdminProviders'
import PageShell from '@/components/PageShell'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <AdminProviders>
        <PageShell title='Admin'>
          <AdminNav />
          <div className='pt-8 pb-6 md:pb-8'>{children}</div>
        </PageShell>
      </AdminProviders>
    </ConvexAuthNextjsServerProvider>
  )
}
