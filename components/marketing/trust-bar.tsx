import { Lock, Landmark, Star, Heart } from 'lucide-react'

const ITEMS = [
  { icon: Heart, label: 'Voor zorgprofessionals in Nederland' },
  { icon: Lock, label: 'AVG-conform · EU data' },
  { icon: Landmark, label: 'iDEAL-betalingen' },
  { icon: Star, label: '30 dagen gratis' },
]

export function TrustBar() {
  return (
    <div className="bg-invora-surface border-border border-y">
      <div className="text-invora-text-muted mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-5 text-xs sm:px-6 sm:text-sm lg:px-8">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 whitespace-nowrap">
            <Icon className="text-invora-primary size-4" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
