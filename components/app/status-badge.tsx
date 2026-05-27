import { cn } from '@/lib/utils'
import type { InvoiceStatus } from '@/types'

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; classes: string }> = {
  concept: { label: 'Concept', classes: 'bg-gray-100 text-gray-600' },
  verstuurd: {
    label: 'Openstaand',
    classes: 'bg-invora-status-open/10 text-invora-status-open',
  },
  betaald: {
    label: 'Betaald',
    classes: 'bg-invora-primary-light text-invora-primary',
  },
  te_laat: { label: 'Te laat', classes: 'bg-red-50 text-invora-error' },
  gecrediteerd: { label: 'Gecrediteerd', classes: 'bg-gray-100 text-gray-500' },
}

interface StatusBadgeProps {
  status: InvoiceStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}
