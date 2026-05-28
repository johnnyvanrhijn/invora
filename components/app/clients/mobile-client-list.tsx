'use client'

import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Archive,
  ArchiveRestore,
  Trash2,
  Pencil,
  FileText,
  Clock,
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
import { ClientCategoryBadge } from '@/components/app/clients/client-category-badge'
import { cn } from '@/lib/utils'
import type { ClientListItem } from '@/types'

interface MobileClientListProps {
  clients: ClientListItem[]
  isLoading: boolean
  selectedIds: Set<string>
  search: string
  showArchived: boolean
  onToggleSelect: (id: string, checked: boolean) => void
  onOpenDetail: (id: string) => void
  onEdit: (id: string) => void
  onArchive: (client: ClientListItem) => void
  onDelete: (client: ClientListItem) => void
  onCreateNew: () => void
}

export function MobileClientList({
  clients,
  isLoading,
  selectedIds,
  search,
  showArchived,
  onToggleSelect,
  onOpenDetail,
  onEdit,
  onArchive,
  onDelete,
  onCreateNew,
}: MobileClientListProps) {
  if (isLoading) {
    return (
      <div className="bg-invora-surface rounded-card border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`sk-${i}`}
            className="border-border flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
          >
            <Skeleton className="size-5" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-5 w-14" />
          </div>
        ))}
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="bg-invora-surface rounded-card border p-8 text-center">
        {search ? (
          <p className="text-muted-foreground text-sm">
            Geen cliënten gevonden voor &laquo;{search}&raquo;
          </p>
        ) : showArchived ? (
          <p className="text-muted-foreground text-sm">
            Geen gearchiveerde cliënten
          </p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-sm">
              Nog geen cliënten. Voeg je eerste cliënt toe.
            </p>
            <Button size="sm" onClick={onCreateNew}>
              Nieuwe cliënt
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <ul className="bg-invora-surface rounded-card border">
      {clients.map((client) => (
        <MobileClientRow
          key={client.id}
          client={client}
          selected={selectedIds.has(client.id)}
          onToggleSelect={(checked) => onToggleSelect(client.id, checked)}
          onOpenDetail={() => onOpenDetail(client.id)}
          onEdit={() => onEdit(client.id)}
          onArchive={() => onArchive(client)}
          onDelete={() => onDelete(client)}
        />
      ))}
    </ul>
  )
}

interface MobileClientRowProps {
  client: ClientListItem
  selected: boolean
  onToggleSelect: (checked: boolean) => void
  onOpenDetail: () => void
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
}

function MobileClientRow({
  client,
  selected,
  onToggleSelect,
  onOpenDetail,
  onEdit,
  onArchive,
  onDelete,
}: MobileClientRowProps) {
  const router = useRouter()
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <li
      className={cn(
        'border-border flex min-h-[64px] items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0',
        'active:bg-accent/30',
        client.archived && 'opacity-60'
      )}
      onClick={onOpenDetail}
    >
      <div onClick={stop}>
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onToggleSelect(Boolean(v))}
          aria-label={`Selecteer ${client.name}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-foreground truncate font-medium">
          {client.name}
          {client.archived && (
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              [GEARCHIVEERD]
            </span>
          )}
        </div>
        <div className="text-muted-foreground truncate text-sm">
          {client.email}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <ClientCategoryBadge category={client.category} />
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
              <DropdownMenuItem
                onClick={() => router.push(`/facturen/nieuw?client=${client.id}`)}
              >
                <FileText />
                Nieuwe factuur
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/uren/nieuw?client=${client.id}`)}
              >
                <Clock />
                Uren registreren
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>
                <Pencil />
                Bewerken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                {client.archived ? (
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
