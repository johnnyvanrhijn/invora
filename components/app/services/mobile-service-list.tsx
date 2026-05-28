'use client'

import {
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
  Pencil,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatCurrency } from '@/lib/utils'
import type { Service } from '@/types'

interface MobileServiceListProps {
  services: Service[]
  isLoading: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string, checked: boolean) => void
  onOpenDetail: (id: string) => void
  onEdit: (service: Service) => void
  onArchive: (service: Service) => void
  onDelete: (service: Service) => void
  onCreateNew: () => void
}

export function MobileServiceList({
  services,
  isLoading,
  selectedIds,
  onToggleSelect,
  onOpenDetail,
  onEdit,
  onArchive,
  onDelete,
  onCreateNew,
}: MobileServiceListProps) {
  if (isLoading) {
    return (
      <div className="bg-invora-surface rounded-card border">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`sk-${i}`}
            className="border-border flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
          >
            <Skeleton className="size-5" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="bg-invora-surface rounded-card border p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <p className="text-muted-foreground text-sm">
            Nog geen diensten. Voeg je eerste dienst toe.
          </p>
          <Button size="sm" onClick={onCreateNew}>
            Nieuwe dienst
          </Button>
        </div>
      </div>
    )
  }

  return (
    <ul className="bg-invora-surface rounded-card border">
      {services.map((service) => (
        <MobileServiceRow
          key={service.id}
          service={service}
          selected={selectedIds.has(service.id)}
          onToggleSelect={(checked) => onToggleSelect(service.id, checked)}
          onOpenDetail={() => onOpenDetail(service.id)}
          onEdit={() => onEdit(service)}
          onArchive={() => onArchive(service)}
          onDelete={() => onDelete(service)}
        />
      ))}
    </ul>
  )
}

interface MobileServiceRowProps {
  service: Service
  selected: boolean
  onToggleSelect: (checked: boolean) => void
  onOpenDetail: () => void
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
}

function MobileServiceRow({
  service,
  selected,
  onToggleSelect,
  onOpenDetail,
  onEdit,
  onArchive,
  onDelete,
}: MobileServiceRowProps) {
  const stop = (e: React.MouseEvent) => e.stopPropagation()
  const subtitleParts: string[] = []
  if (service.category) subtitleParts.push(service.category)
  subtitleParts.push(
    `${formatCurrency(service.price)}${service.price_type === 'hourly' ? '/uur' : ''}`
  )

  return (
    <li
      className={cn(
        'border-border flex min-h-[64px] items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0',
        'active:bg-accent/30',
        service.archived && 'opacity-60'
      )}
      onClick={onOpenDetail}
    >
      <div onClick={stop}>
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onToggleSelect(Boolean(v))}
          aria-label={`Selecteer ${service.name}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-foreground truncate font-medium">
          {service.name}
          {service.archived && (
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              [GEARCHIVEERD]
            </span>
          )}
        </div>
        <div className="text-muted-foreground truncate text-sm">
          {subtitleParts.join(' · ')}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="bg-invora-primary-light text-invora-primary hidden rounded-full px-2.5 py-0.5 text-xs font-medium sm:inline-flex">
          {service.price_type === 'hourly' ? 'Uurtarief' : 'Vaste prijs'}
        </span>
        <div onClick={stop}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" aria-label="Acties">
                  <MoreHorizontal />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil />
                Bewerken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                {service.archived ? (
                  <>
                    <ArchiveRestore />
                    Dearchiveren
                  </>
                ) : (
                  <>
                    <Archive />
                    Archiveren
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 />
                Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </li>
  )
}
