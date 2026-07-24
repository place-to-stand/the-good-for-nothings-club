import type { Occurrence } from '@/data/events'
import { clubhouse } from '@/data/location'
import { SOCIAL_LINKS } from '@/components/SocialMediaLinks'

/**
 * schema.org JSON-LD builders. LocalBusiness renders on every page
 * (app/layout.tsx); Event objects render on /events. Together they tie
 * the site to the Google Business Profile and make the recurring events
 * eligible for Google's event rich results.
 */

const SITE_URL = 'https://www.thegoodfornothings.club'

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
  name: 'The Good for Nothings Club',
  description:
    'A creators club in Austin, TX made up of musicians, photographers, writers, filmmakers, and engineers. The clubhouse puts studios, rehearsal rooms, and workspace under one roof.',
  url: SITE_URL,
  email: 'hello@thegoodfornothings.club',
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/opengraph-image.png`,
  sameAs: SOCIAL_LINKS.map(link => link.href),
  address: postalAddress,
  geo: {
    '@type': 'GeoCoordinates',
    latitude: clubhouse.geo.lat,
    longitude: clubhouse.geo.lng,
  },
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
          name: 'The Good for Nothings Club',
          url: SITE_URL,
        },
      }
    }),
  }
}
