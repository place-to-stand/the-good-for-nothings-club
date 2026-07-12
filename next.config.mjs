import { withSentryConfig } from '@sentry/nextjs'
/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    // Every width used via getImageUrl(...).width(n) must appear here, and
    // every quality(q) in images.qualities — Next rejects others.
    deviceSizes: [
      400, 640, 750, 800, 828, 1080, 1200, 1400, 1600, 1920, 2000, 2048, 2400,
      3840,
    ],
    qualities: [75, 90],
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'the-good-for-nothings-club',
  project: 'the-good-for-nothings-club',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
