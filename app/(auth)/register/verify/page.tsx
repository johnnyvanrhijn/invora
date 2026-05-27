import type { Metadata } from 'next'
import Link from 'next/link'
import { ResendVerification } from './resend-verification'

export const metadata: Metadata = {
  title: 'Controleer je e-mail',
}

export default function VerifyPage() {
  return (
    <div className="space-y-6">
      <MailIllustration />

      <div className="space-y-2">
        <h1 className="text-invora-text text-2xl font-bold">Controleer je e-mail</h1>
        <p className="text-invora-text-muted text-sm">
          We hebben een bevestigingslink gestuurd naar je e-mailadres. Klik op de link in de
          e-mail om je account te activeren.
        </p>
      </div>

      <p className="text-invora-text-muted text-xs">
        Geen e-mail ontvangen? Controleer je spammap of stuur de e-mail opnieuw.
      </p>

      <ResendVerification />

      <p className="text-invora-text-muted pt-4 text-sm">
        <Link href="/login" className="text-invora-primary underline">
          Terug naar inloggen
        </Link>
      </p>
    </div>
  )
}

function MailIllustration() {
  return (
    <svg
      viewBox="0 0 200 140"
      className="h-32 w-full text-invora-primary"
      role="img"
      aria-label="Persoon bij envelop"
    >
      <rect x="50" y="50" width="100" height="65" rx="6" fill="#E8F2EC" stroke="currentColor" strokeWidth="2" />
      <path d="M52 53 L100 88 L148 53" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="35" cy="95" r="9" fill="#E2D6C1" stroke="currentColor" strokeWidth="2" />
      <path d="M27 105 Q30 122 35 122 Q40 122 43 105" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 95 L62 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polygon points="58,78 66,76 64,84" fill="currentColor" />
    </svg>
  )
}
