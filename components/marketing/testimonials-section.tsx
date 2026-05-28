import { Quote, Star } from 'lucide-react'

interface Testimonial {
  quote: string
  name: string
  role: string
}

/* PLACEHOLDER — vervangen door echte testimonials voor lancering */
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Eindelijk een factuurapp die begrijpt hoe ik werk. Geen onnodige functies, gewoon wat ik nodig heb.',
    name: 'Anna de Vries',
    role: 'Psychotherapeut',
  },
  {
    quote:
      'De BTW-vrijstelling wordt automatisch toegepast. Dat scheelt me veel uitzoekwerk.',
    name: 'Mark Janssen',
    role: 'Fysiotherapeut',
  },
  {
    quote:
      'Mijn cliënten betalen nu via iDEAL. Ik hoef nooit meer achter betalingen aan.',
    name: 'Lisa Bakker',
    role: 'Coach',
  },
]

export function TestimonialsSection() {
  return (
    <section className="from-invora-primary to-invora-primary-dark bg-gradient-to-br">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Wat zorgprofessionals zeggen
          </h2>
          <p className="mt-4 text-base text-white/80 sm:text-lg">
            Verhalen van mensen die Invora dagelijks gebruiken.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="bg-invora-surface border-invora-primary-light/60 relative flex flex-col rounded-2xl border p-6 shadow-md sm:p-7"
            >
              <Quote
                className="text-invora-primary-light absolute right-5 top-5 size-10"
                aria-hidden
              />
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="text-invora-primary size-4"
                    fill="currentColor"
                    aria-hidden
                  />
                ))}
              </div>
              <p className="text-invora-text mt-4 flex-1 text-sm italic leading-relaxed sm:text-base">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="border-border mt-6 border-t pt-4">
                <p className="text-invora-text font-heading text-sm font-semibold">
                  {t.name}
                </p>
                <p className="text-invora-text-muted text-xs">{t.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
