import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Privacybeleid van Invora — hoe wij omgaan met jouw gegevens.',
}

export default function PrivacyPage() {
  return (
    <main className="bg-invora-background min-h-screen px-6 py-16">
      <article className="mx-auto max-w-2xl space-y-6">
        <Link href="/" className="text-invora-primary text-sm underline">
          ← Terug naar Invora
        </Link>
        <h1 className="text-invora-text text-3xl font-bold">Privacybeleid</h1>
        <p className="text-invora-text-muted text-sm">
          Laatst bijgewerkt: nog vast te stellen
        </p>

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
        </section>
      </article>
    </main>
  )
}
