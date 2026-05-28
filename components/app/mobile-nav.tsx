'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Users,
  Clock,
  Package,
  BarChart2,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/facturen', label: 'Facturen', icon: FileText },
  { href: '/clienten', label: 'Cliënten', icon: Users },
  { href: '/uren', label: 'Uren', icon: Clock },
  { href: '/diensten', label: 'Diensten', icon: Package },
  { href: '/rapporten', label: 'Rapporten', icon: BarChart2 },
]

const SETTINGS_ITEM: NavItem = {
  href: '/instellingen',
  label: 'Instellingen',
  icon: Settings,
}

function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

interface MobileNavProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  firstName: string
}

export function MobileNav({ open, onOpenChange, firstName }: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)

  const initial = (firstName?.trim().charAt(0) || '?').toUpperCase()

  function handleNavigate(href: string) {
    onOpenChange(false)
    router.push(href)
  }

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    onOpenChange(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="bg-background w-72 gap-0 p-0 sm:max-w-xs"
        showCloseButton={false}
      >
        <SheetHeader className="border-border border-b p-4">
          <SheetTitle className="text-invora-primary text-lg font-bold">
            Invora
          </SheetTitle>
          <SheetDescription className="sr-only">Hoofdnavigatie</SheetDescription>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => (
            <NavRow
              key={item.href}
              item={item}
              active={isActiveRoute(pathname, item.href)}
              onClick={() => handleNavigate(item.href)}
            />
          ))}

          <div className="border-border my-2 border-t" />

          <NavRow
            item={SETTINGS_ITEM}
            active={isActiveRoute(pathname, SETTINGS_ITEM.href)}
            onClick={() => handleNavigate(SETTINGS_ITEM.href)}
          />
        </nav>

        <div className="border-border border-t p-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="bg-invora-primary flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
              {initial}
            </div>
            <span className="text-foreground flex-1 truncate text-sm font-medium">
              {firstName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Uitloggen"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive flex size-9 items-center justify-center rounded-md transition-colors disabled:opacity-50"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface NavRowProps {
  item: NavItem
  active: boolean
  onClick: () => void
}

function NavRow({ item, active, onClick }: NavRowProps) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors',
        active
          ? 'bg-invora-primary text-white'
          : 'text-foreground hover:bg-invora-primary-light'
      )}
    >
      <Icon className="size-5 shrink-0" />
      <span>{item.label}</span>
    </button>
  )
}
