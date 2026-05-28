'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { MobileHeader } from '@/components/app/mobile-header'
import { MobileNav } from '@/components/app/mobile-nav'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/facturen': 'Facturen',
  '/facturen/nieuw': 'Nieuwe factuur',
  '/clienten': 'Cliënten',
  '/uren': 'Uren',
  '/diensten': 'Diensten',
  '/rapporten': 'Rapporten',
  '/instellingen': 'Instellingen',
}

function titleFromPathname(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  // Probeer parent route (bijv. /facturen/abc → "Facturen")
  const segments = pathname.split('/').filter(Boolean)
  while (segments.length > 1) {
    segments.pop()
    const candidate = '/' + segments.join('/')
    if (ROUTE_TITLES[candidate]) return ROUTE_TITLES[candidate]
  }
  return 'Invora'
}

interface MobileLayoutWrapperProps {
  firstName: string
}

export function MobileLayoutWrapper({ firstName }: MobileLayoutWrapperProps) {
  const [navOpen, setNavOpen] = useState(false)
  const pathname = usePathname()
  const title = titleFromPathname(pathname)

  return (
    <>
      <MobileHeader title={title} onMenuClick={() => setNavOpen(true)} />
      <MobileNav open={navOpen} onOpenChange={setNavOpen} firstName={firstName} />
    </>
  )
}
