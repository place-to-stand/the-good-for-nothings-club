import type { Metadata } from 'next'
import { alegreya, rubik, rubikGlitch } from '../styles/fonts'
import { cn } from '@/lib/utils'
import { localBusinessJsonLd } from '@/lib/structuredData'
import { PAGE_META } from '@/data/site'
import { Analytics } from '@vercel/analytics/react'

import '../styles/globals.css'
import AttributionCapture from '@/components/AttributionCapture'
import Script from 'next/script'

export async function generateMetadata(): Promise<Metadata> {
  const pathname = '/'

  return {
    title: {
      template: '%s | The Good for Nothings Club',
      default: PAGE_META['/'].title,
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
        <AttributionCapture />
        {children}
        <Analytics />
        <Script src='https://www.googletagmanager.com/gtag/js?id=G-RK8DQY3F32' />
        <Script id='google-analytics'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RK8DQY3F32');
          `}
        </Script>
      </body>
    </html>
  )
}
