/**
 * The clubhouse. The street address is public (it's on the Google
 * Business Profile), so it can appear anywhere on the site.
 */
export const clubhouse = {
  street: '1800 W Koenig Ln',
  city: 'Austin',
  state: 'TX',
  zip: '78756',
  /** Rooftop coordinates for the building, used to center the contact map. */
  geo: { lat: 30.33319, lng: -97.73581 },
} as const

export const clubhouseAddressLine = `${clubhouse.street}, ${clubhouse.city}, ${clubhouse.state} ${clubhouse.zip}`

/** Google Maps link for directions; resolves to the GBP listing. */
export const clubhouseMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `The Good for Nothings Club, ${clubhouseAddressLine}`
)}`
