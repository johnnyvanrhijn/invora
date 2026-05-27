import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Inloggen',
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-invora-text text-2xl font-bold">Inloggen</h1>
        <p className="text-invora-text-muted mt-1 text-sm">
          Nog geen account?{' '}
          <Link
            href="/register"
            className="text-invora-primary hover:text-invora-primary-dark underline"
          >
            Aanmelden →
          </Link>
        </p>
      </div>
      <LoginForm />
    </div>
  )
}
