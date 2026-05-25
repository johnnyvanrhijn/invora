// Verifieert het Invora-schema op Supabase via DATABASE_URL.
// Run: node --env-file=.env.local scripts/verify-schema.mjs

import pg from 'pg'

const { Client } = pg

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL ontbreekt. Run met: node --env-file=.env.local scripts/verify-schema.mjs')
  process.exit(1)
}

const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })

function header(text) {
  console.log('\n' + '='.repeat(70))
  console.log(text)
  console.log('='.repeat(70))
}

function ok(condition, label) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`)
  return condition
}

const EXPECTED_TABLES = [
  'activity_log',
  'clients',
  'credit_notes',
  'invoice_lines',
  'invoices',
  'reminder_templates',
  'services',
  'time_entries',
  'users',
]

const EXPECTED_TRIGGERS = [
  // tabel -> trigger naam
  ['users', 'set_updated_at'],
  ['clients', 'set_updated_at'],
  ['services', 'set_updated_at'],
  ['invoices', 'set_updated_at'],
  ['credit_notes', 'set_updated_at'],
  ['time_entries', 'set_updated_at'],
  ['reminder_templates', 'set_updated_at'],
  ['invoice_lines', 'update_service_usage_count'],
  ['reminder_templates', 'ensure_single_default_reminder'],
]

const EXPECTED_FUNCTIONS = [
  'handle_updated_at',
  'handle_service_usage_count',
  'handle_single_default_reminder',
  'handle_new_auth_user',
  'generate_invoice_number',
  'generate_credit_note_number',
  'get_dashboard_stats',
]

await client.connect()

try {
  let allPassed = true

  // ── Tabellen ──────────────────────────────────────────────────────────
  header('Tabellen (9 verwacht in public)')
  const tables = await client.query(`
    SELECT table_name
      FROM information_schema.tables
     WHERE table_schema = 'public'
     ORDER BY table_name
  `)
  const tableNames = tables.rows.map((r) => r.table_name)
  console.log(tableNames.join(', '))
  for (const t of EXPECTED_TABLES) {
    allPassed = ok(tableNames.includes(t), `tabel '${t}' bestaat`) && allPassed
  }

  // ── RLS ───────────────────────────────────────────────────────────────
  header('Row Level Security (alle 9 tabellen)')
  const rls = await client.query(`
    SELECT tablename, rowsecurity
      FROM pg_tables
     WHERE schemaname = 'public'
     ORDER BY tablename
  `)
  for (const row of rls.rows) {
    if (EXPECTED_TABLES.includes(row.tablename)) {
      allPassed = ok(row.rowsecurity, `RLS aan op '${row.tablename}'`) && allPassed
    }
  }

  // ── Triggers ──────────────────────────────────────────────────────────
  header('Triggers')
  const triggers = await client.query(`
    SELECT event_object_table AS tbl, trigger_name AS name
      FROM information_schema.triggers
     WHERE trigger_schema = 'public'
     GROUP BY event_object_table, trigger_name
     ORDER BY event_object_table, trigger_name
  `)
  const found = new Set(triggers.rows.map((r) => `${r.tbl}.${r.name}`))
  for (const [tbl, name] of EXPECTED_TRIGGERS) {
    allPassed = ok(found.has(`${tbl}.${name}`), `${tbl}.${name}`) && allPassed
  }

  // Auth trigger zit op auth.users
  const authTrigger = await client.query(`
    SELECT tgname
      FROM pg_trigger
     WHERE tgname = 'on_auth_user_created'
       AND NOT tgisinternal
  `)
  allPassed = ok(authTrigger.rowCount === 1, 'auth.users.on_auth_user_created') && allPassed

  // ── Functions ─────────────────────────────────────────────────────────
  header('Helper / trigger functies')
  const funcs = await client.query(`
    SELECT routine_name
      FROM information_schema.routines
     WHERE routine_schema = 'public'
       AND routine_type = 'FUNCTION'
     ORDER BY routine_name
  `)
  const funcSet = new Set(funcs.rows.map((r) => r.routine_name))
  for (const fn of EXPECTED_FUNCTIONS) {
    allPassed = ok(funcSet.has(fn), `functie ${fn}()`) && allPassed
  }

  // ── Indexen ───────────────────────────────────────────────────────────
  header('Indexen (sample, telt totaal)')
  const indexes = await client.query(`
    SELECT COUNT(*) AS aantal
      FROM pg_indexes
     WHERE schemaname = 'public'
       AND indexname LIKE 'idx_%'
  `)
  const idxCount = Number(indexes.rows[0].aantal)
  allPassed = ok(idxCount >= 28, `28+ custom indexen aanwezig (gevonden: ${idxCount})`) && allPassed

  // ── Storage bucket ────────────────────────────────────────────────────
  header('Storage')
  const bucket = await client.query(`
    SELECT id, public, file_size_limit, allowed_mime_types
      FROM storage.buckets
     WHERE id = 'logos'
  `)
  if (bucket.rowCount === 1) {
    const b = bucket.rows[0]
    allPassed = ok(b.id === 'logos', `bucket 'logos' bestaat`) && allPassed
    allPassed = ok(b.public === false, `bucket is private`) && allPassed
    allPassed = ok(Number(b.file_size_limit) === 2097152, `file size limit = 2MB`) && allPassed
    allPassed = ok(
      JSON.stringify(b.allowed_mime_types) === JSON.stringify(['image/png', 'image/jpeg', 'image/svg+xml']),
      `mime types: png/jpeg/svg`
    ) && allPassed
  } else {
    allPassed = ok(false, `bucket 'logos' bestaat`) && allPassed
  }

  // ── Storage policies ──────────────────────────────────────────────────
  const storagePolicies = await client.query(`
    SELECT policyname
      FROM pg_policies
     WHERE schemaname = 'storage'
       AND tablename = 'objects'
       AND policyname LIKE 'logos_%'
  `)
  const policyNames = storagePolicies.rows.map((r) => r.policyname)
  for (const p of ['logos_upload_own', 'logos_select_own', 'logos_update_own', 'logos_delete_own']) {
    allPassed = ok(policyNames.includes(p), `storage policy ${p}`) && allPassed
  }

  // ── activity_log RLS: alleen SELECT, GEEN INSERT/UPDATE/DELETE ────────
  header('activity_log RLS (alleen SELECT, geen INSERT policy)')
  const alPolicies = await client.query(`
    SELECT policyname, cmd
      FROM pg_policies
     WHERE schemaname = 'public'
       AND tablename = 'activity_log'
  `)
  const cmds = alPolicies.rows.map((r) => r.cmd)
  allPassed = ok(cmds.includes('SELECT'), 'activity_log heeft SELECT policy') && allPassed
  allPassed = ok(!cmds.includes('INSERT'), 'activity_log heeft GEEN INSERT policy') && allPassed
  allPassed = ok(!cmds.includes('UPDATE'), 'activity_log heeft GEEN UPDATE policy') && allPassed
  allPassed = ok(!cmds.includes('DELETE'), 'activity_log heeft GEEN DELETE policy') && allPassed

  // ── Eindstatus ────────────────────────────────────────────────────────
  header(allPassed ? 'ALLES GROEN' : 'ER ZIJN FAILURES')
  process.exit(allPassed ? 0 : 1)
} finally {
  await client.end()
}
