import Link from 'next/link'
import { Check } from 'lucide-react'
import { AppMockup } from '@/components/marketing/app-mockup'

const POINTS = [
  'Dashboard met omzetoverzicht en openstaande facturen',
  'Cliëntenbeheer met factuurhistorie',
  'Facturen versturen in 3 stappen',
]

export function AppMockupSection() {
  return (
    <section className="bg-invora-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <h2 className="font-heading text-invora-text text-3xl font-bold tracking-tight sm:text-4xl">
              Zo ziet Invora eruit
            </h2>
            <p className="text-invora-text-muted mt-4 text-base sm:text-lg">
              Eén overzichtelijk scherm voor je omzet, cliënten en facturen.
              Geen overbodige knoppen, geen verborgen menu&apos;s.
            </p>
            <ul className="mt-6 space-y-3">
              {POINTS.map((point) => (
                <li key={point} className="text-invora-text flex items-start gap-3 text-base">
                  <span className="bg-invora-primary-light text-invora-primary mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="from-invora-primary to-invora-primary-dark rounded-button mt-8 inline-flex items-center bg-gradient-to-br px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 hover:shadow-md"
            >
              Probeer het zelf →
            </Link>
          </div>

          <div className="order-1 lg:order-2">
            <AppMockup className="w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
