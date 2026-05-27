import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serviceSchema } from '@/lib/validations'

type RouteParams = { params: Promise<{ id: string }> }

// PUT /api/services/[id]
export async function PUT(request: Request, { params }: RouteParams) {
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
    const parsed = serviceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ongeldige invoer', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = parsed.data

    const { data: updated, error } = await supabase
      .from('services')
      .update({
        name: data.name,
        description: data.description || null,
        price: data.price,
        price_type: data.price_type,
        category: data.category || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error || !updated) {
      console.error('Dienst bewerken fout:', error)
      return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 })
    }

    return NextResponse.json({ service: updated })
  } catch (error) {
    console.error('Dienst bewerken onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

// DELETE /api/services/[id]
// invoice_lines.service_id is ON DELETE SET NULL — historische regels blijven.
export async function DELETE(_request: Request, { params }: RouteParams) {
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

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Dienst verwijderen fout:', error)
      return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Dienst verwijderen onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
