import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('terms_accepted_at, onboarding_completed')
          .eq('id', user.id)
          .single()

        // Geen voorwaarden geaccepteerd → terms acceptatie scherm
        if (!profile?.terms_accepted_at) {
          return NextResponse.redirect(`${origin}/auth/accept-terms`)
        }

        // Voorwaarden ok, onboarding nog niet klaar → welkomst
        if (!profile?.onboarding_completed) {
          return NextResponse.redirect(`${origin}/welcome`)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
