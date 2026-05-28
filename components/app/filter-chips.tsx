'use client'

import { cn } from '@/lib/utils'

export interface FilterChipOption<T extends string> {
  value: T
  label: string
}

interface FilterChipsProps<T extends string> {
  value: T
  options: ReadonlyArray<FilterChipOption<T>>
  onChange: (value: T) => void
  className?: string
}

export function FilterChips<T extends string>({
  value,
  options,
  onChange,
  className,
}: FilterChipsProps<T>) {
  return (
    <div className={cn('scrollbar-hide -mx-4 overflow-x-auto pb-1', className)}>
      <div className="flex min-w-max gap-2 px-4">
        {options.map((opt) => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                active
                  ? 'bg-invora-primary text-white'
                  : 'bg-background border-border text-foreground border'
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
