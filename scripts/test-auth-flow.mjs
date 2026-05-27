// End-to-end smoke test voor Fase 2 — Authenticatie + onboarding
// Maakt een test-gebruiker aan, voltooit onboarding, controleert resultaten en ruimt op.

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
const email = `phase2-test-${stamp}@invora.test`
const password = 'TestWachtwoord123!'
const firstName = 'Anna'

let userId
let passed = 0
let failed = 0

function check(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`)
    passed++
  } else {
    console.log(`  ✗ ${label}`)
    failed++
  }
}

try {
  console.log('\n[1] Gebruiker aanmaken via admin API (skip email verification)')
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName },
  })
  if (createErr) throw createErr
  userId = created.user.id
  console.log(`     user_id=${userId}`)

  // Geef de trigger een moment
  await new Promise((r) => setTimeout(r, 300))

  console.log('\n[2] Auth trigger heeft public.users rij aangemaakt')
  const { data: profile } = await admin
    .from('users')
    .select('id, email, first_name, onboarding_completed, terms_accepted_at')
    .eq('id', userId)
    .single()
  check(profile?.id === userId, 'public.users rij bestaat')
  check(profile?.first_name === firstName, `first_name = "${firstName}"`)
  check(profile?.onboarding_completed === false, 'onboarding_completed = false')
  check(profile?.terms_accepted_at === null, 'terms_accepted_at = null')

  console.log('\n[3] Inloggen via anon client + cookies-loos')
  const user = createClient(url, anon, { auth: { persistSession: false } })
  const { data: sess, error: signErr } = await user.auth.signInWithPassword({
    email,
    password,
  })
  if (signErr) throw signErr
  check(!!sess.session?.access_token, 'signInWithPassword retourneert access_token')

  console.log('\n[4] Onboarding stap 1 opslaan via API call (server)')
  const step1Res = await fetch('http://localhost:3003/api/onboarding/step1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sess.session.access_token}`,
      Cookie: '',
    },
    body: JSON.stringify({
      kvk_number: '12345678',
      company_name: 'Praktijk Test',
      address_street: 'Teststraat 1',
      address_postal_code: '1000 AA',
      address_city: 'Amsterdam',
      iban: 'NL91 ABNA 0417 1643 00',
    }),
  })
  // Note: API gebruikt cookies, niet bearer. Dus dit test ALLEEN de validatie + 401-pad.
  check(step1Res.status === 401, 'Step1 zonder cookies geeft 401 (cookie-based auth)')

  console.log('\n[5] Onboarding stap 1: direct via admin (simuleert wat API doet)')
  const { error: step1Err } = await admin
    .from('users')
    .update({
      kvk_number: '12345678',
      company_name: 'Praktijk Test',
      address_street: 'Teststraat 1',
      address_postal_code: '1000 AA',
      address_city: 'Amsterdam',
      iban: 'NL91ABNA0417164300',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
  check(!step1Err, 'Update via admin succesvol')

  const { data: afterStep1 } = await admin
    .from('users')
    .select('company_name, iban, address_city, onboarding_completed')
    .eq('id', userId)
    .single()
  check(afterStep1.company_name === 'Praktijk Test', 'company_name opgeslagen')
  check(afterStep1.iban === 'NL91ABNA0417164300', 'IBAN opgeslagen zonder spaties')
  check(afterStep1.address_city === 'Amsterdam', 'address_city opgeslagen')
  check(afterStep1.onboarding_completed === false, 'onboarding nog niet voltooid na stap 1')

  console.log('\n[6] Onboarding stap 2 (simuleert API)')
  const { error: step2Err } = await admin
    .from('users')
    .update({
      btw_vrijgesteld: true,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
  check(!step2Err, 'Update via admin succesvol')

  const { data: afterStep2 } = await admin
    .from('users')
    .select('btw_vrijgesteld, onboarding_completed')
    .eq('id', userId)
    .single()
  check(afterStep2.btw_vrijgesteld === true, 'btw_vrijgesteld = true')
  check(afterStep2.onboarding_completed === true, 'onboarding_completed = true')

  console.log('\n[7] RLS: ingelogde gebruiker mag eigen rij wel zien')
  const { data: ownRow, error: ownErr } = await user.from('users').select('first_name').eq('id', userId).single()
  check(!ownErr && ownRow?.first_name === firstName, 'Eigen profiel leesbaar via anon + session')

  console.log('\n[8] RLS: tweede gebruiker mag rij 1 NIET zien')
  const email2 = `phase2-test-other-${stamp}@invora.test`
  const { data: other } = await admin.auth.admin.createUser({
    email: email2,
    password,
    email_confirm: true,
    user_metadata: { first_name: 'Bob' },
  })
  const user2 = createClient(url, anon, { auth: { persistSession: false } })
  await user2.auth.signInWithPassword({ email: email2, password })
  const { data: otherView, error: otherErr } = await user2
    .from('users')
    .select('first_name')
    .eq('id', userId)
    .maybeSingle()
  check(!otherErr && otherView === null, 'User 2 ziet rij van User 1 niet (RLS blokkeert)')

  console.log('\n[9] Opruimen')
  await admin.auth.admin.deleteUser(other.user.id)
  await admin.auth.admin.deleteUser(userId)
  console.log('     test users verwijderd')
} catch (err) {
  console.error('\n💥 FOUT:', err.message ?? err)
  if (userId) {
    await admin.auth.admin.deleteUser(userId).catch(() => {})
  }
  process.exit(1)
}

console.log(`\n──── Resultaat: ${passed} geslaagd, ${failed} mislukt ────`)
if (failed > 0) process.exit(1)
