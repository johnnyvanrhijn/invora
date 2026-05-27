import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'Algemene voorwaarden en verwerkersovereenkomst van Invora.',
}

export default function VoorwaardenPage() {
  return (
    <main className="bg-invora-background min-h-screen px-6 py-16">
      <article className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/"
          className="text-invora-primary text-sm underline"
        >
          ← Terug naar Invora
        </Link>
        <h1 className="text-invora-text text-3xl font-bold">Algemene voorwaarden</h1>
        <p className="text-invora-text-muted text-sm">
          Laatst bijgewerkt: nog vast te stellen
        </p>

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
        </section>
      </article>
    </main>
  )
}
