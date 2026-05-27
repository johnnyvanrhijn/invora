import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Welkom',
}

export default async function WelcomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('first_name, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  const firstName = profile?.first_name?.trim() ?? ''
  const heading = firstName ? `Welkom bij Invora, ${firstName}!` : 'Welkom bij Invora!'

  return (
    <div className="bg-invora-background flex min-h-screen items-center justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-md space-y-8 text-center">
        <WelcomeIllustration />

        <div className="space-y-3">
          <h1 className="text-invora-primary text-3xl font-bold sm:text-4xl">{heading}</h1>
          <p className="text-invora-text text-base">
            Invora helpt je in minuten facturen te sturen aan je cliënten.
          </p>
          <p className="text-invora-text-muted text-sm">
            Laten we eerst je account instellen zodat je direct kunt beginnen.
          </p>
        </div>

        <Link
          href="/onboarding"
          className={cn(
            buttonVariants({ size: 'lg' }),
            'from-invora-primary to-invora-primary-dark h-12 w-full bg-gradient-to-br px-6 text-base text-white'
          )}
        >
          Account instellen →
        </Link>
      </div>
    </div>
  )
}

function WelcomeIllustration() {
  // Abstracte menselijke figuur in warm-zand kleur die naar de actieknop wijst
  return (
    <svg
      viewBox="0 0 200 200"
      className="mx-auto h-48 w-48"
      role="img"
      aria-label="Persoon wijst naar startknop"
    >
      <circle cx="100" cy="200" r="90" fill="#E8F2EC" />
      {/* Hoofd */}
      <circle cx="85" cy="70" r="22" fill="#E2D6C1" />
      {/* Lichaam */}
      <path
        d="M62 110 Q60 145 65 175 L105 175 Q110 145 108 110 Z"
        fill="#7B9E87"
      />
      {/* Wijzende arm */}
      <path
        d="M105 115 L155 100"
        stroke="#E2D6C1"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Wijzende hand */}
      <circle cx="158" cy="99" r="6" fill="#E2D6C1" />
      {/* Andere arm (langs zij) */}
      <path
        d="M65 115 L60 155"
        stroke="#E2D6C1"
        strokeWidth="14"
        strokeLinecap="round"
      />
      {/* Schaduw onder doel */}
      <circle cx="170" cy="100" r="4" fill="#5E8A6E" opacity="0.4" />
    </svg>
  )
}
