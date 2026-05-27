'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { termsAcceptanceSchema, type TermsAcceptanceFormData } from '@/lib/validations'
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

interface AcceptTermsFormProps {
  needsFirstName: boolean
  suggestedFirstName: string
}

export function AcceptTermsForm({ needsFirstName, suggestedFirstName }: AcceptTermsFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<TermsAcceptanceFormData>({
    resolver: zodResolver(termsAcceptanceSchema),
    defaultValues: {
      first_name: needsFirstName ? suggestedFirstName : undefined,
      terms_accepted: false,
      privacy_accepted: false,
    },
  })

  async function onSubmit(data: TermsAcceptanceFormData) {
    setFormError(null)
    setLoading(true)

    const payload = needsFirstName
      ? data
      : { terms_accepted: data.terms_accepted, privacy_accepted: data.privacy_accepted }

    const response = await fetch('/api/auth/accept-terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      setLoading(false)
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setFormError(body.error ?? 'Er is een fout opgetreden. Probeer het opnieuw.')
      return
    }

    router.push('/welcome')
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {formError && (
          <div
            role="alert"
            className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border px-3 py-2 text-sm"
          >
            {formError}
          </div>
        )}

        {needsFirstName && (
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
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="terms_accepted"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
          {loading ? 'Bezig…' : 'Doorgaan naar Invora'}
        </Button>
      </form>
    </Form>
  )
}
