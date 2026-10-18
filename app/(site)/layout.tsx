import type { ReactNode } from 'react'

import Footer from '@/components/Footer'
import Header from '@/components/Header'
import CartDrawer from '@/components/shop/CartDrawer'
import CartProvider from '@/components/shop/CartProvider'
import { copyrightYear } from '@/lib/copyrightYear'

// Floor for every public route: the App Shell and per-link prefetches must
// come from static output. Pages that are fully static set the stricter
// 'navigation' themselves, which also fails the build if a change ever
// adds request-time work to them.
export const ensureStatic = 'prefetch'

/**
 * Marketing-site chrome. The route group keeps Header and Footer off
 * /admin, which renders its own full-screen app shell instead.
 */
export default async function SiteLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <CartProvider>
      <Header />
      {children}
      <Footer year={await copyrightYear()} />
      <CartDrawer />
    </CartProvider>
  )
}
