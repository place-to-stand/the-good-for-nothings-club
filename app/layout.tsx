import type { Metadata } from 'next'
import { alegreya, rubik, rubikGlitch } from '../styles/fonts'
import { cn } from '@/lib/utils'
import { localBusinessJsonLd, websiteJsonLd } from '@/lib/structuredData'
import { PAGE_META, TITLE_SUFFIX } from '@/data/site'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

import '../styles/globals.css'
import AttributionCapture from '@/components/AttributionCapture'
import { GoogleAnalytics } from '@next/third-parties/google'

export async function generateMetadata(): Promise<Metadata> {
  const pathname = '/'

  return {
    title: {
      template: `%s${TITLE_SUFFIX}`,
      default: PAGE_META['/'].searchTitle,
    },
    description: PAGE_META['/'].description,
    referrer: 'origin-when-cross-origin',
    keywords: [
      'creator',
      'creators',
      'club',
      'creators club',
      'Austin',
      'ATX',
      'designer',
      'designers',
      'engineer',
      'engineers',
      'photographer',
      'photographers',
      'filmmaker',
      'filmmakers',
      'musician',
      'musicians',
      'writer',
      'writers',
      'good for nothings',
      'making everything',
      'collaboration',
      'web',
      'app',
      'website',
      'video',
      'films',
      'photo',
      'photos',
      'photography',
      'audio',
      'music',
      'songs',
    ],
    creator: 'The Good for Nothings Club',
    metadataBase: new URL('https://thegoodfornothings.club'),
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      url: pathname,
      type: 'website',
      locale: 'en_US',
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      className={cn(alegreya.variable, rubik.variable, rubikGlitch.variable)}
    >
      <body>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <AttributionCapture />
        {children}
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId='G-RK8DQY3F32' />
      </body>
    </html>
  )
}
