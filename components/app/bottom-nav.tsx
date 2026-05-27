'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Clock,
  Settings,
  Plus,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const ITEMS_LEFT: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/facturen', label: 'Facturen', icon: FileText },
]

const ITEMS_RIGHT: NavItem[] = [
  { href: '/uren', label: 'Uren', icon: Clock },
  { href: '/instellingen', label: 'Instellingen', icon: Settings },
]

function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-border bg-white lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Hoofdnavigatie"
    >
      {ITEMS_LEFT.map((item) => (
        <BottomNavItem key={item.href} item={item} pathname={pathname} />
      ))}

      {/* Centrale verhoogde "Nieuw" knop */}
      <div className="flex items-center justify-center">
        <Link
          href="/facturen/nieuw"
          aria-label="Nieuwe factuur"
          className="from-invora-primary to-invora-primary-dark shadow-invora-primary/30 -mt-5 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg transition-transform active:scale-95"
          id="bottom-nav-new"
        >
          <Plus className="size-6" strokeWidth={2.5} />
        </Link>
      </div>

      {ITEMS_RIGHT.map((item) => (
        <BottomNavItem key={item.href} item={item} pathname={pathname} />
      ))}
    </nav>
  )
}

function BottomNavItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActiveRoute(pathname, item.href)
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
        active ? 'text-invora-primary' : 'text-invora-text-muted'
      )}
    >
      <Icon className="size-5" />
      <span>{item.label}</span>
    </Link>
  )
}
