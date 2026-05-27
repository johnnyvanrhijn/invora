import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { getClientListStats, getServiceNamesByIds } from '@/lib/clients/stats'
import type { ClientCategory, ClientListItem, ClientType, PaginatedResult } from '@/types'

// GET /api/clients
// Query: page, search, category (alle|actief|inactief|vip|archived)
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
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
    const search = (searchParams.get('search') ?? '').trim()
    const category = searchParams.get('category') ?? 'alle'

    const offset = (page - 1) * DEFAULT_PAGE_SIZE

    let query = supabase
      .from('clients')
      .select(
        'id, type, name, email, category, archived, default_service_id',
        { count: 'exact' }
      )
      .eq('user_id', user.id)

    // Archived dimensie
    if (category === 'archived') {
      query = query.eq('archived', true)
    } else {
      query = query.eq('archived', false)
      if (category === 'actief' || category === 'inactief' || category === 'vip') {
        query = query.eq('category', category)
      }
    }

    // Zoekfilter op naam OF email
    if (search.length > 0) {
      const safe = search.replace(/[%_]/g, '\\$&')
      query = query.or(`name.ilike.%${safe}%,email.ilike.%${safe}%`)
    }

    query = query.order('name', { ascending: true }).range(offset, offset + DEFAULT_PAGE_SIZE - 1)

    const { data: rows, count, error } = await query
    if (error) {
      console.error('Cliëntenlijst fout:', error)
      return NextResponse.json({ error: 'Kon cliënten niet ophalen' }, { status: 500 })
    }

    const clientIds = (rows ?? []).map((r) => r.id)
    const serviceIds = (rows ?? [])
      .map((r) => r.default_service_id)
      .filter((id): id is string => Boolean(id))

    const [statsMap, serviceNames] = await Promise.all([
      getClientListStats(supabase, user.id, clientIds),
      getServiceNamesByIds(supabase, user.id, [...new Set(serviceIds)]),
    ])

    const data: ClientListItem[] = (rows ?? []).map((r) => {
      const stat = statsMap.get(r.id) ?? {
        total_revenue: 0,
        last_invoice_date: null,
        session_count: 0,
      }
      return {
        id: r.id,
        type: r.type as ClientType,
        name: r.name,
        email: r.email,
        category: r.category as ClientCategory,
        archived: r.archived,
        default_service_id: r.default_service_id,
        default_service_name: r.default_service_id
          ? (serviceNames.get(r.default_service_id) ?? null)
          : null,
        session_count: stat.session_count,
        total_revenue: stat.total_revenue,
        last_invoice_date: stat.last_invoice_date,
      }
    })

    const total = count ?? data.length
    const hasMore = offset + data.length < total

    const result: PaginatedResult<ClientListItem> = {
      data,
      total,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      hasMore,
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Cliëntenlijst onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

// POST /api/clients — nieuwe cliënt aanmaken
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
    const force = body?.force === true
    const parsed = clientSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ongeldige invoer', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = parsed.data

    // Duplicaat-check op e-mail (alleen actieve cliënten)
    if (!force) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('email', data.email)
        .eq('archived', false)
        .maybeSingle()

      if (existing) {
        return NextResponse.json(
          {
            error: 'duplicate',
            duplicate: true,
            existingName: existing.name,
            existingId: existing.id,
          },
          { status: 409 }
        )
      }
    }

    const isZakelijk = data.type === 'zakelijk'

    const insertPayload = {
      user_id: user.id,
      type: data.type,
      name: data.name,
      email: data.email,
      phone: emptyToNull(data.phone),
      address_street: emptyToNull(data.address_street),
      address_postal_code: emptyToNull(data.address_postal_code),
      address_city: emptyToNull(data.address_city),
      address_country: data.address_country || 'NL',
      billing_email: emptyToNull(data.billing_email),
      category: data.category,
      default_service_id: data.default_service_id ?? null,
      discount_type: data.discount_type ?? null,
      discount_value: data.discount_value ?? null,
      administrative_note: emptyToNull(data.administrative_note),

      // Zakelijk: alleen vullen als type zakelijk is
      company_kvk_number: isZakelijk ? emptyToNull(data.company_kvk_number) : null,
      btw_number: isZakelijk ? emptyToNull(data.btw_number) : null,
      payment_term_days: isZakelijk ? (data.payment_term_days ?? null) : null,
      contact_name: isZakelijk ? emptyToNull(data.contact_name) : null,
      contact_email: isZakelijk ? emptyToNull(data.contact_email) : null,
      billing_address_street: isZakelijk ? emptyToNull(data.billing_address_street) : null,
      billing_address_postal_code: isZakelijk
        ? emptyToNull(data.billing_address_postal_code)
        : null,
      billing_address_city: isZakelijk ? emptyToNull(data.billing_address_city) : null,
    }

    const { data: created, error } = await supabase
      .from('clients')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error || !created) {
      console.error('Cliënt aanmaken fout:', error)
      return NextResponse.json({ error: 'Aanmaken mislukt' }, { status: 500 })
    }

    return NextResponse.json({ client: created }, { status: 201 })
  } catch (error) {
    console.error('Cliënt aanmaken onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}
