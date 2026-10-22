import type { Metadata } from 'next'

import SiteNotFound, { type NotFoundTile } from '@/components/SiteNotFound'
import { homeOffering } from '@/data/home'
import { SHOP_PATH } from '@/data/site'
import { SITE_PAGES } from '@/lib/markdown/site'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

/**
 * HTML 404 (Next sends a real 404 status). Big number, one line, two
 * buttons, and a grid of doors: every section as a tile whose
 * description opens under the title on hover or keyboard focus (always
 * open on touch screens, which cannot hover). Copy comes from
 * data/site.ts; the tiles read SITE_PAGES (PAGE_META) plus the shop card
 * from the homepage, so the markdown 404 in lib/markdown/site.ts lists
 * the same places.
 */
const shop = homeOffering.find(card => card.href === SHOP_PATH)

const tiles: NotFoundTile[] = [
  ...SITE_PAGES.filter(page => page.path !== '/').map(page => ({
    href: page.path,
    title: page.title,
    description: page.description,
    external: false,
  })),
  ...(shop
    ? [
        {
          href: shop.href,
          title: shop.title,
          description: shop.body,
          external: false,
        },
      ]
    : []),
]

export default function NotFound() {
  return <SiteNotFound tiles={tiles} />
}
