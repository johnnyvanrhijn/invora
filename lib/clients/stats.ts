import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type SupaClient = SupabaseClient<Database>

export interface ClientListStats {
  total_revenue: number
  last_invoice_date: string | null
  session_count: number
}

export interface ClientDetailStats {
  total_revenue: number
  invoice_count: number
  average_invoice_amount: number
  last_invoice_date: string | null
}

// Haalt voor een verzameling client_ids de statistieken op die in de lijst worden
// getoond. Per cliënt: totale omzet (alleen betaalde facturen), aantal
// urenregistraties en laatste factuurdatum (van alle niet-concept facturen).
//
// Wanneer er nog geen facturen of urenregistraties bestaan, retourneert deze
// helper voor elke cliënt 0/null — zodat de UI gewoon "—" / "€ 0,00" kan tonen.
export async function getClientListStats(
  supabase: SupaClient,
  userId: string,
  clientIds: string[]
): Promise<Map<string, ClientListStats>> {
  const map = new Map<string, ClientListStats>()
  for (const id of clientIds) {
    map.set(id, { total_revenue: 0, last_invoice_date: null, session_count: 0 })
  }
  if (clientIds.length === 0) return map

  // Omzet en laatste factuurdatum per cliënt
  const { data: invoices } = await supabase
    .from('invoices')
    .select('client_id, total, status, issue_date')
    .eq('user_id', userId)
    .in('client_id', clientIds)
    .neq('status', 'concept')

  if (invoices) {
    for (const inv of invoices) {
      if (!inv.client_id) continue
      const stat = map.get(inv.client_id)
      if (!stat) continue
      if (inv.status === 'betaald') {
        stat.total_revenue += Number(inv.total ?? 0)
      }
      if (!stat.last_invoice_date || inv.issue_date > stat.last_invoice_date) {
        stat.last_invoice_date = inv.issue_date
      }
    }
  }

  // Sessies (urenregistraties) per cliënt
  const { data: timeEntries } = await supabase
    .from('time_entries')
    .select('client_id')
    .eq('user_id', userId)
    .in('client_id', clientIds)

  if (timeEntries) {
    for (const entry of timeEntries) {
      if (!entry.client_id) continue
      const stat = map.get(entry.client_id)
      if (!stat) continue
      stat.session_count += 1
    }
  }

  return map
}

// Statistieken voor één enkele cliënt — gebruikt in de slide-over.
// Telt alleen niet-concept facturen voor invoice_count en average.
export async function getClientDetailStats(
  supabase: SupaClient,
  userId: string,
  clientId: string
): Promise<ClientDetailStats> {
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, status, issue_date')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .neq('status', 'concept')

  let total_revenue = 0
  let invoice_count = 0
  let last_invoice_date: string | null = null
  let paidSum = 0
  let paidCount = 0

  if (invoices) {
    for (const inv of invoices) {
      invoice_count += 1
      if (inv.status === 'betaald') {
        paidSum += Number(inv.total ?? 0)
        paidCount += 1
        total_revenue += Number(inv.total ?? 0)
      }
      if (!last_invoice_date || inv.issue_date > last_invoice_date) {
        last_invoice_date = inv.issue_date
      }
    }
  }

  const average_invoice_amount = paidCount > 0 ? paidSum / paidCount : 0

  return {
    total_revenue,
    invoice_count,
    average_invoice_amount,
    last_invoice_date,
  }
}

// Resolved {service_id: service_name} voor een set van service_ids.
export async function getServiceNamesByIds(
  supabase: SupaClient,
  userId: string,
  serviceIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (serviceIds.length === 0) return map

  const { data } = await supabase
    .from('services')
    .select('id, name')
    .eq('user_id', userId)
    .in('id', serviceIds)

  if (data) {
    for (const svc of data) {
      map.set(svc.id, svc.name)
    }
  }
  return map
}
