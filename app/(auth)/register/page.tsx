import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RegisterForm } from './register-form'

export const metadata: Metadata = {
  title: 'Account aanmaken',
}

export default async function RegisterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Al ingelogd → direct naar dashboard (zie /login voor reden).
  if (user) {
    redirect('/dashboard')
  }

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
