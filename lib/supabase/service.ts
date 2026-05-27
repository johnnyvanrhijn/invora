import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// KRITIEK: deze client gebruikt de service_role key die RLS bypast.
// Gebruik uitsluitend server-side (API routes, server components).
// NOOIT importeren in bestanden met "use client".
export function createServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role credentials ontbreken')
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
