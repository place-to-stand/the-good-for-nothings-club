import type { Metadata } from 'next'
import { alegreya, rubik, rubikGlitch } from '../styles/fonts'
import { cn } from '@/lib/utils'
import { Analytics } from '@vercel/analytics/react'

import '../styles/globals.css'
import AttributionCapture from '@/components/AttributionCapture'
import Header from '@/components/Header'
import Footer from '../components/Footer'
import Script from 'next/script'

export async function generateMetadata(): Promise<Metadata> {
  const pathname = '/'

  return {
    title: {
      template: '%s | The Good for Nothings Club',
      default: 'Creators club from ATX | The Good for Nothings Club',
    },
    description:
      'The Good for Nothings Club is a creators club in Austin, TX made up of musicians, photographers, writers, filmmakers, and engineers. Our clubhouse puts studios, rehearsal rooms, and workspace under one roof. Good for nothings. Making everything.',
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
    metadataBase: new URL('https://www.thegoodfornothings.club'),
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
        <AttributionCapture />
        <Header />
        {children}
        <Footer />
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
