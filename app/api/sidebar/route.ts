import { NextResponse } from 'next/server'
import { SIDEBAR_COOKIE_NAME, SIDEBAR_COOKIE_MAX_AGE } from '@/lib/sidebar'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { collapsed?: unknown }
  const collapsed = body.collapsed === true

  const response = NextResponse.json({ success: true })
  response.cookies.set(SIDEBAR_COOKIE_NAME, String(collapsed), {
    maxAge: SIDEBAR_COOKIE_MAX_AGE,
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
  })

  return response
}
