import type { Metadata } from 'next'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Neem contact op met Invora — vragen, feedback of support.',
}

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 px-6 py-16 sm:py-20">
      <header className="space-y-2">
        <h1 className="text-invora-text font-heading text-3xl font-bold sm:text-4xl">
          Contact
        </h1>
        <p className="text-invora-text-muted text-base">
          Heb je een vraag, suggestie of probleem? We helpen je graag.
        </p>
      </header>

      <section className="bg-invora-surface rounded-card border-border space-y-4 border p-6">
        <h2 className="font-heading text-invora-text text-lg font-semibold">
          Stuur ons een mailtje
        </h2>
        <p className="text-invora-text-muted text-sm">
          We reageren op werkdagen meestal binnen een paar uur.
        </p>
        <a
          href="mailto:support@invora.nl"
          className="from-invora-primary to-invora-primary-dark rounded-button inline-flex items-center gap-2 bg-gradient-to-br px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all active:scale-95 hover:shadow-md"
        >
          <Mail className="size-4" />
          support@invora.nl
        </a>
      </section>

      <section className="text-invora-text-muted text-sm">
        <p>
          Invora is een dienst van <strong className="text-invora-text">Work Remote</strong> —
          gevestigd in Nederland.
        </p>
      </section>
    </article>
  )
}
