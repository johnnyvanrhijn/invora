import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations'
import { getClientDetailStats, getServiceNamesByIds } from '@/lib/clients/stats'
import type {
  ActivityLogEntry,
  ActivityEventType,
  ClientCategory,
  ClientType,
  ClientWithStats,
  DiscountType,
} from '@/types'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/clients/[id]
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

    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('Cliënt ophalen fout:', error)
      return NextResponse.json({ error: 'Kon cliënt niet ophalen' }, { status: 500 })
    }
    if (!client) {
      return NextResponse.json({ error: 'Cliënt niet gevonden' }, { status: 404 })
    }

    const [stats, serviceNames, { data: activities }] = await Promise.all([
      getClientDetailStats(supabase, user.id, id),
      client.default_service_id
        ? getServiceNamesByIds(supabase, user.id, [client.default_service_id])
        : Promise.resolve(new Map<string, string>()),
      supabase
        .from('activity_log')
        .select('id, event_type, description, metadata, created_at')
        .eq('user_id', user.id)
        .eq('client_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    const activityLog: ActivityLogEntry[] = (activities ?? []).map((a) => ({
      id: a.id,
      event_type: a.event_type as ActivityEventType,
      description: a.description,
      metadata: a.metadata as Record<string, unknown> | null,
      created_at: a.created_at,
    }))

    const enriched: ClientWithStats = {
      id: client.id,
      type: client.type as ClientType,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address_street: client.address_street,
      address_postal_code: client.address_postal_code,
      address_city: client.address_city,
      address_country: client.address_country,
      billing_email: client.billing_email,
      billing_address_street: client.billing_address_street,
      billing_address_postal_code: client.billing_address_postal_code,
      billing_address_city: client.billing_address_city,
      company_kvk_number: client.company_kvk_number,
      btw_number: client.btw_number,
      payment_term_days: client.payment_term_days,
      contact_name: client.contact_name,
      contact_email: client.contact_email,
      default_service_id: client.default_service_id,
      discount_type: client.discount_type as DiscountType | null,
      discount_value: client.discount_value,
      category: client.category as ClientCategory,
      administrative_note: client.administrative_note,
      archived: client.archived,
      archived_at: client.archived_at,
      created_at: client.created_at,
      updated_at: client.updated_at,
      total_revenue: stats.total_revenue,
      average_invoice_amount: stats.average_invoice_amount,
      invoice_count: stats.invoice_count,
      last_invoice_date: stats.last_invoice_date,
      default_service_name: client.default_service_id
        ? (serviceNames.get(client.default_service_id) ?? null)
        : null,
    }

    return NextResponse.json({ client: enriched, activityLog })
  } catch (error) {
    console.error('Cliënt detail onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

// PUT /api/clients/[id]
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
    const force = body?.force === true
    const parsed = clientSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ongeldige invoer', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const data = parsed.data

    // Eigenaarschapscheck
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Cliënt niet gevonden' }, { status: 404 })
    }

    // Duplicaat check (exclude self)
    if (!force) {
      const { data: duplicate } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('email', data.email)
        .eq('archived', false)
        .neq('id', id)
        .maybeSingle()
      if (duplicate) {
        return NextResponse.json(
          {
            error: 'duplicate',
            duplicate: true,
            existingName: duplicate.name,
            existingId: duplicate.id,
          },
          { status: 409 }
        )
      }
    }

    const isZakelijk = data.type === 'zakelijk'

    const updatePayload = {
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

      updated_at: new Date().toISOString(),
    }

    const { data: updated, error } = await supabase
      .from('clients')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error || !updated) {
      console.error('Cliënt bewerken fout:', error)
      return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 })
    }

    return NextResponse.json({ client: updated })
  } catch (error) {
    console.error('Cliënt bewerken onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

// DELETE /api/clients/[id]
// Blokkeert verwijderen als er openstaande facturen zijn (verstuurd | te_laat)
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

    // Eigenaarschap
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!existing) {
      return NextResponse.json({ error: 'Cliënt niet gevonden' }, { status: 404 })
    }

    // Openstaande facturen check
    const { count: openCount } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('client_id', id)
      .in('status', ['verstuurd', 'te_laat'])

    if ((openCount ?? 0) > 0) {
      return NextResponse.json(
        {
          error: 'has_open_invoices',
          hasOpenInvoices: true,
          message: 'Kan niet verwijderen: er zijn openstaande facturen.',
        },
        { status: 409 }
      )
    }

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Cliënt verwijderen fout:', error)
      return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cliënt verwijderen onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}

function emptyToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}
