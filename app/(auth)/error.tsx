'use client'

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-invora-text text-lg font-semibold">Er is iets misgegaan</h2>
      <p className="text-invora-text-muted text-sm">{error.message}</p>
      <button onClick={reset} className="text-invora-primary text-sm underline">
        Probeer opnieuw
      </button>
    </div>
  )
}
