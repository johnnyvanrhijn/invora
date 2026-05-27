import Papa from 'papaparse'
import { createClient } from '@/lib/supabase/server'
import { getClientListStats } from '@/lib/clients/stats'

// GET /api/clients/export — CSV export van alle niet-gearchiveerde cliënten.
// PDF export is in Fase 4 bewust overgeslagen — komt in Fase 5 met Puppeteer.
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Niet ingelogd' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { data: clients, error } = await supabase
      .from('clients')
      .select(
        'id, type, name, email, phone, category, address_street, address_postal_code, address_city'
      )
      .eq('user_id', user.id)
      .eq('archived', false)
      .order('name', { ascending: true })

    if (error) {
      console.error('Cliënt CSV export fout:', error)
      return new Response(JSON.stringify({ error: 'Exporteren mislukt' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const clientIds = (clients ?? []).map((c) => c.id)
    const stats = await getClientListStats(supabase, user.id, clientIds)

    const rows = (clients ?? []).map((c) => {
      const s = stats.get(c.id)
      return {
        Naam: c.name,
        Email: c.email,
        Telefoon: c.phone ?? '',
        Type: c.type,
        Categorie: c.category,
        Straat: c.address_street ?? '',
        Postcode: c.address_postal_code ?? '',
        Stad: c.address_city ?? '',
        'Totale omzet': formatNumber(s?.total_revenue ?? 0),
        'Aantal sessies': s?.session_count ?? 0,
        'Laatste factuur': s?.last_invoice_date ?? '',
      }
    })

    const csv = Papa.unparse(rows, { quotes: true })
    const datum = new Date().toISOString().slice(0, 10)
    const filename = `invora-clienten-${datum}.csv`

    return new Response('﻿' + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Cliënt CSV export onverwachte fout:', error)
    return new Response(JSON.stringify({ error: 'Er is een fout opgetreden' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

function formatNumber(n: number): string {
  return n.toFixed(2).replace('.', ',')
}
