import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Invora — Facturatie voor zorgprofessionals',
    template: '%s | Invora',
  },
  description: 'De simpelste factuurapp voor therapeuten en zorgprofessionals in Nederland.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://invora.nl'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors closeButton />
      </body>
    </html>
  )
}
