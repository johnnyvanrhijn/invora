import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Invora',
}

// Server-side auth check voor /welcome en /onboarding. Onboarding-status
// wordt per page bepaald (welcome + onboarding redirect bij completed=true
// naar /dashboard).
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <div className="bg-invora-background min-h-screen">{children}</div>
}
