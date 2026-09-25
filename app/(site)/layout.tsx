import type { ReactNode } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'

/**
 * Marketing-site chrome. The route group keeps Header and Footer off
 * /admin, which renders its own full-screen app shell instead.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
