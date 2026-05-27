import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  className?: string
}

export function EmptyState({ className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-6 py-12 text-center', className)}>
      <EmptyStateIllustration />
      <p className="text-invora-text text-lg font-medium">
        Stuur je eerste factuur in minder dan 2 minuten
      </p>
      <Link
        id="empty-state-cta"
        href="/facturen/nieuw"
        className={cn(
          buttonVariants({ size: 'lg' }),
          'from-invora-primary to-invora-primary-dark relative h-12 bg-gradient-to-br px-6 text-base text-white'
        )}
      >
        Maak eerste factuur aan →
      </Link>
    </div>
  )
}

function EmptyStateIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-40 w-40"
      role="img"
      aria-label="Persoon wijst naar startknop"
    >
      <circle cx="100" cy="180" r="80" fill="#E8F2EC" />
      {/* Hoofd */}
      <circle cx="80" cy="60" r="18" fill="#D4B896" />
      {/* Torso */}
      <path d="M60 95 Q58 130 62 160 L98 160 Q102 130 100 95 Z" fill="#7B9E87" />
      {/* Wijzende arm */}
      <path
        d="M98 100 L155 95"
        stroke="#D4B896"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="158" cy="95" r="5" fill="#D4B896" />
      {/* Andere arm */}
      <path
        d="M62 100 L58 140"
        stroke="#D4B896"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Pijl naar knop */}
      <polygon points="165,89 175,95 165,101" fill="#5E8A6E" />
    </svg>
  )
}
