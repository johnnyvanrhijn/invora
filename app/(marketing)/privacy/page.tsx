import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Privacybeleid van Invora — hoe wij omgaan met jouw gegevens.',
}

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 px-6 py-16 sm:py-20">
      <header className="space-y-2">
        <h1 className="text-invora-text font-heading text-3xl font-bold sm:text-4xl">
          Privacybeleid
        </h1>
        <p className="text-invora-text-muted text-sm">
          Laatst bijgewerkt: nog vast te stellen
        </p>
      </header>

      <section className="border-invora-warning/40 bg-invora-warning/10 text-invora-text rounded-card border p-4 text-sm">
        De definitieve privacyverklaring wordt vóór de productlancering toegevoegd. Tot die
        tijd is dit een placeholder.
      </section>

      <section className="text-invora-text space-y-4 text-sm leading-relaxed">
        <p>
          Invora verwerkt jouw persoonsgegevens conform de AVG. Wij slaan geen
          gezondheidsdata van jouw cliënten op — facturen bevatten alleen administratieve
          gegevens.
        </p>
        <p>
          Gegevens worden opgeslagen binnen de EU (Frankfurt, Duitsland). De volledige
          tekst volgt voor de officiële lancering.
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
