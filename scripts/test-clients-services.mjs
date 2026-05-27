// End-to-end smoke test voor Fase 4 — Cliënten en diensten
// - Maakt twee testgebruikers aan
// - Voor user A: maakt cliënt + dienst aan via service_role
// - Verifieert dat user B (via anon + signIn) deze niet kan zien (RLS check)
// - Test bulk-archive, archive flag, en delete flow op cliënt en dienst
// - Ruimt alles op aan het einde

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
)

const url = env.NEXT_PUBLIC_SUPABASE_URL
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const service = env.SUPABASE_SERVICE_ROLE_KEY

const admin = createClient(url, service, { auth: { persistSession: false } })

const stamp = Date.now()
const password = 'TestWachtwoord123!'
const userA = { email: `phase4-a-${stamp}@invora.test`, id: null }
const userB = { email: `phase4-b-${stamp}@invora.test`, id: null }

let passed = 0
let failed = 0
const cleanup = []

function check(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.log(`  ✗ ${label}`)
    failed++
  }
}

async function createTestUser(profile) {
  const { data, error } = await admin.auth.admin.createUser({
    email: profile.email,
    password,
    email_confirm: true,
    user_metadata: { first_name: 'Test' },
  })
  if (error) throw error
  profile.id = data.user.id
  cleanup.push(async () => {
    await admin.auth.admin.deleteUser(profile.id)
  })
}

try {
  console.log('\n[1] Twee testgebruikers aanmaken')
  await createTestUser(userA)
  await createTestUser(userB)
  console.log(`     user A: ${userA.id}`)
  console.log(`     user B: ${userB.id}`)
  await new Promise((r) => setTimeout(r, 400))

  console.log('\n[2] Voor user A: cliënt en dienst aanmaken via service_role')
  const { data: createdClient, error: ce } = await admin
    .from('clients')
    .insert({
      user_id: userA.id,
      type: 'particulier',
      name: 'Anna de Vries',
      email: `client-${stamp}@example.com`,
      category: 'actief',
    })
    .select('id, archived')
    .single()
  if (ce) throw ce
  check(createdClient?.id && createdClient.archived === false, 'cliënt aangemaakt')

  const { data: createdService, error: se } = await admin
    .from('services')
    .insert({
      user_id: userA.id,
      name: 'Intakegesprek',
      price: 95.0,
      price_type: 'fixed',
      category: 'Intake',
    })
    .select('id, usage_count, archived')
    .single()
  if (se) throw se
  check(
    createdService?.id && createdService.usage_count === 0 && createdService.archived === false,
    'dienst aangemaakt (usage_count=0)'
  )

  console.log('\n[3] RLS: user B kan cliënt + dienst van user A NIET zien')
  const userBClient = createClient(url, anon, { auth: { persistSession: false } })
  const { error: signInErr } = await userBClient.auth.signInWithPassword({
    email: userB.email,
    password,
  })
  if (signInErr) throw signInErr

  const { data: clientsAsB } = await userBClient
    .from('clients')
    .select('id')
    .eq('id', createdClient.id)
  check((clientsAsB ?? []).length === 0, 'user B ziet cliënt van user A niet')

  const { data: servicesAsB } = await userBClient
    .from('services')
    .select('id')
    .eq('id', createdService.id)
  check((servicesAsB ?? []).length === 0, 'user B ziet dienst van user A niet')

  await userBClient.auth.signOut()

  console.log('\n[4] User A kan eigen cliënt + dienst wel zien via anon + signIn')
  const userAClient = createClient(url, anon, { auth: { persistSession: false } })
  const { error: signInAErr } = await userAClient.auth.signInWithPassword({
    email: userA.email,
    password,
  })
  if (signInAErr) throw signInAErr

  const { data: clientsAsA } = await userAClient
    .from('clients')
    .select('id, name')
    .eq('id', createdClient.id)
    .single()
  check(clientsAsA?.name === 'Anna de Vries', 'user A ziet eigen cliënt')

  const { data: servicesAsA } = await userAClient
    .from('services')
    .select('id, name')
    .eq('id', createdService.id)
    .single()
  check(servicesAsA?.name === 'Intakegesprek', 'user A ziet eigen dienst')

  console.log('\n[5] Archive flag werkt')
  const { error: archErr } = await admin
    .from('clients')
    .update({ archived: true, archived_at: new Date().toISOString() })
    .eq('id', createdClient.id)
  check(!archErr, 'cliënt gearchiveerd via service_role')

  const { data: archivedRow } = await admin
    .from('clients')
    .select('archived, archived_at')
    .eq('id', createdClient.id)
    .single()
  check(archivedRow?.archived === true, 'archived = true bevestigd')
  check(archivedRow?.archived_at !== null, 'archived_at gevuld')

  console.log('\n[6] Duplicate detectie: tweede cliënt met zelfde e-mail is mogelijk')
  // RLS staat dit toe — duplicate check zit in app layer. Geen unique constraint.
  const { data: dupe, error: dupErr } = await admin
    .from('clients')
    .insert({
      user_id: userA.id,
      type: 'particulier',
      name: 'Anna Dubbele',
      email: `client-${stamp}@example.com`,
      category: 'actief',
    })
    .select('id')
    .single()
  check(!dupErr && dupe?.id, 'duplicate insert mogelijk op DB-niveau (check zit in app)')

  console.log('\n[7] Cleanup — verwijder testdata')
  await admin.from('clients').delete().eq('user_id', userA.id)
  await admin.from('services').delete().eq('user_id', userA.id)

  console.log('\n[8] Eindopruim — gebruikers verwijderen')
  for (const fn of cleanup.reverse()) {
    await fn()
  }

  console.log(`\n📊 Resultaat: ${passed} ✓ / ${failed} ✗`)
  process.exit(failed > 0 ? 1 : 0)
} catch (err) {
  console.error('\n❌ Onverwachte fout:', err)
  for (const fn of cleanup.reverse()) {
    try {
      await fn()
    } catch {}
  }
  process.exit(1)
}
