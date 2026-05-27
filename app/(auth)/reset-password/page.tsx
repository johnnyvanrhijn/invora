import type { Metadata } from 'next'
import { ResetPasswordForm } from './reset-password-form'

export const metadata: Metadata = {
  title: 'Nieuw wachtwoord instellen',
}

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-invora-text text-2xl font-bold">Nieuw wachtwoord instellen</h1>
        <p className="text-invora-text-muted mt-1 text-sm">
          Kies een sterk wachtwoord van minimaal 8 tekens.
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  )
}
