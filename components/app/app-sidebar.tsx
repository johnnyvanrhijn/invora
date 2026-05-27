'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Users,
  Clock,
  Package,
  BarChart2,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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

const SETTINGS_ITEM: NavItem = { href: '/instellingen', label: 'Instellingen', icon: Settings }

function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

interface AppSidebarProps {
  firstName: string
  defaultCollapsed: boolean
}

export function AppSidebar({ firstName, defaultCollapsed }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [loggingOut, setLoggingOut] = useState(false)

  const initial = (firstName?.trim().charAt(0) || '?').toUpperCase()

  async function handleToggle() {
    const next = !collapsed
    setCollapsed(next)
    await fetch('/api/sidebar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collapsed: next }),
    }).catch(() => {
      // Geen blocker — persistentie faalt silent
    })
  }

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={cn(
        'hidden h-screen flex-col border-r border-border bg-white transition-all duration-200 ease-in-out lg:flex',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header met logo en toggle */}
      <div
        className={cn(
          'flex h-16 items-center border-b border-border',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        {!collapsed && <span className="text-invora-primary text-lg font-bold">Invora</span>}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={handleToggle}
                aria-label={collapsed ? 'Sidebar uitklappen' : 'Sidebar inklappen'}
                className="text-invora-text-muted hover:text-invora-primary rounded-md p-1.5 transition-colors"
              >
                {collapsed ? (
                  <PanelLeftOpen className="size-5" />
                ) : (
                  <PanelLeftClose className="size-5" />
                )}
              </button>
            }
          />
          {collapsed && (
            <TooltipContent side="right">
              <p>Sidebar uitklappen</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      {/* Navigatie */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
        ))}

        <div className="flex-1" />

        <SidebarItem item={SETTINGS_ITEM} pathname={pathname} collapsed={collapsed} />
      </nav>

      {/* Gebruikersblok onderaan */}
      <div className={cn('border-t border-border p-2', collapsed ? 'space-y-1' : '')}>
        {collapsed ? (
          <>
            <Tooltip>
              <TooltipTrigger
                render={
                  <div
                    className="bg-invora-primary mx-auto flex size-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                    aria-label={firstName}
                  >
                    {initial}
                  </div>
                }
              />
              <TooltipContent side="right">
                <p>{firstName}</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    aria-label="Uitloggen"
                    className="text-invora-text-muted hover:bg-destructive/10 hover:text-destructive mx-auto flex size-8 items-center justify-center rounded-md transition-colors disabled:opacity-50"
                  >
                    <LogOut className="size-4" />
                  </button>
                }
              />
              <TooltipContent side="right">
                <p>Uitloggen</p>
              </TooltipContent>
            </Tooltip>
          </>
        ) : (
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="bg-invora-primary flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white">
              {initial}
            </div>
            <span className="text-invora-text flex-1 truncate text-sm font-medium">{firstName}</span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Uitloggen"
              className="text-invora-text-muted hover:bg-destructive/10 hover:text-destructive flex size-8 items-center justify-center rounded-md transition-colors disabled:opacity-50"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

interface SidebarItemProps {
  item: NavItem
  pathname: string
  collapsed: boolean
}

function SidebarItem({ item, pathname, collapsed }: SidebarItemProps) {
  const active = isActiveRoute(pathname, item.href)
  const Icon = item.icon

  const linkClasses = cn(
    'flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
    collapsed ? 'justify-center' : 'gap-3',
    active
      ? 'bg-invora-primary text-white'
      : 'text-invora-text-muted hover:bg-invora-primary-light hover:text-invora-text'
  )

  const link = (
    <Link href={item.href} className={linkClasses} aria-current={active ? 'page' : undefined}>
      <Icon className="size-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  )

  if (!collapsed) return link

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">
        <p>{item.label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
