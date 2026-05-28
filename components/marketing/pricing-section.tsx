import Link from 'next/link'
import { Check } from 'lucide-react'

const FEATURES = [
  'Onbeperkt facturen',
  'Onbeperkt cliënten',
  'Urenregistratie',
  'iDEAL betaallink via Mollie',
  'Automatische betalingsherinneringen',
  'BTW-vrijstelling automatisch',
  'Professionele PDF facturen',
  'Rapportages en exports',
]

export function PricingSection() {
  return (
    <section id="prijzen" className="bg-invora-background scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-invora-text text-3xl font-bold tracking-tight sm:text-4xl">
            Eén prijs. Alles inbegrepen.
          </h2>
          <p className="text-invora-text-muted mt-4 text-base sm:text-lg">
            Geen verborgen kosten. Geen dure add-ons. Gewoon alles wat je nodig hebt.
          </p>
        </div>

        <div className="mt-14 flex flex-col items-center">
          {/* Pill-badge boven de kaart */}
          <span className="bg-invora-primary -mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-md">
            Meest gekozen door zorgprofessionals
          </span>

          <div className="border-invora-primary bg-invora-surface w-full max-w-[480px] rounded-2xl border-2 p-8 shadow-lg sm:p-10">
            <p className="font-heading text-invora-primary-dark text-center text-lg font-semibold">
              Invora
            </p>

            <div className="mt-4 text-center">
              <span className="font-heading text-invora-text text-5xl font-bold tracking-tight sm:text-6xl">
                €&nbsp;12
              </span>
              <span className="text-invora-text-muted ml-1 text-lg">/mnd</span>
            </div>
            <p className="text-invora-text-muted mt-2 text-center text-sm">
              excl. BTW · € 14,52 incl. 21% BTW
            </p>

            <ul className="mt-8 space-y-3">
              {FEATURES.map((feat) => (
                <li key={feat} className="text-invora-text flex items-start gap-3 text-sm">
                  <span className="bg-invora-primary-light text-invora-primary mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                  {feat}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="from-invora-primary to-invora-primary-dark rounded-button mt-8 inline-flex w-full items-center justify-center bg-gradient-to-br px-6 py-3 text-base font-semibold text-white shadow-md transition-all active:scale-95 hover:shadow-lg"
            >
              Gratis proberen →
            </Link>

            <p className="text-invora-text-muted mt-4 text-center text-xs">
              30 dagen gratis · Geen creditcard nodig · Maandelijks opzegbaar
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
