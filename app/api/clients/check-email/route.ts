import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/clients/check-email?email=foo@bar.nl&exclude_id=...
// Returnt { exists: boolean, name?: string, id?: string }
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = (searchParams.get('email') ?? '').trim().toLowerCase()
    const excludeId = searchParams.get('exclude_id')

    if (!email) {
      return NextResponse.json({ exists: false })
    }

    let query = supabase
      .from('clients')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('archived', false)
      .eq('email', email)
      .limit(1)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data } = await query.maybeSingle()
    if (!data) {
      return NextResponse.json({ exists: false })
    }
    return NextResponse.json({ exists: true, name: data.name, id: data.id })
  } catch (error) {
    console.error('Cliënt check-email onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
