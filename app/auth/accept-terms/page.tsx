import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AcceptTermsForm } from './accept-terms-form'

export const metadata: Metadata = {
  title: 'Nog één stap',
}

// Extraheert een mogelijke voornaam uit OAuth-metadata.
// Volgorde: given_name → eerste woord van name → eerste woord van full_name.
// Title-case: 'johnny van rhijn' → 'Johnny'.
function suggestFirstName(meta: Record<string, unknown> | undefined): string {
  if (!meta) return ''
  const candidates = [meta.given_name, meta.name, meta.full_name]
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    const firstWord = candidate.trim().split(/\s+/)[0]
    if (firstWord) {
      return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()
    }
  }
  return ''
}

export default async function AcceptTermsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, terms_accepted_at, onboarding_completed')
    .eq('id', user.id)
    .single()

  // Voorwaarden al geaccepteerd → ga verder in de flow
  if (profile?.terms_accepted_at) {
    if (!profile.onboarding_completed) redirect('/welcome')
    redirect('/dashboard')
  }

  const storedFirstName = profile?.first_name?.trim() ?? ''
  const needsFirstName = storedFirstName === ''
  const suggestedFirstName = needsFirstName
    ? suggestFirstName(user.user_metadata)
    : storedFirstName

  return (
    <div className="bg-invora-background flex min-h-screen items-center justify-center px-6 py-12">
      <div className="bg-invora-surface rounded-card border-border shadow-card w-full max-w-md space-y-6 border p-8">
        <div className="space-y-2">
          <span className="text-invora-primary text-xl font-bold">Invora</span>
          <h1 className="text-invora-text text-2xl font-bold">
            {needsFirstName ? 'Welkom! Nog één stap.' : `Welkom, ${storedFirstName}! Nog één stap.`}
          </h1>
          <p className="text-invora-text-muted text-sm">
            {needsFirstName
              ? 'Vul je voornaam in en ga akkoord met onze voorwaarden om Invora te gebruiken.'
              : 'Om Invora te gebruiken moet je akkoord gaan met onze voorwaarden.'}
          </p>
        </div>

        <AcceptTermsForm
          needsFirstName={needsFirstName}
          suggestedFirstName={suggestedFirstName}
        />
      </div>
    </div>
  )
}
