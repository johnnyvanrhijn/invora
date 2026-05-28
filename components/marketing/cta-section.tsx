import Link from 'next/link'

export function CtaSection() {
  return (
    <section className="from-invora-primary to-invora-primary-dark relative overflow-hidden bg-gradient-to-br">
      {/* Decoratieve cirkels */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Klaar om je administratie te vereenvoudigen?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
          Start vandaag nog gratis. Geen creditcard nodig.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="text-invora-primary-dark rounded-button inline-flex w-full items-center justify-center bg-white px-7 py-3 text-base font-semibold shadow-lg transition-transform active:scale-95 hover:shadow-xl sm:w-auto"
          >
            Gratis proberen →
          </Link>
          <Link
            href="/login"
            className="rounded-button inline-flex w-full items-center justify-center border-2 border-white/70 bg-transparent px-7 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
          >
            Inloggen
          </Link>
        </div>

        <p className="mt-6 text-xs text-white/70">
          30 dagen gratis · Maandelijks opzegbaar · AVG-conform
        </p>
      </div>
    </section>
  )
}
