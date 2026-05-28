import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/marketing-nav'
import { Footer } from '@/components/marketing/footer'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://invora.nl'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'Invora — Factureren voor zorgprofessionals',
    template: '%s | Invora',
  },
  description:
    'Jij bent zorgprofessional, geen boekhouder. Invora maakt factureren simpel. Stuur facturen, houd uren bij en ontvang betalingen via iDEAL.',
  openGraph: {
    title: 'Invora — Factureren voor zorgprofessionals',
    description:
      'Stuur professionele facturen, houd je uren bij en ontvang betalingen via iDEAL. Zonder boekhoudkennis, zonder gedoe.',
    url: APP_URL,
    siteName: 'Invora',
    locale: 'nl_NL',
    type: 'website',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-invora-background min-h-screen">
      <MarketingNav />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
