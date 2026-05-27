// Check de huidige status van een testgebruiker in de DB
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

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const targetEmail = process.argv[2]
if (!targetEmail) {
  console.error('Gebruik: node scripts/check-user.mjs <email>')
  process.exit(1)
}

const { data: authList } = await admin.auth.admin.listUsers({ perPage: 200 })
const authUser = authList.users.find((u) => u.email === targetEmail)

if (!authUser) {
  console.log(`Geen auth-rij voor ${targetEmail}`)
  process.exit(0)
}

console.log(`\n── auth.users (Supabase Auth) ──`)
console.log(`  id                  = ${authUser.id}`)
console.log(`  email               = ${authUser.email}`)
console.log(`  email_confirmed_at  = ${authUser.email_confirmed_at ?? 'nog niet bevestigd'}`)
console.log(`  last_sign_in_at     = ${authUser.last_sign_in_at ?? '—'}`)
console.log(`  created_at          = ${authUser.created_at}`)
console.log(`  raw_user_meta_data  = ${JSON.stringify(authUser.user_metadata)}`)
console.log(`  app_metadata.provider = ${authUser.app_metadata?.provider ?? '—'}`)

const { data: profile, error } = await admin
  .from('users')
  .select('*')
  .eq('id', authUser.id)
  .single()

if (error) {
  console.log(`\n✗ Geen public.users rij gevonden: ${error.message}`)
  process.exit(0)
}

console.log(`\n── public.users (profiel) ──`)
console.log(`  first_name             = "${profile.first_name}"`)
console.log(`  email                  = ${profile.email}`)
console.log(`  terms_accepted_at      = ${profile.terms_accepted_at ?? 'NULL — accept-terms toont!'}`)
console.log(`  privacy_accepted_at    = ${profile.privacy_accepted_at ?? 'NULL'}`)
console.log(`  onboarding_completed   = ${profile.onboarding_completed}`)
console.log(`  company_name           = ${profile.company_name ?? '—'}`)
console.log(`  kvk_number             = ${profile.kvk_number ?? '—'}`)
console.log(`  address_street         = ${profile.address_street ?? '—'}`)
console.log(`  address_postal_code    = ${profile.address_postal_code ?? '—'}`)
console.log(`  address_city           = ${profile.address_city ?? '—'}`)
console.log(`  iban                   = ${profile.iban ?? '—'}`)
console.log(`  btw_vrijgesteld        = ${profile.btw_vrijgesteld}`)
console.log(`  subscription_status    = ${profile.subscription_status}`)
console.log(`  trial_ends_at          = ${profile.trial_ends_at}`)
console.log(`  created_at             = ${profile.created_at}`)
console.log(`  updated_at             = ${profile.updated_at}`)
