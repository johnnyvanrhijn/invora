'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <h2 className="text-invora-text text-xl font-semibold">Er is iets misgegaan</h2>
      <p className="text-invora-text-muted max-w-sm text-sm">
        Er is een onverwachte fout opgetreden. Probeer het opnieuw.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-button bg-invora-primary hover:bg-invora-primary-dark px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        Opnieuw proberen
      </button>
    </div>
  )
}
