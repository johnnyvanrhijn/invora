import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { bulkActionSchema } from '@/lib/validations'

// POST /api/services/bulk  body: { action, ids[] }
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

    const body = await request.json()
    const parsed = bulkActionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ongeldige invoer', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const { action, ids } = parsed.data

    const { data: ownedRows } = await supabase
      .from('services')
      .select('id')
      .eq('user_id', user.id)
      .in('id', ids)
    const ownedIds = (ownedRows ?? []).map((r) => r.id)
    if (ownedIds.length === 0) {
      return NextResponse.json({ processed: 0, skipped: ids.length, skippedIds: ids })
    }

    if (action === 'archive' || action === 'unarchive') {
      const archived = action === 'archive'
      const { error } = await supabase
        .from('services')
        .update({
          archived,
          archived_at: archived ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .in('id', ownedIds)

      if (error) {
        console.error('Dienst bulk archive fout:', error)
        return NextResponse.json({ error: 'Bijwerken mislukt' }, { status: 500 })
      }

      return NextResponse.json({
        processed: ownedIds.length,
        skipped: ids.length - ownedIds.length,
        skippedIds: ids.filter((id) => !ownedIds.includes(id)),
      })
    }

    // action === 'delete'
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('user_id', user.id)
      .in('id', ownedIds)

    if (error) {
      console.error('Dienst bulk delete fout:', error)
      return NextResponse.json({ error: 'Verwijderen mislukt' }, { status: 500 })
    }

    return NextResponse.json({
      processed: ownedIds.length,
      skipped: ids.length - ownedIds.length,
      skippedIds: ids.filter((id) => !ownedIds.includes(id)),
    })
  } catch (error) {
    console.error('Dienst bulk onverwachte fout:', error)
    return NextResponse.json({ error: 'Er is een fout opgetreden' }, { status: 500 })
  }
}
