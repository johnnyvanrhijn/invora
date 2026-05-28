'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
}

const NAV_LINKS: NavLink[] = [
  { href: '/#features', label: 'Features' },
  { href: '/#hoe-het-werkt', label: 'Hoe het werkt' },
  { href: '/#prijzen', label: 'Prijzen' },
  { href: '/#faq', label: 'FAQ' },
]

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Lock body scroll wanneer mobiel menu open is
  useEffect(() => {
    if (!mobileOpen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-200',
          scrolled || mobileOpen
            ? 'bg-invora-surface/95 supports-backdrop-filter:backdrop-blur-md border-border border-b shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-invora-primary font-heading text-xl font-bold tracking-tight"
            onClick={() => setMobileOpen(false)}
          >
            Invora
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-invora-text hover:text-invora-primary text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="text-invora-text hover:bg-invora-primary-light rounded-button px-4 py-2 text-sm font-medium transition-colors"
            >
              Inloggen
            </Link>
            <Link
              href="/register"
              className="from-invora-primary to-invora-primary-dark rounded-button bg-gradient-to-br px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95 hover:shadow-md"
            >
              Gratis proberen →
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Menu sluiten' : 'Menu openen'}
            aria-expanded={mobileOpen}
            className="text-invora-text -mr-2 flex size-10 items-center justify-center rounded-md md:hidden"
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile slide-down menu */}
        {mobileOpen && (
          <div className="bg-invora-surface border-border absolute inset-x-0 top-16 z-50 border-b shadow-lg md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col px-4 py-4 sm:px-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-invora-text hover:bg-invora-primary-light rounded-md px-3 py-3 text-base font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-border mt-3 flex flex-col gap-2 border-t pt-3">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-invora-text border-border rounded-button border px-4 py-2.5 text-center text-sm font-medium"
                >
                  Inloggen
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="from-invora-primary to-invora-primary-dark rounded-button bg-gradient-to-br px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
                >
                  Gratis proberen →
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  )
}
