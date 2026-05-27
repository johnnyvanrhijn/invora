'use client'

import { X, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BulkActionBarProps {
  count: number
  itemLabel: string // bijv. 'cliënt' of 'dienst'
  pluralLabel: string // bijv. 'cliënten' of 'diensten'
  showUnarchive?: boolean // bij archive view: toon dearchiveren
  onArchive: () => void
  onUnarchive?: () => void
  onDelete: () => void
  onClear: () => void
  className?: string
}

export function BulkActionBar({
  count,
  itemLabel,
  pluralLabel,
  showUnarchive = false,
  onArchive,
  onUnarchive,
  onDelete,
  onClear,
  className,
}: BulkActionBarProps) {
  const label = count === 1 ? itemLabel : pluralLabel
  return (
    <div
      className={cn(
        'bg-invora-primary-light border-invora-primary/30 flex flex-wrap items-center gap-2 rounded-card border px-3 py-2',
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onClear}
        aria-label="Selectie wissen"
      >
        <X />
      </Button>
      <span className="text-foreground text-sm font-medium">
        {count} {label} geselecteerd
      </span>
      <div className="ml-auto flex flex-wrap gap-2">
        {showUnarchive && onUnarchive ? (
          <Button variant="outline" size="sm" onClick={onUnarchive}>
            <ArchiveRestore />
            Dearchiveren
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onArchive}>
            <Archive />
            Archiveren
          </Button>
        )}
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 />
          Verwijderen
        </Button>
      </div>
    </div>
  )
}
