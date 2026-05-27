import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Server-side auth + onboarding-check voor alle /dashboard, /facturen, /clienten,
// /uren, /diensten, /rapporten, /instellingen routes. Middleware vangt alleen
// niet-ingelogde requests op (cookie-presence), de echte sessieverificatie
// gebeurt hier waar Supabase SDK in Node-runtime kan draaien.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect('/welcome')
  }

  return <div className="bg-invora-background min-h-screen">{children}</div>
}
