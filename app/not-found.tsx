import Footer from '@/components/Footer'
import Header from '@/components/Header'

import SiteNotFound from './(site)/not-found'

export { metadata } from './(site)/not-found'

/**
 * 404 for URLs that match no route at all. Those render under the root
 * layout alone, outside the (site) group, so this wrapper brings the site
 * Header and Footer. A notFound() thrown from a site page is caught inside
 * the (site) layout instead and renders app/(site)/not-found.tsx directly.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <SiteNotFound />
      <Footer />
    </>
  )
}
