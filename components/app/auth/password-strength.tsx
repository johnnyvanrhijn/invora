'use client'

import { cn } from '@/lib/utils'

type Strength = 'too_short' | 'weak' | 'medium' | 'strong'

function evaluate(password: string): Strength {
  if (password.length < 8) return 'too_short'
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSymbol = /[^a-zA-Z0-9]/.test(password)
  const variety = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length

  if (password.length >= 12 && variety >= 3) return 'strong'
  if (variety >= 2) return 'medium'
  return 'weak'
}

const LABEL: Record<Strength, string> = {
  too_short: 'Te kort',
  weak: 'Zwak',
  medium: 'Gemiddeld',
  strong: 'Sterk',
}

const COLOR: Record<Strength, string> = {
  too_short: 'bg-invora-error',
  weak: 'bg-invora-warning',
  medium: 'bg-yellow-500',
  strong: 'bg-invora-success',
}

const WIDTH: Record<Strength, string> = {
  too_short: 'w-1/4',
  weak: 'w-2/4',
  medium: 'w-3/4',
  strong: 'w-full',
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const strength = evaluate(password)

  return (
    <div className="space-y-1">
      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
        <div
          className={cn('h-full rounded-full transition-all duration-200', COLOR[strength], WIDTH[strength])}
        />
      </div>
      <p className="text-invora-text-muted text-xs">{LABEL[strength]}</p>
    </div>
  )
}
