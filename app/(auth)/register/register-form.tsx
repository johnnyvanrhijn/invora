'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { GoogleLoginButton } from '@/components/app/auth/google-login-button'
import { PasswordStrength } from '@/components/app/auth/password-strength'
import { cn } from '@/lib/utils'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<React.ReactNode | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      email: '',
      password: '',
      password_confirm: '',
      terms_accepted: false,
      privacy_accepted: false,
    },
  })

  const password = form.watch('password')

  async function onSubmit(data: RegisterFormData) {
    setFormError(null)
    setLoading(true)

    const supabase = createClient()
    const acceptedAt = new Date().toISOString()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          // Worden door auth-trigger gelezen en in public.users opgeslagen,
          // zodat de OAuth-callback de accept-terms-pagina overslaat.
          terms_accepted_at: acceptedAt,
          privacy_accepted_at: acceptedAt,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setLoading(false)
      if (/already (registered|exists)/i.test(error.message) || error.message.includes('User already')) {
        setFormError(
          <span>
            Er bestaat al een account met dit e-mailadres.{' '}
            <Link href="/login" className="underline">
              Inloggen →
            </Link>
          </span>
        )
      } else {
        setFormError('Er is iets misgegaan. Probeer het opnieuw.')
      }
      return
    }

    // Bewaar e-mail voor "opnieuw versturen" knop op verify pagina
    try {
      sessionStorage.setItem('invora_pending_email', data.email)
    } catch {
      // sessionStorage niet beschikbaar — geen probleem, fallback op invoerveld
    }

    router.push('/register/verify')
  }

  return (
    <div className="space-y-5">
      <GoogleLoginButton label="Aanmelden met Google" />

      <div className="flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-invora-text-muted text-xs">of</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="bg-destructive/10 text-destructive rounded-md border border-destructive/20 px-3 py-2 text-sm"
            >
              {formError}
            </div>
          )}

          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voornaam</FormLabel>
                <FormControl>
                  <Input
                    autoComplete="given-name"
                    placeholder="bijv. Anna"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mailadres</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="naam@voorbeeld.nl"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wachtwoord</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Minimaal 8 tekens"
                      className="h-11 pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-invora-text-muted hover:text-invora-text absolute top-1/2 right-3 -translate-y-1/2"
                      aria-label={showPassword ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </FormControl>
                <PasswordStrength password={password} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password_confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Wachtwoord bevestigen</FormLabel>
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Herhaal je wachtwoord"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms_accepted"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className={cn(field.value && 'border-invora-primary')}
                    />
                  </FormControl>
                  <FormLabel className="text-invora-text-muted text-sm leading-snug font-normal">
                    Ik ga akkoord met de{' '}
                    <Link
                      href="/voorwaarden"
                      target="_blank"
                      rel="noopener"
                      className="text-invora-primary underline"
                    >
                      algemene voorwaarden
                    </Link>{' '}
                    en de verwerkersovereenkomst
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="privacy_accepted"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="text-invora-text-muted text-sm leading-snug font-normal">
                    Ik ga akkoord met het{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener"
                      className="text-invora-primary underline"
                    >
                      privacybeleid
                    </Link>
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
            {loading ? 'Bezig…' : 'Account aanmaken'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
