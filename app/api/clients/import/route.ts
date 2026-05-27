import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import { createClient } from '@/lib/supabase/server'
import { csvClientRowSchema } from '@/lib/validations'

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

// POST /api/clients/import (multipart/form-data, field 'file')
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Geen bestand ontvangen' }, { status: 400 })
    }
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Bestand te groot (max 2MB)' }, { status: 400 })
    }

    const text = await file.text()
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase(),
    })

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      return NextResponse.json(
        { error: 'CSV kon niet worden gelezen', details: parsed.errors.slice(0, 3) },
        { status: 400 }
      )
    }

    const errors: string[] = []
    const validRows: Array<{
      name: string
      email: string
      phone: string | null
      address_street: string | null
      address_postal_code: string | null
      address_city: string | null
      type: 'particulier' | 'zakelijk'
    }> = []

    for (let i = 0; i < parsed.data.length; i++) {
      const row = parsed.data[i]
      const result = csvClientRowSchema.safeParse({
        naam: row.naam ?? '',
        email: row.email ?? '',
        telefoon: row.telefoon ?? '',
        straat: row.straat ?? '',
        postcode: row.postcode ?? '',
        stad: row.stad ?? '',
        type: row.type ?? 'particulier',
      })
      if (!result.success) {
        errors.push(`Rij ${i + 2}: ${result.error.issues.map((e) => e.message).join(', ')}`)
        continue
      }
      validRows.push({
        name: result.data.naam,
        email: result.data.email,
        phone: result.data.telefoon || null,
        address_street: result.data.straat || null,
        address_postal_code: result.data.postcode || null,
        address_city: result.data.stad || null,
        type: result.data.type,
      })
    }

    if (validRows.length === 0) {
      const result: ImportResult = { imported: 0, skipped: parsed.data.length, errors }
      return NextResponse.json(result)
    }

    // Bestaande e-mails ophalen om duplicaten te skippen
    const emails = [...new Set(validRows.map((r) => r.email))]
    const { data: existingRows } = await supabase
      .from('clients')
      .select('email')
      .eq('user_id', user.id)
      .in('email', emails)

    const existingEmails = new Set((existingRows ?? []).map((r) => r.email))

    const toInsert = validRows.filter((r) => {
      if (existingEmails.has(r.email)) {
        errors.push(`Overgeslagen ${r.email}: cliënt bestaat al`)
        return false
      }
      return true
    })

    if (toInsert.length === 0) {
      const result: ImportResult = {
        imported: 0,
        skipped: parsed.data.length,
        errors,
      }
      return NextResponse.json(result)
    }

    const insertPayloads = toInsert.map((r) => ({
      user_id: user.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      address_street: r.address_street,
      address_postal_code: r.address_postal_code,
      address_city: r.address_city,
      type: r.type,
    }))

    const { error: insertError, data: inserted } = await supabase
      .from('clients')
      .insert(insertPayloads)
      .select('id')

    if (insertError) {
      console.error('Cliënt CSV import fout:', insertError)
      return NextResponse.json({ error: 'Importeren mislukt' }, { status: 500 })
    }

    const imported = inserted?.length ?? 0
    const result: ImportResult = {
      imported,
      skipped: parsed.data.length - imported,
      errors,
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Cliënt CSV import onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
