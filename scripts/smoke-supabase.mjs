// End-to-end smoke test: bewijst dat de Next.js env vars + browser-client
// + remote Supabase schema bij elkaar kloppen.
//
// Run: node --env-file=.env.local scripts/smoke-supabase.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('FAIL  NEXT_PUBLIC_SUPABASE_URL of NEXT_PUBLIC_SUPABASE_ANON_KEY ontbreekt')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

function ok(condition, label) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`)
  return condition
}

let allPassed = true

// 1. Anon client mag publieke tabellen aanspreken (krijgt 0 rijen door RLS)
const { error, count } = await supabase
  .from('clients')
  .select('id', { count: 'exact', head: true })

allPassed = ok(!error, `clients-query zonder error (${error?.message ?? 'ok'})`) && allPassed
allPassed = ok(count === 0, `0 rijen voor anon (RLS blokkeert lezen; count=${count})`) && allPassed

// 2. Onbestaande tabel moet PostgREST netjes weigeren — bewijst dat de
//    URL/sleutel werken en niet stilletjes empty result teruggeven.
const { error: missingError } = await supabase
  .from('this_table_does_not_exist')
  .select('id')
  .limit(1)

allPassed =
  ok(missingError !== null, `onbestaande tabel geeft error (negative-control)`) && allPassed

// 3. RPC naar onze get_dashboard_stats() functie — verifieert dat de
//    helper-functies bestaan en aanroepbaar zijn.
const dummyUserId = '00000000-0000-0000-0000-000000000000'
const { data: statsData, error: statsError } = await supabase.rpc('get_dashboard_stats', {
  p_user_id: dummyUserId,
})

allPassed =
  ok(!statsError, `RPC get_dashboard_stats aanroepbaar (${statsError?.message ?? 'ok'})`) &&
  allPassed

if (!statsError) {
  const json = statsData ?? {}
  allPassed = ok(typeof json === 'object', `RPC returnt JSON object`) && allPassed
  allPassed =
    ok(
      'omzet_deze_maand' in json &&
        'openstaand_bedrag' in json &&
        'laatste_facturen' in json &&
        'omzet_per_maand' in json,
      `RPC returnt 4 verwachte velden`
    ) && allPassed
}

console.log()
console.log(allPassed ? 'ALLES GROEN' : 'ER ZIJN FAILURES')
process.exit(allPassed ? 0 : 1)
