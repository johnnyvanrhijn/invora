import Link from 'next/link'
import { Check } from 'lucide-react'
import { HeroIllustration } from '@/components/marketing/hero-illustration'

const TRUST_POINTS = [
  '30 dagen gratis',
  'Geen creditcard nodig',
  'Maandelijks opzegbaar',
]

export function HeroSection() {
  return (
    <section className="bg-invora-background relative overflow-hidden">
      {/* Subtiele sage-cirkel rechtsachter als sfeeraccent */}
      <div
        className="bg-invora-primary/15 pointer-events-none absolute -top-32 -right-32 size-[480px] rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="bg-invora-primary-light/40 pointer-events-none absolute -bottom-40 -left-20 size-80 rounded-full blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-16 sm:px-6 sm:pt-16 sm:pb-24 lg:px-8 lg:pt-20 lg:pb-28">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <span className="bg-invora-primary-light text-invora-primary-dark inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
              <span aria-hidden>🇳🇱</span>
              Speciaal voor Nederlandse zorgprofessionals
            </span>

            <h1 className="font-heading text-invora-text mt-5 text-4xl leading-tight font-bold tracking-tight md:text-5xl lg:text-6xl">
              Jij bent zorgprofessional, geen boekhouder.{' '}
              <span className="text-invora-primary">Invora maakt factureren simpel.</span>
            </h1>

            <p className="text-invora-text-muted mx-auto mt-5 max-w-xl text-base leading-relaxed md:text-lg lg:mx-0 lg:text-xl">
              Stuur professionele facturen, houd je uren bij en ontvang betalingen via iDEAL.
              Zonder boekhoudkennis, zonder gedoe.
            </p>

            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/register"
                className="from-invora-primary to-invora-primary-dark inline-flex w-full items-center justify-center rounded-button bg-gradient-to-br px-6 py-3 text-base font-semibold text-white shadow-md transition-all active:scale-95 hover:shadow-lg sm:w-auto"
              >
                Gratis proberen →
              </Link>
              <Link
                href="/login"
                className="text-invora-primary border-invora-primary/40 hover:bg-invora-primary-light inline-flex w-full items-center justify-center rounded-button border-2 bg-transparent px-6 py-3 text-base font-semibold transition-colors sm:w-auto"
              >
                Inloggen
              </Link>
            </div>

            <ul className="text-invora-text-muted mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs lg:justify-start">
              {TRUST_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <Check className="text-invora-primary size-3.5" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <HeroIllustration className="mx-auto w-full max-w-md lg:max-w-none" />
          </div>
        </div>
      </div>
    </section>
  )
}
