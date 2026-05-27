// Past een SQL migratie toe via DATABASE_URL.
// Gebruik: node scripts/apply-migration.mjs supabase/migrations/002_*.sql
import { readFileSync } from 'node:fs'
import pg from 'pg'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')]
    })
)

const file = process.argv[2]
if (!file) {
  console.error('Gebruik: node scripts/apply-migration.mjs <pad-naar-sql>')
  process.exit(1)
}

const sql = readFileSync(file, 'utf8')
const client = new pg.Client({ connectionString: env.DATABASE_URL })
await client.connect()
try {
  await client.query(sql)
  console.log(`✓ Migratie toegepast: ${file}`)
} catch (err) {
  console.error(`✗ Migratie mislukt: ${err.message}`)
  process.exit(1)
} finally {
  await client.end()
}
