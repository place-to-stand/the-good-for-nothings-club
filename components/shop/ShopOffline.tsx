import { CONTACT_EMAIL } from '@/data/site'
import { shopCopy } from '@/data/shop'

/** Shown in place of products when Shopify isn't set up for this deploy. */
export default function ShopOffline() {
  return (
    <p className='mx-auto max-w-xl py-16 text-center font-serif text-2xl'>
      {shopCopy.offline}{' '}
      <a href={`mailto:${CONTACT_EMAIL}`} className='underline'>
        {CONTACT_EMAIL}
      </a>
    </p>
  )
}
