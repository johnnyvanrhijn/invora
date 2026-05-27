'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validations'
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
import { PasswordStrength } from '@/components/app/auth/password-strength'

export function ResetPasswordForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setHasSession(!!data.user)
    })
  }, [])

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', password_confirm: '' },
  })

  const password = form.watch('password')

  async function onSubmit(data: ResetPasswordFormData) {
    setFormError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: data.password })

    if (error) {
      setLoading(false)
      setFormError('Wachtwoord kon niet worden bijgewerkt. Probeer opnieuw.')
      return
    }

    await supabase.auth.signOut()
    router.push('/login?message=password_updated')
  }

  if (hasSession === false) {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md border border-destructive/20 px-3 py-3 text-sm"
        >
          Deze link is verlopen. Vraag een nieuwe herstelmail aan.
        </div>
        <Link
          href="/forgot-password"
          className="text-invora-primary text-sm underline"
        >
          Nieuwe herstelmail aanvragen →
        </Link>
      </div>
    )
  }

  return (
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nieuw wachtwoord</FormLabel>
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

        <Button type="submit" size="lg" className="h-11 w-full" disabled={loading || hasSession === null}>
          {loading ? 'Bezig…' : 'Wachtwoord opslaan'}
        </Button>
      </form>
    </Form>
  )
}
