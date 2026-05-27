'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { createClient } from '@/lib/supabase/client'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validations'
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

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true)

    const supabase = createClient()
    // Negeer fouten bewust — we tonen altijd dezelfde melding om e-mailbestaan te verhullen
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="space-y-4">
        <div
          role="status"
          className="text-invora-success border-invora-success/30 bg-invora-primary-light rounded-md border px-3 py-3 text-sm"
        >
          Als dit e-mailadres bij ons bekend is, ontvang je een herstelmail.
        </div>
        <p className="text-invora-text-muted text-sm">
          <Link href="/login" className="text-invora-primary underline">
            Terug naar inloggen
          </Link>
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
          {loading ? 'Bezig…' : 'Herstelmail sturen'}
        </Button>

        <p className="text-invora-text-muted text-sm">
          <Link href="/login" className="text-invora-primary underline">
            Terug naar inloggen
          </Link>
        </p>
      </form>
    </Form>
  )
}
