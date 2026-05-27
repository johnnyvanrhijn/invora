'use client'

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="bg-invora-background flex min-h-screen items-center justify-center px-6">
      <div className="space-y-4 text-center">
        <h2 className="text-invora-text text-lg font-semibold">Er is iets misgegaan</h2>
        <p className="text-invora-text-muted text-sm">{error.message}</p>
        <button onClick={reset} className="text-invora-primary text-sm underline">
          Probeer opnieuw
        </button>
      </div>
    </div>
  )
}
