import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import type { Metadata } from 'next'
import { ReactNode } from 'react'

import AdminNav from '@/components/admin/AdminNav'
import AdminProviders from '@/components/admin/AdminProviders'

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthNextjsServerProvider>
      <AdminProviders>
        <main className='mx-auto w-full max-w-6xl px-4 py-10 md:px-8'>
          <h1 className='mb-6 font-sans text-2xl font-bold uppercase tracking-[2px]'>
            GFNC Admin
          </h1>
          <AdminNav />
          <div className='py-8'>{children}</div>
        </main>
      </AdminProviders>
    </ConvexAuthNextjsServerProvider>
  )
}
