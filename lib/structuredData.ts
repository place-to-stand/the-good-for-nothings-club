import type { Occurrence } from '@/data/events'
import { facilities } from '@/data/facilities'
import { clubhouse, clubhouseMapsUrl } from '@/data/location'
import { services } from '@/data/services'
import { SOCIAL_PROFILES } from '@/data/social'

/**
 * schema.org JSON-LD builders. LocalBusiness renders on every page
 * (app/layout.tsx); Event objects render on /events. Together they tie
 * the site to the Google Business Profile and make the recurring events
 * eligible for Google's event rich results.
 */

import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from '@/data/site'

/** Stable id so other nodes (WebSite, Event organizer) point at one entity. */
const ORGANIZATION_ID = `${SITE_URL}/#organization`

const austin = { '@type': 'City', name: 'Austin, TX' }

/**
 * What the club sells, as schema.org Offers. Search engines and AI
 * assistants read this to match "photo studio rental Austin" or "music
 * video production Austin" to the club. Built from the same data files as
 * /facilities and /services, so a new room or service shows up here too.
 * No prices: the site quotes on request.
 */
const offers = [
  ...facilities
    .filter(facility => facility.status !== 'planned')
    .map(facility => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: `${facility.name} rental (${facility.model === 'monthly' ? 'monthly' : 'hourly'})`,
        description: facility.description,
        url: `${SITE_URL}/facilities#${facility.slug}`,
        areaServed: austin,
      },
    })),
  ...services.map(service => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      name: service.name,
      description: service.blurb,
      url: `${SITE_URL}/services#${service.slug}`,
      areaServed: austin,
    },
  })),
]

const postalAddress = {
  '@type': 'PostalAddress',
  streetAddress: clubhouse.street,
  addressLocality: clubhouse.city,
  addressRegion: clubhouse.state,
  postalCode: clubhouse.zip,
  addressCountry: 'US',
}

// Matching the Google Business Profile so search engines connect the
// site, the listing, the socials, and the address into one entity.
export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': ORGANIZATION_ID,
  name: SITE_NAME,
  // Look-alike names exist (goodfornothing.com, a clothing brand, films);
  // the short forms plus the address keep this entity apart from them.
  alternateName: ['Good for Nothings Club', 'GFNC'],
  slogan: 'Good for nothings. Making everything.',
  description:
    'A creators club in Austin, TX made up of musicians, photographers, writers, filmmakers, and engineers. The clubhouse puts studios, rehearsal rooms, and workspace under one roof.',
  url: SITE_URL,
  email: CONTACT_EMAIL,
  // contactPoint + address together let assistants answer "how do I reach
  // them" and check the business is real before recommending it.
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: CONTACT_EMAIL,
    url: `${SITE_URL}/contact`,
    availableLanguage: 'English',
    areaServed: 'US',
  },
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/opengraph-image.png`,
  sameAs: SOCIAL_PROFILES.map(profile => profile.href),
  address: postalAddress,
  hasMap: clubhouseMapsUrl,
  areaServed: austin,
  knowsAbout: [
    'Photography',
    'Video production',
    'Music production',
    'Band rehearsal space',
    'Photo studio rental',
    'Zines',
    'Event production',
    'Creative coworking',
  ],
  makesOffer: offers,
  geo: {
    '@type': 'GeoCoordinates',
    latitude: clubhouse.geo.lat,
    longitude: clubhouse.geo.lng,
  },
}

/** The site itself, tied to the business above (renders on every page). */
export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  alternateName: ['Good for Nothings Club', 'GFNC'],
  publisher: { '@id': ORGANIZATION_ID },
  inLanguage: 'en-US',
}

/** "7 PM" → 19; minutes tolerated ("7:30 PM" → hour 19, minute 30). */
function parseTime(time: string): { hour: number; minute: number } {
  const match = time.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i)
  if (!match) return { hour: 19, minute: 0 }
  let hour = parseInt(match[1], 10) % 12
  if (match[3].toUpperCase() === 'PM') hour += 12
  return { hour, minute: match[2] ? parseInt(match[2], 10) : 0 }
}

/** UTC offset suffix for Austin on a given date, e.g. "-05:00" (handles DST). */
function centralOffset(isoDate: string): string {
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    timeZoneName: 'longOffset',
  })
    .formatToParts(new Date(`${isoDate}T12:00:00Z`))
    .find(part => part.type === 'timeZoneName')?.value
  return label?.replace('GMT', '') || '-06:00'
}

/** One schema.org Event per computed occurrence. */
export function eventsJsonLd(occurrences: Occurrence[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': occurrences.map(({ event, date }) => {
      const { hour, minute } = parseTime(event.time)
      const pad = (n: number) => String(n).padStart(2, '0')
      return {
        '@type': 'Event',
        name: event.name,
        description: event.blurb,
        startDate: `${date}T${pad(hour)}:${pad(minute)}:00${centralOffset(date)}`,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        isAccessibleForFree: true,
        url: `${SITE_URL}/events#${event.slug}`,
        image: `${SITE_URL}/opengraph-image.png`,
        location: {
          '@type': 'Place',
          name: 'GFNC Clubhouse',
          address: postalAddress,
        },
        organizer: {
          '@type': 'Organization',
          '@id': ORGANIZATION_ID,
          name: SITE_NAME,
          url: SITE_URL,
        },
      }
    }),
  }
}
