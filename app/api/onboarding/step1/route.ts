import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { onboardingStep1Schema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Authenticatie check — altijd getUser(), nooit getSession()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    const result = onboardingStep1Schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Ongeldige invoer', details: result.error.flatten() },
        { status: 400 }
      )
    }

    const { kvk_number, company_name, address_street, address_postal_code, address_city, iban } =
      result.data

    const { error: updateError } = await supabase
      .from('users')
      .update({
        kvk_number: kvk_number ? kvk_number : null,
        company_name,
        address_street,
        address_postal_code,
        address_city,
        iban: iban.toUpperCase().replace(/\s/g, ''),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Onboarding stap 1 update fout:', updateError)
      return NextResponse.json(
        { error: 'Opslaan mislukt. Probeer het opnieuw.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Onboarding stap 1 fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
