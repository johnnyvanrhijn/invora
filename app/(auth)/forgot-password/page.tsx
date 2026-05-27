import type { Metadata } from 'next'
import { ForgotPasswordForm } from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Wachtwoord vergeten',
}

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-invora-text text-2xl font-bold">Wachtwoord vergeten</h1>
        <p className="text-invora-text-muted mt-1 text-sm">
          Vul je e-mailadres in. We sturen je een link om je wachtwoord te resetten.
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
