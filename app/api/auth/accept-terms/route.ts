import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { termsAcceptanceSchema } from '@/lib/validations'

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
    const result = termsAcceptanceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Accepteer alle voorwaarden' }, { status: 400 })
    }

    const now = new Date().toISOString()

    const updatePayload: {
      terms_accepted_at: string
      privacy_accepted_at: string
      updated_at: string
      first_name?: string
    } = {
      terms_accepted_at: now,
      privacy_accepted_at: now,
      updated_at: now,
    }

    if (result.data.first_name) {
      updatePayload.first_name = result.data.first_name
    }

    const { error } = await supabase.from('users').update(updatePayload).eq('id', user.id)

    if (error) {
      console.error('Accept-terms update fout:', error)
      return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Accept-terms fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
