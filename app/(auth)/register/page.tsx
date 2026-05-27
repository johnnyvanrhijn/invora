import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from './register-form'

export const metadata: Metadata = {
  title: 'Account aanmaken',
}

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-invora-text text-2xl font-bold">Account aanmaken</h1>
        <p className="text-invora-text-muted mt-1 text-sm">
          Al een account?{' '}
          <Link
            href="/login"
            className="text-invora-primary hover:text-invora-primary-dark underline"
          >
            Inloggen
          </Link>
        </p>
      </div>
      <RegisterForm />
    </div>
  )
}
