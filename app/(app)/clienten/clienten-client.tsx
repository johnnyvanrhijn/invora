'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  MoreHorizontal,
  Upload,
  Download,
  Archive,
  ArchiveRestore,
  Trash2,
  FileText,
  Clock,
  Pencil,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BulkActionBar } from '@/components/app/bulk-action-bar'
import { ConfirmDialog } from '@/components/app/confirm-dialog'
import { ClientCategoryBadge } from '@/components/app/clients/client-category-badge'
import { ClientDetailSheet } from '@/components/app/clients/client-detail-sheet'
import { ClientFormDialog } from '@/components/app/clients/client-form'
import { CsvImportModal } from '@/components/app/clients/csv-import-modal'
import { cn, formatCurrency, formatDateShort } from '@/lib/utils'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import type { ClientListItem, ClientWithStats, PaginatedResult } from '@/types'

type CategoryFilter = 'alle' | 'actief' | 'inactief' | 'vip' | 'archived'

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'actief', label: 'Actief' },
  { value: 'inactief', label: 'Inactief' },
  { value: 'vip', label: 'VIP' },
  { value: 'archived', label: 'Gearchiveerd' },
]

export function ClientenClient() {
  const router = useRouter()

  const [clients, setClients] = useState<ClientListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('alle')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [slideOverClientId, setSlideOverClientId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientWithStats | null>(null)
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [bulkConfirm, setBulkConfirm] = useState<null | {
    action: 'archive' | 'unarchive' | 'delete'
    count: number
  }>(null)
  const [rowConfirmDelete, setRowConfirmDelete] = useState<ClientListItem | null>(null)
  const [isMutating, setIsMutating] = useState(false)

  // Debounce zoeken
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        category: categoryFilter,
      })
      if (search) params.set('search', search)
      const res = await fetch(`/api/clients?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!res.ok) {
        throw new Error('Laden mislukt')
      }
      const data: PaginatedResult<ClientListItem> = await res.json()
      setClients(data.data)
      setTotal(data.total)
      setSelectedIds(new Set())
    } catch (err) {
      console.error(err)
      toast.error('Kon cliënten niet laden')
    } finally {
      setIsLoading(false)
    }
  }, [page, categoryFilter, search])

  useEffect(() => {
    void loadClients()
  }, [loadClients])

  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE))
  const showArchived = categoryFilter === 'archived'
  const allSelected = clients.length > 0 && clients.every((c) => selectedIds.has(c.id))

  function toggleSelectAll(value: boolean) {
    if (value) {
      setSelectedIds(new Set(clients.map((c) => c.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function openEdit(clientId: string) {
    try {
      const res = await fetch(`/api/clients/${clientId}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Kon cliënt niet laden')
      const { client } = (await res.json()) as { client: ClientWithStats }
      setEditingClient(client)
      setIsFormOpen(true)
    } catch (err) {
      console.error(err)
      toast.error('Kon cliënt niet laden voor bewerken')
    }
  }

  async function archiveOne(client: ClientListItem) {
    const next = !client.archived
    // Optimistic
    setClients((prev) =>
      prev
        .map((c) => (c.id === client.id ? { ...c, archived: next } : c))
        .filter((c) => (showArchived ? c.archived : !c.archived))
    )
    try {
      const res = await fetch(`/api/clients/${client.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: next }),
      })
      if (!res.ok) throw new Error('Mislukt')
      toast.success(next ? 'Cliënt gearchiveerd' : 'Cliënt teruggezet')
      void loadClients()
    } catch (err) {
      console.error(err)
      toast.error('Bijwerken mislukt')
      void loadClients()
    }
  }

  async function deleteOne(client: ClientListItem) {
    setIsMutating(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
      if (res.status === 409) {
        const data = await res.json()
        toast.error(data.message ?? 'Kan niet verwijderen: openstaande facturen')
        return
      }
      if (!res.ok) throw new Error('Verwijderen mislukt')
      toast.success('Cliënt verwijderd')
      setRowConfirmDelete(null)
      void loadClients()
    } catch (err) {
      console.error(err)
      toast.error('Verwijderen mislukt')
    } finally {
      setIsMutating(false)
    }
  }

  async function executeBulk(action: 'archive' | 'unarchive' | 'delete') {
    setIsMutating(true)
    try {
      const res = await fetch('/api/clients/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: [...selectedIds] }),
      })
      if (!res.ok) throw new Error('Mislukt')
      const data = await res.json()
      const processed = data.processed ?? 0
      const skipped = data.skipped ?? 0
      if (action === 'delete') {
        toast.success(
          `${processed} verwijderd${skipped > 0 ? `, ${skipped} overgeslagen (openstaande facturen)` : ''}`
        )
      } else if (action === 'archive') {
        toast.success(`${processed} gearchiveerd`)
      } else {
        toast.success(`${processed} teruggezet`)
      }
      setBulkConfirm(null)
      setSelectedIds(new Set())
      void loadClients()
    } catch (err) {
      console.error(err)
      toast.error('Bulk actie mislukt')
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Cliënten</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCsvImportOpen(true)}
          >
            <Upload />
            Importeer CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.location.href = '/api/clients/export'
            }}
          >
            <Download />
            Exporteer CSV
          </Button>
          <Button
            onClick={() => {
              setEditingClient(null)
              setIsFormOpen(true)
            }}
            size="sm"
          >
            <Plus />
            Nieuwe cliënt
          </Button>
        </div>
      </div>

      {selectedIds.size > 0 ? (
        <BulkActionBar
          count={selectedIds.size}
          itemLabel="cliënt"
          pluralLabel="cliënten"
          showUnarchive={showArchived}
          onArchive={() =>
            setBulkConfirm({ action: 'archive', count: selectedIds.size })
          }
          onUnarchive={() =>
            setBulkConfirm({ action: 'unarchive', count: selectedIds.size })
          }
          onDelete={() =>
            setBulkConfirm({ action: 'delete', count: selectedIds.size })
          }
          onClear={() => setSelectedIds(new Set())}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-2 left-2 size-4" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Zoek op naam of e-mail"
              className="w-64 pl-8"
            />
          </div>
          <Select
            value={categoryFilter}
            onValueChange={(v) => {
              setCategoryFilter(v as CategoryFilter)
              setPage(1)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="bg-invora-surface rounded-card overflow-hidden border">
        {/* Tabel met horizontale scroll op mobiel */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-invora-background sticky top-0 z-10">
              <tr className="text-muted-foreground text-left text-xs uppercase tracking-wide">
                <th className="w-10 px-3 py-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => toggleSelectAll(Boolean(v))}
                    aria-label="Alles selecteren"
                  />
                </th>
                <th className="px-3 py-3">Naam</th>
                <th className="px-3 py-3">Categorie</th>
                <th className="px-3 py-3">Sessies</th>
                <th className="px-3 py-3">Omzet</th>
                <th className="px-3 py-3">Laatste factuur</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="border-t">
                      <td className="px-3 py-3">
                        <Skeleton className="h-4 w-4" />
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-4 w-40" />
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-5 w-16" />
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-4 w-12" />
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                      <td className="px-3 py-3">
                        <Skeleton className="h-6 w-6" />
                      </td>
                    </tr>
                  ))
                : clients.length === 0
                  ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center">
                          {search ? (
                            <p className="text-muted-foreground">
                              Geen cliënten gevonden voor &laquo;{search}&raquo;
                            </p>
                          ) : showArchived ? (
                            <p className="text-muted-foreground">
                              Geen gearchiveerde cliënten
                            </p>
                          ) : (
                            <div className="flex flex-col items-center gap-3">
                              <p className="text-muted-foreground">
                                Nog geen cliënten. Voeg je eerste cliënt toe.
                              </p>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditingClient(null)
                                  setIsFormOpen(true)
                                }}
                              >
                                <Plus />
                                Nieuwe cliënt
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  : clients.map((c) => (
                      <ClientRow
                        key={c.id}
                        client={c}
                        selected={selectedIds.has(c.id)}
                        onToggle={(checked) => toggleRow(c.id, checked)}
                        onOpenDetail={() => setSlideOverClientId(c.id)}
                        onEdit={() => openEdit(c.id)}
                        onArchive={() => archiveOne(c)}
                        onDelete={() => setRowConfirmDelete(c)}
                        onCreateInvoice={() =>
                          router.push(`/facturen/nieuw?client=${c.id}`)
                        }
                        onRegisterHours={() =>
                          router.push(`/uren/nieuw?client=${c.id}`)
                        }
                      />
                    ))}
            </tbody>
          </table>
        </div>

        {/* Paginering */}
        {!isLoading && total > 0 && (
          <div className="text-muted-foreground flex items-center justify-between border-t px-4 py-3 text-xs">
            <span>
              Pagina {page} van {totalPages} · {total} cliënten
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Vorige
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Volgende
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over detail */}
      <ClientDetailSheet
        clientId={slideOverClientId}
        onClose={() => setSlideOverClientId(null)}
        onEdit={(client) => {
          setSlideOverClientId(null)
          setEditingClient(client)
          setIsFormOpen(true)
        }}
        onCreateInvoice={(id) => {
          setSlideOverClientId(null)
          router.push(`/facturen/nieuw?client=${id}`)
        }}
      />

      {/* Formulier */}
      <ClientFormDialog
        open={isFormOpen}
        initialData={editingClient}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingClient(null)
        }}
        onSaved={() => {
          setIsFormOpen(false)
          setEditingClient(null)
          void loadClients()
        }}
      />

      {/* CSV import */}
      <CsvImportModal
        open={isCsvImportOpen}
        onOpenChange={setIsCsvImportOpen}
        onCompleted={() => {
          setIsCsvImportOpen(false)
          void loadClients()
        }}
      />

      {/* Bulk bevestiging */}
      <ConfirmDialog
        open={bulkConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setBulkConfirm(null)
        }}
        title={
          bulkConfirm?.action === 'delete'
            ? 'Cliënten verwijderen?'
            : bulkConfirm?.action === 'archive'
              ? 'Cliënten archiveren?'
              : 'Cliënten dearchiveren?'
        }
        description={
          bulkConfirm?.action === 'delete'
            ? `Je staat op het punt ${bulkConfirm.count} cliënt(en) te verwijderen. Cliënten met openstaande facturen worden overgeslagen. Deze actie kan niet ongedaan worden gemaakt.`
            : bulkConfirm?.action === 'archive'
              ? `${bulkConfirm.count} cliënt(en) worden gearchiveerd. Ze blijven beschikbaar via het filter 'Gearchiveerd'.`
              : `${bulkConfirm?.count ?? 0} cliënt(en) worden teruggezet naar actief.`
        }
        confirmLabel={
          bulkConfirm?.action === 'delete' ? 'Verwijderen' : 'Bevestigen'
        }
        confirmVariant={bulkConfirm?.action === 'delete' ? 'destructive' : 'default'}
        isLoading={isMutating}
        onConfirm={() => {
          if (bulkConfirm) void executeBulk(bulkConfirm.action)
        }}
      />

      {/* Rij verwijder bevestiging */}
      <ConfirmDialog
        open={rowConfirmDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRowConfirmDelete(null)
        }}
        title="Cliënt verwijderen?"
        description={`Weet je zeker dat je ${rowConfirmDelete?.name ?? 'deze cliënt'} wilt verwijderen? Cliënten met openstaande facturen kunnen niet worden verwijderd. Deze actie kan niet ongedaan worden gemaakt.`}
        confirmLabel="Verwijderen"
        confirmVariant="destructive"
        isLoading={isMutating}
        onConfirm={() => {
          if (rowConfirmDelete) void deleteOne(rowConfirmDelete)
        }}
      />
    </div>
  )
}

interface ClientRowProps {
  client: ClientListItem
  selected: boolean
  onToggle: (checked: boolean) => void
  onOpenDetail: () => void
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
  onCreateInvoice: () => void
  onRegisterHours: () => void
}

function ClientRow({
  client,
  selected,
  onToggle,
  onOpenDetail,
  onEdit,
  onArchive,
  onDelete,
  onCreateInvoice,
  onRegisterHours,
}: ClientRowProps) {
  // stopPropagation op interactieve cellen zodat klikken op checkbox of menu
  // niet ook de slide-over opent.
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <tr
      onClick={onOpenDetail}
      className={cn(
        'cursor-pointer border-t transition-colors',
        'hover:bg-invora-background/60 even:bg-invora-background/30',
        client.archived && 'opacity-60'
      )}
    >
      <td className="px-3 py-3" onClick={stop}>
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onToggle(Boolean(v))}
          aria-label={`Selecteer ${client.name}`}
        />
      </td>
      <td className="px-3 py-3">
        <div className="font-medium">
          {client.name}
          {client.archived && (
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              [GEARCHIVEERD]
            </span>
          )}
        </div>
        <div className="text-muted-foreground text-xs">{client.email}</div>
      </td>
      <td className="px-3 py-3">
        <ClientCategoryBadge category={client.category} />
      </td>
      <td className="px-3 py-3 tabular-nums">{client.session_count}</td>
      <td className="px-3 py-3 tabular-nums">
        {formatCurrency(client.total_revenue)}
      </td>
      <td className="text-muted-foreground px-3 py-3">
        {client.last_invoice_date
          ? formatDateShort(client.last_invoice_date)
          : '—'}
      </td>
      <td className="px-3 py-3 text-right" onClick={stop}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Acties">
                <MoreHorizontal />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onCreateInvoice}>
              <FileText />
              Nieuwe factuur
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRegisterHours}>
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
      </td>
    </tr>
  )
}
