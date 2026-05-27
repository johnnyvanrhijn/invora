'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { GoogleLoginButton } from '@/components/app/auth/google-login-button'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<React.ReactNode | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'auth_callback_failed') {
      setFormError('Inloggen mislukt. Probeer het opnieuw.')
    }
    const message = searchParams.get('message')
    if (message === 'password_updated') {
      setInfoMessage('Je wachtwoord is bijgewerkt. Log nu in met je nieuwe wachtwoord.')
    }
  }, [searchParams])

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginFormData) {
    setFormError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setLoading(false)
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login credentials')) {
        setFormError('Onjuist e-mailadres of wachtwoord')
      } else if (msg.includes('email not confirmed')) {
        setFormError(
          <span>
            Bevestig eerst je e-mailadres.{' '}
            <Link href="/register/verify" className="underline">
              Opnieuw versturen →
            </Link>
          </span>
        )
      } else {
        setFormError('Er is iets misgegaan. Probeer het opnieuw.')
      }
      return
    }

    const redirectTo = searchParams.get('redirectTo')
    router.push(redirectTo && redirectTo.startsWith('/') ? redirectTo : '/dashboard')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <GoogleLoginButton label="Inloggen met Google" />

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

          {infoMessage && (
            <div
              role="status"
              className="text-invora-success border-invora-success/30 bg-invora-primary-light rounded-md border px-3 py-2 text-sm"
            >
              {infoMessage}
            </div>
          )}

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
                <div className="flex items-center justify-between">
                  <FormLabel>Wachtwoord</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-invora-primary text-xs underline"
                  >
                    Wachtwoord vergeten?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
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
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
            {loading ? 'Bezig…' : 'Inloggen'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
