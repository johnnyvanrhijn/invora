import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'Algemene voorwaarden en verwerkersovereenkomst van Invora.',
}

export default function VoorwaardenPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 px-6 py-16 sm:py-20">
      <header className="space-y-2">
        <h1 className="text-invora-text font-heading text-3xl font-bold sm:text-4xl">
          Algemene voorwaarden
        </h1>
        <p className="text-invora-text-muted text-sm">
          Laatst bijgewerkt: nog vast te stellen
        </p>
      </header>

      <section className="border-invora-warning/40 bg-invora-warning/10 text-invora-text rounded-card border p-4 text-sm">
        De definitieve algemene voorwaarden en verwerkersovereenkomst worden vóór de
        productlancering toegevoegd. Tot die tijd is dit een placeholder.
      </section>

      <section className="text-invora-text space-y-4 text-sm leading-relaxed">
        <p>
          Invora is een dienst van Work Remote en wordt aangeboden aan therapeuten en
          zorgprofessionals in Nederland.
        </p>
        <p>
          Door je te registreren ga je akkoord met deze voorwaarden en de bijbehorende
          verwerkersovereenkomst. De volledige tekst volgt voor de officiële lancering.
        </p>
        <p>
          Vragen?{' '}
          <a
            href="mailto:support@invora.nl"
            className="text-invora-primary underline"
          >
            support@invora.nl
          </a>
        </p>
      </section>
    </article>
  )
}
