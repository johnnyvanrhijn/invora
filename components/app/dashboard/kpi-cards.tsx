import { TrendingUp, Clock, FileText } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { StatusBadge } from '@/components/app/status-badge'
import type { DashboardLatestInvoice } from '@/types'

interface KpiCardsProps {
  omzetDezeMaand: number
  openstaandBedrag: number
  laatsteFacturen: DashboardLatestInvoice[]
}

export function KpiCards({ omzetDezeMaand, openstaandBedrag, laatsteFacturen }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      <KpiCard
        icon={<TrendingUp className="size-5" />}
        iconWrapClass="bg-invora-primary-light text-invora-primary"
        cardClass="bg-invora-primary-light/30"
        label="Omzet deze maand"
        value={formatCurrency(omzetDezeMaand)}
      />
      <KpiCard
        icon={<Clock className="size-5" />}
        iconWrapClass="bg-amber-100 text-amber-600"
        cardClass="bg-amber-50"
        label="Openstaand"
        value={formatCurrency(openstaandBedrag)}
      />
      <RecentInvoicesCard invoices={laatsteFacturen} />
    </div>
  )
}

interface KpiCardProps {
  icon: React.ReactNode
  iconWrapClass: string
  cardClass: string
  label: string
  value: string
}

function KpiCard({ icon, iconWrapClass, cardClass, label, value }: KpiCardProps) {
  return (
    <div className={cn('rounded-card shadow-card p-5 md:p-6', cardClass)}>
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-full',
          iconWrapClass
        )}
      >
        {icon}
      </div>
      <p className="text-invora-text-muted mt-4 text-sm font-medium">{label}</p>
      <p className="text-invora-text mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}

function RecentInvoicesCard({ invoices }: { invoices: DashboardLatestInvoice[] }) {
  return (
    <div className="rounded-card shadow-card bg-blue-50 p-5 md:p-6">
      <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <FileText className="size-5" />
      </div>
      <p className="text-invora-text-muted mt-4 text-sm font-medium">Recente facturen</p>

      {invoices.length === 0 ? (
        <p className="text-invora-text-muted mt-3 text-sm">Nog geen facturen</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {invoices.slice(0, 3).map((invoice) => (
            <li key={invoice.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-invora-text truncate font-medium">
                {invoice.client_name ?? 'Onbekend'}
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-invora-text font-medium tabular-nums">
                  {formatCurrency(invoice.total)}
                </span>
                <StatusBadge status={invoice.status} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
