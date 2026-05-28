import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serviceSchema } from '@/lib/validations'
import { getServiceRevenueMap } from '@/lib/services/stats'
import type { Service, ServicePriceType } from '@/types'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/services/[id]
export async function GET(_request: Request, { params }: RouteParams) {
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

    const { data: row, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Dienst ophalen fout:', error)
      return NextResponse.json({ error: 'Kon dienst niet ophalen' }, { status: 500 })
    }
    if (!row) {
      return NextResponse.json({ error: 'Dienst niet gevonden' }, { status: 404 })
    }

    const revenueMap = await getServiceRevenueMap(supabase, user.id, [row.id])

    const service: Service = {
      id: row.id,
      name: row.name,
      description: row.description,
      price: Number(row.price),
      price_type: row.price_type as ServicePriceType,
      category: row.category,
      usage_count: row.usage_count,
      archived: row.archived,
      archived_at: row.archived_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      total_revenue: revenueMap.get(row.id) ?? 0,
    }

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Dienst ophalen onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

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
