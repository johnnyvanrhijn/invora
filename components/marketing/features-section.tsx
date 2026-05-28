import {
  FileText,
  ShieldCheck,
  CreditCard,
  Bell,
  Clock,
  Smartphone,
  type LucideIcon,
} from 'lucide-react'

interface Feature {
  icon: LucideIcon
  name: string
  pain: string
  solution: string
}

const FEATURES: Feature[] = [
  {
    icon: FileText,
    name: 'Facturen in 2 minuten',
    pain: 'Elke factuur handmatig opstellen kost je kostbare tijd.',
    solution: 'Selecteer cliënt, vul bedrag in, verstuur. Klaar.',
  },
  {
    icon: ShieldCheck,
    name: 'BTW-vrijstelling automatisch',
    pain: 'BTW-regels voor zorgprofessionals zijn verwarrend en foutgevoelig.',
    solution: 'Invora past de wettelijke BTW-vrijstelling automatisch toe op elke factuur.',
  },
  {
    icon: CreditCard,
    name: 'Betaald via iDEAL',
    pain: 'Cliënten vergeten te betalen of weten niet hoe.',
    solution: 'Stuur een betaallink mee — cliënten betalen direct via iDEAL.',
  },
  {
    icon: Bell,
    name: 'Automatische herinneringen',
    pain: 'Zelf achter betalingen aanzitten voelt ongemakkelijk.',
    solution: 'Invora stuurt automatisch een vriendelijke herinnering als een factuur te laat is.',
  },
  {
    icon: Clock,
    name: 'Urenregistratie',
    pain: 'Bijhouden hoeveel uur je per cliënt hebt gewerkt is een puzzel.',
    solution: 'Registreer sessies per cliënt en zet ze met één klik om naar een factuur.',
  },
  {
    icon: Smartphone,
    name: 'Altijd bij de hand',
    pain: 'Je werkt niet altijd achter je bureau.',
    solution: 'Invora werkt op elke telefoon, tablet of laptop — geen app nodig.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="bg-invora-surface scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-invora-text text-3xl font-bold tracking-tight sm:text-4xl">
            Alles wat je nodig hebt.{' '}
            <span className="text-invora-text-muted">Niets wat je niet nodig hebt.</span>
          </h2>
          <p className="text-invora-text-muted mt-4 text-base sm:text-lg">
            Invora is gebouwd voor zorgprofessionals — niet voor accountants.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, name, pain, solution }) => (
            <article
              key={name}
              className="group bg-invora-surface border-border rounded-xl border p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="bg-invora-primary-light text-invora-primary inline-flex size-11 items-center justify-center rounded-lg">
                <Icon className="size-5" />
              </div>
              <h3 className="font-heading text-invora-text mt-4 text-lg font-semibold">
                {name}
              </h3>
              <p className="text-invora-text-muted mt-2 text-sm italic">{pain}</p>
              <p className="text-invora-text mt-1.5 text-sm leading-relaxed">{solution}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
