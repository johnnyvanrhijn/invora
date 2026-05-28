import { ArrowRight } from 'lucide-react'

interface Step {
  number: string
  title: string
  description: string
}

const STEPS: Step[] = [
  {
    number: '01',
    title: 'Account instellen',
    description:
      'Vul je KvK-nummer in en Invora laadt je bedrijfsgegevens automatisch. Klaar in 2 minuten.',
  },
  {
    number: '02',
    title: 'Cliënt en dienst toevoegen',
    description:
      'Voeg je cliënten toe met naam en e-mailadres. Sla je diensten op als sjabloon zodat je ze hergebruikt.',
  },
  {
    number: '03',
    title: 'Factuur versturen',
    description:
      'Kies een cliënt, selecteer je dienst en verstuur. De cliënt ontvangt een professionele factuur met betaallink.',
  },
]

export function HowItWorksSection() {
  return (
    <section id="hoe-het-werkt" className="bg-invora-primary-light scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-invora-text text-3xl font-bold tracking-tight sm:text-4xl">
            In 3 stappen je eerste factuur versturen
          </h2>
          <p className="text-invora-text-muted mt-4 text-base sm:text-lg">
            Van inschrijven tot verstuurde factuur — sneller dan je verwacht.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-4 lg:gap-8">
          {STEPS.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="bg-invora-surface rounded-2xl p-6 shadow-sm sm:p-8">
                <span className="font-heading text-invora-primary block text-5xl font-bold leading-none lg:text-6xl">
                  {step.number}
                </span>
                <h3 className="font-heading text-invora-text mt-4 text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="text-invora-text-muted mt-2 text-sm leading-relaxed sm:text-base">
                  {step.description}
                </p>
              </div>

              {/* Pijl naar volgende stap (alleen desktop, tussen kaarten) */}
              {index < STEPS.length - 1 && (
                <div
                  className="text-invora-primary pointer-events-none absolute top-1/2 -right-3 hidden -translate-y-1/2 md:block lg:-right-5"
                  aria-hidden
                >
                  <ArrowRight className="size-6" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
