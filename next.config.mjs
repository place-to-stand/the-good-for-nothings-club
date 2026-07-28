import { withBotId } from 'botid/next/config'
/** @type {import('next').NextConfig} */

const nextConfig = {
  // PostHog's ingestion endpoints use trailing slashes (e.g. /e/); Next's
  // default trailing-slash redirect would 308 them and break capture.
  skipTrailingSlashRedirect: true,

  images: {
    // Page content maxes out at --page-max-width (1440px), so nothing ever
    // renders wider than 1440 CSS px. Dropping the default 2048/3840 rungs
    // keeps the optimizer from serving multi-MB variants nothing can use.
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.convex.cloud',
        port: '',
        pathname: '/api/storage/**',
      },
      {
        protocol: 'https',
        hostname: 'behold.pictures',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn2.behold.pictures',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Reverse proxy for PostHog so analytics requests are first-party and
  // survive ad blockers. The
  // path is deliberately not "/analytics"-ish — blockers target those.
  // Keep in sync with api_host in instrumentation-client.ts.
  async rewrites() {
    return [
      {
        source: '/nothings/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/nothings/array/:path*',
        destination: 'https://us-assets.i.posthog.com/array/:path*',
      },
      {
        source: '/nothings/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },

  // https://nextjs.org/docs/app/api-reference/next-config-js/redirects
  // migration from webflow
  async redirects() {
    return [
      {
        source: '/projects/almost-automatic-good-looks-cover-no-way-no-how',
        destination:
          '/projects/no-way-no-how-almost-automatic-good-looks-cover',
        permanent: true,
      },
      {
        source: '/projects/blue-by-you-turnstile-cover-sluggish',
        destination: '/projects/sluggish-blue-by-you-turnstile-cover',
        permanent: true,
      },
      {
        source: '/projects/braid-frame-canvas-25th-anniversary-tour',
        destination: '/projects/braid-frame-and-canvas-25th-anniversary-tour',
        permanent: true,
      },
      {
        source: '/projects/brian-tell-the-lovemakers-studio-weekend',
        destination: '/projects/the-loveshakers-studio-weekend',
        permanent: true,
      },
      {
        source: '/projects/ep1-sluggish',
        destination: '/projects/sluggish-ep1',
        permanent: true,
      },
      {
        source: '/projects/ep2-sluggish',
        destination: '/projects/sluggish-ep2',
        permanent: true,
      },
      {
        source: '/projects/ep3-sluggish',
        destination: '/projects/sluggish-ep3',
        permanent: true,
      },
      {
        source: '/projects/ep4-sluggish',
        destination: '/projects/sluggish-ep4',
        permanent: true,
      },
      {
        source: '/projects/heatonist',
        destination: '/projects/heatonist-store-development-and-maintenance',
        permanent: true,
      },
      {
        source: '/projects/is-weed-legal-here',
        destination:
          '/projects/is-weed-legal-here-global-cannabis-legality-tracker',
        permanent: true,
      },
      {
        source: '/projects/laundry-day',
        destination: '/projects/chris-donahue-laundry-day',
        permanent: true,
      },
      {
        source: '/projects/lifepacks-mvp',
        destination: '/projects/lifepacks-community-created-product-guides',
        permanent: true,
      },
      {
        source: '/projects/michael-michael-motorcycle-sluggish',
        destination: '/projects/sluggish-michael-michael-motorcycle',
        permanent: true,
      },
      {
        source: '/projects/stand-out-single-brian-tell-the-lovemakers',
        destination: '/projects/the-loveshakers-stand-out-single',
        permanent: true,
      },
      {
        source: '/projects/teaser-video-for-stand-out-single-release',
        destination: '/projects/the-loveshakers-stand-out-teaser-video',
        permanent: true,
      },
      {
        source: '/projects/the-original-invisible-skateboards',
        destination:
          '/projects/chris-donahue-the-original-invisible-skateboards',
        permanent: true,
      },
      {
        source: '/projects/uncle-chip',
        destination: '/projects/chris-donahue-uncle-chip',
        permanent: true,
      },
      {
        source: '/projects/warm-weather-woman-single-brian-tell-the-lovemakers',
        destination: '/projects/the-loveshakers-warm-weather-woman-single',
        permanent: true,
      },
      {
        source: '/projects/watching-the-news-single-brian-tell-the-lovemakers',
        destination: '/projects/the-loveshakers-watching-the-news-single',
        permanent: true,
      },
    ]
  },
}

export default withBotId(nextConfig)
