// Valideert bij opstarten dat alle vereiste environment variables aanwezig zijn

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'INVOICE_TOKEN_SECRET',
] as const

export function validateEnv() {
  const missing: string[] = []

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Ontbrekende environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nKopieer .env.example naar .env.local en vul de waarden in.`
    )
  }
}
