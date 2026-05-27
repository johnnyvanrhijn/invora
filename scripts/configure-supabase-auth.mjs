// Configureert Supabase Auth-instellingen via het Management API.
// Idempotent — kan veilig herhaald worden draaien.
//
// Vereist env vars:
//   SUPABASE_ACCESS_TOKEN  (Personal Access Token, sbp_...)
//   NEXT_PUBLIC_SUPABASE_URL (om project ref te bepalen)
//
// Gebruik (PowerShell):
//   $env:SUPABASE_ACCESS_TOKEN="sbp_..."; node scripts/configure-supabase-auth.mjs

import { readFileSync } from 'node:fs'

function loadEnvFile() {
  try {
    const text = readFileSync('.env.local', 'utf8')
    for (const line of text.split('\n')) {
      if (!line || line.startsWith('#')) continue
      const i = line.indexOf('=')
      if (i < 0) continue
      const key = line.slice(0, i).trim()
      const val = line
        .slice(i + 1)
        .trim()
        .replace(/^"|"$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // .env.local mag ontbreken
  }
}

loadEnvFile()

const pat = process.env.SUPABASE_ACCESS_TOKEN
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

if (!pat) {
  console.error('FOUT: SUPABASE_ACCESS_TOKEN ontbreekt (zet eerst $env:SUPABASE_ACCESS_TOKEN="sbp_...")')
  process.exit(1)
}
if (!supabaseUrl) {
  console.error('FOUT: NEXT_PUBLIC_SUPABASE_URL ontbreekt')
  process.exit(1)
}

// Project ref uit URL: https://obxvotpcrcdmrsxoxcjz.supabase.co → obxvotpcrcdmrsxoxcjz
const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
console.log(`Project ref: ${projectRef}`)

// ── Templates ──────────────────────────────────────────────────────────────

const confirmationSubject = 'Bevestig je e-mailadres voor Invora'
const confirmationTemplate = `<!doctype html>
<html lang="nl">
  <body style="margin:0;padding:0;background:#F9F7F4;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;color:#1A1A1A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;">
            <tr>
              <td style="padding:32px 40px 24px;">
                <span style="font-size:20px;font-weight:700;color:#7B9E87;">Invora</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;">
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1A1A1A;">Bevestig je e-mailadres</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#1A1A1A;">
                  Bedankt voor je registratie bij Invora. Klik op de knop hieronder om je e-mailadres te bevestigen en je account te activeren.
                </p>
                <p style="margin:0 0 28px;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#7B9E87;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:15px;font-weight:600;">
                    E-mailadres bevestigen
                  </a>
                </p>
                <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#6B7280;">
                  Werkt de knop niet? Kopieer dan deze link in je browser:
                </p>
                <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#6B7280;word-break:break-all;">
                  {{ .ConfirmationURL }}
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#6B7280;">
                  Heb je je niet aangemeld bij Invora? Dan kun je deze e-mail negeren.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;background:#F9F7F4;font-size:12px;color:#6B7280;text-align:center;">
                Invora — facturatie voor zorgprofessionals in Nederland
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

const recoverySubject = 'Stel je Invora-wachtwoord opnieuw in'
const recoveryTemplate = `<!doctype html>
<html lang="nl">
  <body style="margin:0;padding:0;background:#F9F7F4;font-family:'Plus Jakarta Sans',Helvetica,Arial,sans-serif;color:#1A1A1A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;">
            <tr>
              <td style="padding:32px 40px 24px;">
                <span style="font-size:20px;font-weight:700;color:#7B9E87;">Invora</span>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;">
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1A1A1A;">Wachtwoord opnieuw instellen</h1>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#1A1A1A;">
                  Je hebt een verzoek ingediend om je wachtwoord te resetten. Klik op de knop hieronder om een nieuw wachtwoord in te stellen.
                </p>
                <p style="margin:0 0 28px;">
                  <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#7B9E87;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:15px;font-weight:600;">
                    Wachtwoord resetten
                  </a>
                </p>
                <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:#6B7280;">
                  Werkt de knop niet? Kopieer dan deze link in je browser:
                </p>
                <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#6B7280;word-break:break-all;">
                  {{ .ConfirmationURL }}
                </p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#6B7280;">
                  Heb je dit verzoek niet ingediend? Dan kun je deze e-mail negeren — je wachtwoord blijft ongewijzigd.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px;background:#F9F7F4;font-size:12px;color:#6B7280;text-align:center;">
                Invora — facturatie voor zorgprofessionals in Nederland
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

// ── Allowlist ──────────────────────────────────────────────────────────────

const allowlistEntries = [
  'http://localhost:3000/**',
  'http://localhost:3001/**',
  'http://localhost:3002/**',
  'http://localhost:3003/**',
  'https://invora.nl/**',
  'https://invora-zeta.vercel.app/**',
]
const uriAllowList = allowlistEntries.join(',')

// ── PATCH payload ──────────────────────────────────────────────────────────

const payload = {
  site_url: appUrl,
  uri_allow_list: uriAllowList,
  mailer_subjects_confirmation: confirmationSubject,
  mailer_templates_confirmation_content: confirmationTemplate,
  mailer_subjects_recovery: recoverySubject,
  mailer_templates_recovery_content: recoveryTemplate,
}

// ── Apply ──────────────────────────────────────────────────────────────────

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`

console.log('\nPATCH naar:', endpoint)
const res = await fetch(endpoint, {
  method: 'PATCH',
  headers: {
    Authorization: `Bearer ${pat}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})

const body = await res.text()
if (!res.ok) {
  console.error(`✗ HTTP ${res.status}`)
  console.error(body)
  process.exit(1)
}

console.log(`✓ HTTP ${res.status} — wijzigingen toegepast`)

// ── Verify ─────────────────────────────────────────────────────────────────

const verifyRes = await fetch(endpoint, {
  headers: { Authorization: `Bearer ${pat}` },
})
const config = await verifyRes.json()

console.log('\nVerificatie:')
console.log(`  site_url                              = ${config.site_url}`)
console.log(`  uri_allow_list                        = ${config.uri_allow_list}`)
console.log(`  mailer_subjects_confirmation          = ${config.mailer_subjects_confirmation}`)
console.log(`  mailer_subjects_recovery              = ${config.mailer_subjects_recovery}`)
console.log(
  `  mailer_templates_confirmation_content = ${config.mailer_templates_confirmation_content.includes('Bevestig je e-mailadres') ? '✓ NL template actief' : '✗ niet NL'}`
)
console.log(
  `  mailer_templates_recovery_content     = ${config.mailer_templates_recovery_content.includes('Wachtwoord opnieuw instellen') ? '✓ NL template actief' : '✗ niet NL'}`
)
console.log(`  external_email_enabled                = ${config.external_email_enabled} (e-mail/wachtwoord registratie)`)
console.log(`  mailer_autoconfirm                    = ${config.mailer_autoconfirm} (false = e-mail moet bevestigd worden)`)
console.log(`  disable_signup                        = ${config.disable_signup}`)
