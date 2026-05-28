import Link from 'next/link'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Link
              href="/"
              className="font-heading text-2xl font-bold text-white"
            >
              Invora
            </Link>
            <p className="mt-2 max-w-xs text-sm text-white/60">
              Facturatie voor zorgprofessionals in Nederland.
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Link
              href="/privacy"
              className="hover:text-invora-primary-light transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/voorwaarden"
              className="hover:text-invora-primary-light transition-colors"
            >
              Voorwaarden
            </Link>
            <Link
              href="/contact"
              className="hover:text-invora-primary-light transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center">
          <p>© {CURRENT_YEAR} Invora — Work Remote</p>
          <p>
            Made with <span className="text-invora-primary-light">♥</span> in Nederland
          </p>
        </div>
      </div>
    </footer>
  )
}
