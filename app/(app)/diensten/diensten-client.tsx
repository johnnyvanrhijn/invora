'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  Plus,
  MoreHorizontal,
  TrendingUp,
  Euro,
  Archive,
  ArchiveRestore,
  Trash2,
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
import { FilterChips } from '@/components/app/filter-chips'
import { ServiceFormDialog } from '@/components/app/services/service-form'
import { ServiceDetailSheet } from '@/components/app/services/service-detail-sheet'
import { MobileServiceList } from '@/components/app/services/mobile-service-list'
import { cn, formatCurrency } from '@/lib/utils'
import type { Service } from '@/types'

type ServiceFilter = 'alle' | 'archived'

const SERVICE_FILTER_OPTIONS: { value: ServiceFilter; label: string }[] = [
  { value: 'alle', label: 'Alle' },
  { value: 'archived', label: 'Gearchiveerd' },
]

export function DienstenClient() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('alle')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [rowConfirmDelete, setRowConfirmDelete] = useState<Service | null>(null)
  const [bulkConfirm, setBulkConfirm] = useState<null | {
    action: 'archive' | 'unarchive' | 'delete'
    count: number
  }>(null)
  const [isMutating, setIsMutating] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadServices = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      // 'archived' view → alleen gearchiveerd, 'alle' → alleen actief
      params.set('include_archived', String(serviceFilter === 'archived'))
      const res = await fetch(`/api/services?${params.toString()}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Laden mislukt')
      const data = (await res.json()) as { services: Service[] }
      // Filter client-side op archived view: API geeft alles + gearchiveerd
      // mee bij include_archived=true; in 'archived' view tonen we alleen
      // gearchiveerd, in 'alle' view alleen niet-gearchiveerd
      const filtered =
        serviceFilter === 'archived'
          ? data.services.filter((s) => s.archived)
          : data.services.filter((s) => !s.archived)
      setServices(filtered)
      setSelectedIds(new Set())
    } catch (err) {
      console.error(err)
      toast.error('Kon diensten niet laden')
    } finally {
      setIsLoading(false)
    }
  }, [search, serviceFilter])

  useEffect(() => {
    void loadServices()
  }, [loadServices])

  const allSelected =
    services.length > 0 && services.every((s) => selectedIds.has(s.id))

  function toggleSelectAll(value: boolean) {
    setSelectedIds(value ? new Set(services.map((s) => s.id)) : new Set())
  }

  function toggleRow(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  async function archiveOne(service: Service) {
    const next = !service.archived
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, archived: next } : s))
    )
    try {
      const res = await fetch(`/api/services/${service.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archived: next }),
      })
      if (!res.ok) throw new Error('Mislukt')
      toast.success(next ? 'Dienst gearchiveerd' : 'Dienst teruggezet')
      void loadServices()
    } catch (err) {
      console.error(err)
      toast.error('Bijwerken mislukt')
      void loadServices()
    }
  }

  async function deleteOne(service: Service) {
    setIsMutating(true)
    try {
      const res = await fetch(`/api/services/${service.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Verwijderen mislukt')
      toast.success('Dienst verwijderd')
      setRowConfirmDelete(null)
      void loadServices()
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
      const res = await fetch('/api/services/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids: [...selectedIds] }),
      })
      if (!res.ok) throw new Error('Mislukt')
      const data = await res.json()
      const processed = data.processed ?? 0
      if (action === 'delete') {
        toast.success(`${processed} verwijderd`)
      } else if (action === 'archive') {
        toast.success(`${processed} gearchiveerd`)
      } else {
        toast.success(`${processed} teruggezet`)
      }
      setBulkConfirm(null)
      setSelectedIds(new Set())
      void loadServices()
    } catch (err) {
      console.error(err)
      toast.error('Bulk actie mislukt')
    } finally {
      setIsMutating(false)
    }
  }

  // Statistieken — meest gebruikt (al gesorteerd door API) + hoogste omzet
  const activeServices = services.filter((s) => !s.archived)
  const mostUsed = activeServices.find((s) => s.usage_count > 0) ?? null
  const highestRevenue = [...activeServices]
    .filter((s) => s.total_revenue > 0)
    .sort((a, b) => b.total_revenue - a.total_revenue)[0] ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading hidden text-2xl font-semibold lg:block">
          Diensten
        </h1>
        <Button
          size="sm"
          onClick={() => {
            setEditingService(null)
            setIsFormOpen(true)
          }}
        >
          <Plus />
          Nieuwe dienst
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          icon={<TrendingUp className="text-invora-primary size-5" />}
          label="Meest gebruikt"
          value={mostUsed?.name ?? 'Nog geen gebruik'}
          subtitle={
            mostUsed
              ? `${mostUsed.usage_count}× gefactureerd`
              : 'Voeg een dienst toe aan een factuur'
          }
        />
        <StatCard
          icon={<Euro className="text-invora-primary size-5" />}
          label="Hoogste omzet"
          value={highestRevenue?.name ?? 'Nog geen omzet'}
          subtitle={
            highestRevenue ? formatCurrency(highestRevenue.total_revenue) : '—'
          }
        />
      </div>

      {selectedIds.size > 0 ? (
        <BulkActionBar
          count={selectedIds.size}
          itemLabel="dienst"
          pluralLabel="diensten"
          showUnarchive={serviceFilter === 'archived'}
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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="text-muted-foreground pointer-events-none absolute top-2 left-2 size-4" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Zoek op naam of omschrijving"
                className="bg-background w-full pl-8"
              />
            </div>
            {/* Desktop: dropdown */}
            <div className="hidden lg:block">
              <Select
                value={serviceFilter}
                onValueChange={(v) => setServiceFilter(v as ServiceFilter)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_FILTER_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Mobiel: chip-rij */}
          <div className="lg:hidden">
            <FilterChips
              value={serviceFilter}
              options={SERVICE_FILTER_OPTIONS}
              onChange={setServiceFilter}
            />
          </div>
        </div>
      )}

      {/* Mobiel: simpele lijstweergave */}
      <div className="lg:hidden">
        <MobileServiceList
          services={services}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onToggleSelect={toggleRow}
          onOpenDetail={(id) => {
            setSelectedServiceId(id)
            setIsSheetOpen(true)
          }}
          onEdit={(service) => {
            setEditingService(service)
            setIsFormOpen(true)
          }}
          onArchive={(service) => void archiveOne(service)}
          onDelete={(service) => setRowConfirmDelete(service)}
          onCreateNew={() => {
            setEditingService(null)
            setIsFormOpen(true)
          }}
        />
      </div>

      {/* Desktop: tabel */}
      <div className="bg-invora-surface rounded-card hidden overflow-hidden border lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
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
                <th className="px-3 py-3">Prijs</th>
                <th className="px-3 py-3">Gebruik</th>
                <th className="px-3 py-3">Omzet</th>
                <th className="w-10 px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-t">
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-3 py-3">
                      <Skeleton className="h-6 w-6" />
                    </td>
                  </tr>
                ))
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-muted-foreground">
                        Nog geen diensten. Voeg je eerste dienst toe om snel
                        factuurregels in te kunnen vullen.
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditingService(null)
                          setIsFormOpen(true)
                        }}
                      >
                        <Plus />
                        Nieuwe dienst
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <ServiceRow
                    key={s.id}
                    service={s}
                    selected={selectedIds.has(s.id)}
                    onToggle={(checked) => toggleRow(s.id, checked)}
                    onOpenDetail={() => {
                      setSelectedServiceId(s.id)
                      setIsSheetOpen(true)
                    }}
                    onEdit={() => {
                      setEditingService(s)
                      setIsFormOpen(true)
                    }}
                    onArchive={() => archiveOne(s)}
                    onDelete={() => setRowConfirmDelete(s)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ServiceDetailSheet
        serviceId={selectedServiceId}
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open)
          if (!open) setSelectedServiceId(null)
        }}
        onEdit={(service) => {
          setIsSheetOpen(false)
          setSelectedServiceId(null)
          setEditingService(service)
          setIsFormOpen(true)
        }}
      />

      <ServiceFormDialog
        open={isFormOpen}
        initialData={editingService}
        onOpenChange={(open) => {
          setIsFormOpen(open)
          if (!open) setEditingService(null)
        }}
        onSaved={() => {
          setIsFormOpen(false)
          setEditingService(null)
          void loadServices()
        }}
      />

      <ConfirmDialog
        open={bulkConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setBulkConfirm(null)
        }}
        title={
          bulkConfirm?.action === 'delete'
            ? 'Diensten verwijderen?'
            : bulkConfirm?.action === 'archive'
              ? 'Diensten archiveren?'
              : 'Diensten dearchiveren?'
        }
        description={
          bulkConfirm?.action === 'delete'
            ? `Je staat op het punt ${bulkConfirm.count} dienst(en) te verwijderen. Historische factuurregels behouden hun tekst en prijs. Deze actie kan niet ongedaan worden gemaakt.`
            : bulkConfirm?.action === 'archive'
              ? `${bulkConfirm.count} dienst(en) worden gearchiveerd. Ze verdwijnen uit nieuwe factuur-suggesties.`
              : `${bulkConfirm?.count ?? 0} dienst(en) worden teruggezet.`
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

      <ConfirmDialog
        open={rowConfirmDelete !== null}
        onOpenChange={(open) => {
          if (!open) setRowConfirmDelete(null)
        }}
        title="Dienst verwijderen?"
        description={`Weet je zeker dat je ${rowConfirmDelete?.name ?? 'deze dienst'} wilt verwijderen? Historische factuurregels behouden de tekst en prijs.`}
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

interface ServiceRowProps {
  service: Service
  selected: boolean
  onToggle: (checked: boolean) => void
  onOpenDetail: () => void
  onEdit: () => void
  onArchive: () => void
  onDelete: () => void
}

function ServiceRow({
  service,
  selected,
  onToggle,
  onOpenDetail,
  onEdit,
  onArchive,
  onDelete,
}: ServiceRowProps) {
  const stop = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <tr
      onClick={onOpenDetail}
      className={cn(
        'cursor-pointer border-t transition-colors',
        'hover:bg-invora-background/60 even:bg-invora-background/30',
        service.archived && 'opacity-60'
      )}
    >
      <td className="px-3 py-3" onClick={stop}>
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => onToggle(Boolean(v))}
          aria-label={`Selecteer ${service.name}`}
        />
      </td>
      <td className="px-3 py-3">
        <div className="font-medium">
          {service.name}
          {service.archived && (
            <span className="text-muted-foreground ml-2 text-xs font-normal">
              [GEARCHIVEERD]
            </span>
          )}
        </div>
        {service.description && (
          <div className="text-muted-foreground line-clamp-1 text-xs">
            {service.description}
          </div>
        )}
      </td>
      <td className="text-muted-foreground px-3 py-3 text-xs">
        {service.category ?? '—'}
      </td>
      <td className="px-3 py-3 tabular-nums">
        {formatCurrency(service.price)}
        {service.price_type === 'hourly' && (
          <span className="text-muted-foreground text-xs"> / uur</span>
        )}
      </td>
      <td className="text-muted-foreground px-3 py-3 text-xs">
        {service.usage_count}× gefactureerd
      </td>
      <td className="px-3 py-3 tabular-nums">
        {formatCurrency(service.total_revenue)}
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
      </td>
    </tr>
  )
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtitle: string
}) {
  return (
    <div className="bg-invora-surface rounded-card border p-4">
      <div className="flex items-start gap-3">
        <div className="bg-invora-primary-light rounded-md p-2">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-muted-foreground text-xs">{label}</div>
          <div className="font-heading mt-0.5 truncate text-base font-semibold">
            {value}
          </div>
          <div className="text-muted-foreground mt-0.5 truncate text-xs">
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  )
}
