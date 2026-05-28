'use client'

import { useEffect, useState } from 'react'
import { Pencil, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import type { Service } from '@/types'

interface ServiceDetailSheetProps {
  serviceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (service: Service) => void
}

export function ServiceDetailSheet({
  serviceId,
  open,
  onOpenChange,
  onEdit,
}: ServiceDetailSheetProps) {
  const [service, setService] = useState<Service | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!serviceId || !open) {
      setService(null)
      return
    }

    let active = true
    setIsLoading(true)
    fetch(`/api/services/${serviceId}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Niet geladen')
        return (await res.json()) as { service: Service }
      })
      .then((resp) => {
        if (active) setService(resp.service)
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
  }, [serviceId, open])

  const priceTypeLabel =
    service?.price_type === 'hourly' ? 'Uurtarief' : 'Vaste prijs'

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="data-[side=right]:sm:max-w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-xl">
            {service?.name ?? (isLoading ? 'Laden...' : 'Dienst')}
          </SheetTitle>
          {service && (
            <div className="mt-1 flex items-center gap-2">
              <span className="bg-invora-primary-light text-invora-primary rounded-full px-3 py-1 text-xs font-medium">
                {priceTypeLabel}
              </span>
              {service.archived && (
                <span className="text-muted-foreground text-xs">
                  [GEARCHIVEERD]
                </span>
              )}
            </div>
          )}
          <SheetDescription className="sr-only">Dienst details</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          {isLoading || !service ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <Section title="Details">
                <DetailRow label="Prijs">
                  <span className="tabular-nums">
                    {formatCurrency(service.price)}
                    {service.price_type === 'hourly' && (
                      <span className="text-muted-foreground"> / uur</span>
                    )}
                  </span>
                </DetailRow>
                <DetailRow label="Categorie">
                  {service.category ?? (
                    <span className="text-muted-foreground">—</span>
                  )}
                </DetailRow>
                <DetailRow label="Omschrijving">
                  {service.description ? (
                    <span className="whitespace-pre-line">{service.description}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </DetailRow>
              </Section>

              <Section title="Statistieken">
                <div className="grid grid-cols-2 gap-3">
                  <StatBlock
                    label="Gebruik"
                    value={`${service.usage_count}×`}
                  />
                  <StatBlock
                    label="Totale omzet"
                    value={formatCurrency(service.total_revenue)}
                  />
                </div>
              </Section>
            </>
          )}
        </div>

        {service && (
          <div className="border-t p-4">
            <Button className="w-full" onClick={() => onEdit(service)}>
              <Pencil />
              Bewerken
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-muted-foreground flex items-center justify-center gap-2 border-t py-3 text-xs">
            <Loader2 className="size-3 animate-spin" />
            Dienst laden
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

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-invora-primary-light/40 rounded-lg p-3 text-center">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-invora-primary mt-0.5 text-lg font-bold tabular-nums">
        {value}
      </p>
    </div>
  )
}
