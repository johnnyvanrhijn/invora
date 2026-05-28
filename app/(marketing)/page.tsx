import type { Metadata } from 'next'
import { HeroSection } from '@/components/marketing/hero-section'
import { TrustBar } from '@/components/marketing/trust-bar'
import { FeaturesSection } from '@/components/marketing/features-section'
import { AppMockupSection } from '@/components/marketing/app-mockup-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { ComparisonSection } from '@/components/marketing/comparison-section'
import { PricingSection } from '@/components/marketing/pricing-section'
import { TestimonialsSection } from '@/components/marketing/testimonials-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { CtaSection } from '@/components/marketing/cta-section'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://invora.nl'

export const metadata: Metadata = {
  title: 'Invora — Factureren voor zorgprofessionals',
  description:
    'Jij bent zorgprofessional, geen boekhouder. Invora maakt factureren simpel. Stuur facturen, houd uren bij en ontvang betalingen via iDEAL. 30 dagen gratis.',
  keywords:
    'factuurapp zorgprofessionals, factureren therapeut, factuurprogramma fysiotherapeut, BTW-vrijstelling zorg, facturen versturen Nederland',
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

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <FeaturesSection />
      <AppMockupSection />
      <HowItWorksSection />
      <ComparisonSection />
      <PricingSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}
