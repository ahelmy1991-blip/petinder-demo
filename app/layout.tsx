import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Petinder — Everything your pet needs in Cairo', template: '%s | Petinder' },
  description: 'Cairo\'s #1 pet platform — social feed, AI-powered playdate matching, book walkers/vets/groomers/hotels, and a marketplace. 3M+ pets across Egypt.',
  keywords: ['pet', 'dog', 'cat', 'Cairo', 'vet', 'groomer', 'dog walker', 'pet hotel', 'pet sitting', 'Egypt', 'adoption'],
  authors: [{ name: 'Petinder' }],
  creator: 'Petinder',
  openGraph: {
    title: 'Petinder — Everything your pet needs in Cairo',
    description: 'Social network, playdate matching, services booking and marketplace for Cairo pet parents.',
    type: 'website',
    locale: 'en_EG',
    siteName: 'Petinder',
  },
  twitter: { card: 'summary', title: 'Petinder', description: 'Cairo\'s #1 pet platform' },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Petinder' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f43f5e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
