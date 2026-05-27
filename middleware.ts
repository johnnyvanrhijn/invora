import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

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

// Routes die niet-ingelogde gebruikers gebruiken om in te loggen / te registreren.
// Ingelogde gebruikers die hier landen → terug naar dashboard.
// LET OP: /reset-password niet hieronder zetten — Supabase logt de gebruiker
// in via de reset-link, en die moet juist op de reset-pagina kunnen blijven.
// /forgot-password idem (mag ook voor ingelogde gebruikers werken).
const AUTH_ROUTES = ['/login', '/register']

// Routes die ingelogde gebruikers mogen bereiken zonder voltooide onboarding
const ONBOARDING_ROUTES = ['/welcome', '/onboarding']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // Inline om path-alias import te vermijden — Vercel bundelt path-alias
  // imports niet correct voor de Edge-middleware container.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() — cruciaal voor server-side auth (getSession is niet veilig
  // omdat het de cookie waarde direct teruggeeft zonder verificatie).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))
  const isOnboardingRoute = ONBOARDING_ROUTES.some((route) => pathname.startsWith(route))

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

  // Ingelogd op beveiligde, niet-onboarding route → check onboarding status
  if (user && isProtectedRoute && !isOnboardingRoute) {
    const { data: profile } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (profile && !profile.onboarding_completed) {
      return NextResponse.redirect(new URL('/welcome', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
