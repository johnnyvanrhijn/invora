'use client'

import { useEffect, useState } from 'react'
import { Mail, Pencil, FileText, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientCategoryBadge } from '@/components/app/clients/client-category-badge'
import { cn, formatCurrency, formatRelativeDate } from '@/lib/utils'
import type { ActivityEventType, ActivityLogEntry, ClientWithStats } from '@/types'

interface ClientDetailSheetProps {
  clientId: string | null
  onClose: () => void
  onEdit: (client: ClientWithStats) => void
  onCreateInvoice: (clientId: string) => void
}

interface DetailResponse {
  client: ClientWithStats
  activityLog: ActivityLogEntry[]
}

export function ClientDetailSheet({
  clientId,
  onClose,
  onEdit,
  onCreateInvoice,
}: ClientDetailSheetProps) {
  const [data, setData] = useState<DetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!clientId) {
      setData(null)
      return
    }
    let active = true
    setIsLoading(true)
    fetch(`/api/clients/${clientId}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Niet geladen')
        return (await res.json()) as DetailResponse
      })
      .then((resp) => {
        if (active) setData(resp)
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [clientId])

  const open = clientId !== null

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="data-[side=right]:sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle className="text-xl">
            {data?.client.name ?? (isLoading ? 'Laden...' : 'Cliënt')}
          </SheetTitle>
          {data && (
            <div className="mt-1 flex items-center gap-2">
              <ClientCategoryBadge category={data.client.category} />
              <span className="text-muted-foreground text-xs">
                {data.client.type === 'zakelijk' ? 'Zakelijk' : 'Particulier'}
              </span>
            </div>
          )}
          <SheetDescription className="sr-only">Cliënt details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          {isLoading || !data ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              <Section title="Basisgegevens">
                <DetailRow
                  label={
                    <span className="inline-flex items-center gap-1">
                      <Mail className="size-3.5" /> E-mail
                    </span>
                  }
                >
                  <a
                    href={`mailto:${data.client.email}`}
                    className="text-invora-primary-dark hover:underline"
                  >
                    {data.client.email}
                  </a>
                </DetailRow>
                {data.client.billing_email && (
                  <DetailRow label="Facturen gaan naar">
                    <a
                      href={`mailto:${data.client.billing_email}`}
                      className="text-invora-primary-dark hover:underline"
                    >
                      {data.client.billing_email}
                    </a>
                  </DetailRow>
                )}
                {data.client.phone && (
                  <DetailRow label="Telefoon">{data.client.phone}</DetailRow>
                )}
                <DetailRow label="Standaard dienst">
                  {data.client.default_service_name ?? (
                    <span className="text-muted-foreground">Geen</span>
                  )}
                </DetailRow>
              </Section>

              <Section title="Statistieken">
                <div className="grid grid-cols-3 gap-2">
                  <StatCard
                    label="Totale omzet"
                    value={formatCurrency(data.client.total_revenue)}
                  />
                  <StatCard
                    label="Gemiddeld"
                    value={formatCurrency(data.client.average_invoice_amount)}
                  />
                  <StatCard
                    label="Facturen"
                    value={String(data.client.invoice_count)}
                  />
                </div>
              </Section>

              <Section title="Activiteit">
                {data.activityLog.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nog geen activiteit voor deze cliënt
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.activityLog.map((entry) => (
                      <ActivityRow key={entry.id} entry={entry} />
                    ))}
                  </ul>
                )}
              </Section>
            </>
          )}
        </div>

        {data && (
          <div className="border-t p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => onEdit(data.client)}>
                <Pencil />
                Bewerken
              </Button>
              <Button onClick={() => onCreateInvoice(data.client.id)}>
                <FileText />
                Nieuwe factuur
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 border-t py-3 text-xs">
            <Loader2 className="size-3 animate-spin" />
            Cliëntdata laden
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>
      <div className="space-y-1.5 text-sm">{children}</div>
    </section>
  )
}

function DetailRow({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-foreground text-right">{children}</span>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-invora-background rounded-card border p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className="font-heading mt-1 text-lg font-semibold tabular-nums">
        {value}
      </div>
    </div>
  )
}

const EVENT_COLORS: Record<ActivityEventType, string> = {
  factuur_verstuurd: 'bg-blue-500',
  betaling_ontvangen: 'bg-invora-primary',
  herinnering_verstuurd: 'bg-amber-500',
  creditnota_aangemaakt: 'bg-muted-foreground',
  factuur_te_laat: 'bg-red-500',
  stornering_ontvangen: 'bg-red-500',
}

function ActivityRow({ entry }: { entry: ActivityLogEntry }) {
  const color = EVENT_COLORS[entry.event_type] ?? 'bg-muted-foreground'
  return (
    <li className="flex items-start gap-2.5">
      <span
        className={cn('mt-1.5 inline-block size-2 shrink-0 rounded-full', color)}
        aria-hidden
      />
      <div className="flex-1 text-sm">
        <p className="text-foreground">{entry.description}</p>
        <p className="text-muted-foreground text-xs">
          {formatRelativeDate(entry.created_at)}
        </p>
      </div>
    </li>
  )
}
