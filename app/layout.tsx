import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LangProvider } from '@/contexts/LangContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cairo Souq — سوق القاهرة',
  description: 'Discover the best vendors, food, and shops in Cairo',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  )
}
