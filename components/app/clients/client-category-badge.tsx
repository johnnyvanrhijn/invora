import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { ClientCategory } from '@/types'

const LABELS: Record<ClientCategory, string> = {
  actief: 'Actief',
  inactief: 'Inactief',
  vip: 'VIP',
}

const CLASS_NAMES: Record<ClientCategory, string> = {
  actief: 'bg-invora-primary-light text-invora-primary-dark border-invora-primary/20',
  inactief: 'bg-muted text-muted-foreground border-border',
  vip: 'bg-amber-100 text-amber-800 border-amber-200',
}

export function ClientCategoryBadge({ category }: { category: ClientCategory }) {
  return (
    <Badge variant="outline" className={cn('border', CLASS_NAMES[category])}>
      {LABELS[category]}
    </Badge>
  )
}
