import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type SupaClient = SupabaseClient<Database>

// Berekent per service_id de totale omzet uit betaalde facturen.
// Wanneer er nog geen facturen zijn (zoals in Fase 4 vóór Fase 5), returnt
// elke service 0 — de UI toont dan gewoon € 0,00.
export async function getServiceRevenueMap(
  supabase: SupaClient,
  userId: string,
  serviceIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>()
  for (const id of serviceIds) map.set(id, 0)
  if (serviceIds.length === 0) return map

  // Haal betaalde facturen op
  const { data: paidInvoices } = await supabase
    .from('invoices')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'betaald')

  const paidIds = (paidInvoices ?? []).map((i) => i.id)
  if (paidIds.length === 0) return map

  const { data: lines } = await supabase
    .from('invoice_lines')
    .select('service_id, total, invoice_id')
    .in('invoice_id', paidIds)
    .in('service_id', serviceIds)

  if (lines) {
    for (const line of lines) {
      if (!line.service_id) continue
      const current = map.get(line.service_id) ?? 0
      map.set(line.service_id, current + Number(line.total ?? 0))
    }
  }

  return map
}
