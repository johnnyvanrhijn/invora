import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { onboardingStep2Schema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    const result = onboardingStep2Schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Selecteer een BTW-status' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        btw_vrijgesteld: result.data.btw_vrijgesteld,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Onboarding stap 2 update fout:', updateError)
      return NextResponse.json(
        { error: 'Opslaan mislukt. Probeer het opnieuw.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding stap 2 fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
