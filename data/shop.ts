/**
 * Shop copy. Products, prices and collections come from Shopify
 * (lib/shopify); only the words around them live here.
 */
export const shopCopy = {
  title: 'Shop',
  lead: 'Oddball goods from restless minds. New drops appear whenever inspiration (or boredom) strikes.',
  featuredTitle: 'Bestsellers',
  /** Collection whose products fill the shop home grid. */
  featuredCollection: 'bestsellers',
  collectionsTitle: 'Collections',
  justDropped: 'Just dropped',
  newTitle: 'New arrivals',
  shopIt: 'Shop it',
  seeAll: 'See all',
  shopAll: 'Shop all',
  offline:
    'The shop is taking a nap. Check back soon, or email us about anything you saw.',
  search: {
    title: 'Search',
    empty: 'Type something in the search box above.',
    searching: 'Searching…',
    noResults: 'Nothing matched. Try a shorter word, or browse everything.',
  },
  noMatches: 'Nothing here matches. Try another filter.',
  cart: {
    title: 'Cart',
    empty: 'Your cart is empty.',
    keepShopping: 'Keep shopping',
    subtotal: 'Subtotal',
    shippingNote: 'Shipping and taxes are worked out at checkout.',
    checkout: 'Check out',
  },
}

/** Collections that are lists, not makers: kept out of the collection tiles. */
export const HIDDEN_COLLECTION_TILES = ['bestsellers', 'frontpage']

export const SHOP_META = {
  searchTitle: 'Shop Zines, Tees & Prints from Austin',
  description:
    'Zines, tees, hats and photo prints from members and friends of The Good for Nothings Club, an Austin, TX creators club. New drops whenever.',
}
