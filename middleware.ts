import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes die authenticatie vereisen
const PROTECTED_ROUTES = [
  '/dashboard',
  '/facturen',
  '/clienten',
  '/uren',
  '/diensten',
  '/rapporten',
  '/instellingen',
  '/welcome',
  '/onboarding',
]

// Routes die alleen toegankelijk zijn voor niet-ingelogde gebruikers
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // Niet ingelogd, probeert beveiligde route te bereiken
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Ingelogd, probeert auth route te bereiken (bijv. login pagina)
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
