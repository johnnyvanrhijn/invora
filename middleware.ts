import { NextResponse, type NextRequest } from 'next/server'

// Beschermde routes. Niet-ingelogd hier → /login.
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

// Edge-runtime middleware: géén Node-only dependencies (geen @supabase/ssr).
// We doen alleen een snelle cookie-presence check op de Supabase auth-cookie.
// Échte sessieverificatie + onboarding-check zit in de server-component
// layouts (app/(app)/layout.tsx en app/(onboarding)/layout.tsx).
//
// De reverse redirect ("ingelogd op /login → /dashboard") doen we in de
// /login en /register pagina's zelf, NIET in middleware. Reden: bij een
// stale auth-cookie (sessie verlopen) zou middleware een redirect-loop
// veroorzaken — layout zegt "niet ingelogd → /login", middleware zegt
// "cookie aanwezig op /login → /dashboard", en zo voort.
function hasAuthCookie(request: NextRequest): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const prefix = `sb-${projectRef}-auth-token`
  return request.cookies.getAll().some((c) => c.name.startsWith(prefix) && c.value.length > 0)
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))

  if (isProtected && !hasAuthCookie(request)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
