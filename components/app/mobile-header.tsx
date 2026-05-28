'use client'

import { Menu } from 'lucide-react'

interface MobileHeaderProps {
  title: string
  onMenuClick: () => void
}

export function MobileHeader({ title, onMenuClick }: MobileHeaderProps) {
  return (
    <header
      className="bg-invora-primary sticky top-0 z-40 flex h-14 items-center px-2 lg:hidden"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Menu openen"
        className="flex size-10 items-center justify-center rounded-md text-white transition-colors active:bg-white/10"
      >
        <Menu className="size-6" />
      </button>

      <h1 className="flex-1 text-center text-base font-semibold text-white">
        {title}
      </h1>

      {/* Lege ruimte voor visuele balans */}
      <div className="size-10" aria-hidden />
    </header>
  )
}
