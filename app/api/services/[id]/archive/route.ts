import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { archiveSchema } from '@/lib/validations'

type RouteParams = { params: Promise<{ id: string }> }

// POST /api/services/[id]/archive  body: { archived: boolean }
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const parsed = archiveSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Ongeldige invoer' }, { status: 400 })
    }
    const { archived } = parsed.data

    const { error } = await supabase
      .from('services')
      .update({
        archived,
        archived_at: archived ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Dienst archive fout:', error)
      return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dienst archive onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
