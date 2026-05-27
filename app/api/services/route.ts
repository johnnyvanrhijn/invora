import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serviceSchema } from '@/lib/validations'
import { getServiceRevenueMap } from '@/lib/services/stats'
import type { Service, ServicePriceType } from '@/types'

// GET /api/services?search=&include_archived=true|false
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
    const search = (searchParams.get('search') ?? '').trim()
    const includeArchived = searchParams.get('include_archived') === 'true'

    let query = supabase
      .from('services')
      .select('*')
      .eq('user_id', user.id)

    if (!includeArchived) {
      query = query.eq('archived', false)
    }

    if (search.length > 0) {
      const safe = search.replace(/[%_]/g, '\\$&')
      query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`)
    }

    query = query
      .order('usage_count', { ascending: false })
      .order('name', { ascending: true })

    const { data: rows, error } = await query
    if (error) {
      console.error('Diensten lijst fout:', error)
      return NextResponse.json({ error: 'Kon diensten niet ophalen' }, { status: 500 })
    }

    const serviceIds = (rows ?? []).map((r) => r.id)
    const revenueMap = await getServiceRevenueMap(supabase, user.id, serviceIds)

    const services: Service[] = (rows ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      price: Number(r.price),
      price_type: r.price_type as ServicePriceType,
      category: r.category,
      usage_count: r.usage_count,
      archived: r.archived,
      archived_at: r.archived_at,
      created_at: r.created_at,
      updated_at: r.updated_at,
      total_revenue: revenueMap.get(r.id) ?? 0,
    }))

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Diensten lijst onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

// POST /api/services — nieuwe dienst aanmaken
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
    const parsed = serviceSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ongeldige invoer', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = parsed.data

    const { data: created, error } = await supabase
      .from('services')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description || null,
        price: data.price,
        price_type: data.price_type,
        category: data.category || null,
      })
      .select('*')
      .single()

    if (error || !created) {
      console.error('Dienst aanmaken fout:', error)
      return NextResponse.json({ error: 'Aanmaken mislukt' }, { status: 500 })
    }

    return NextResponse.json({ service: created }, { status: 201 })
  } catch (error) {
    console.error('Dienst aanmaken onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
