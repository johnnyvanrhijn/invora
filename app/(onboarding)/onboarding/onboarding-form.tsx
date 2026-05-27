'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, FileCheck, Receipt } from 'lucide-react'

import {
  onboardingStep1Schema,
  type OnboardingStep1Data,
} from '@/lib/validations'
import { isValidIBAN, isValidKvK, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'

type Step = 1 | 2
type BtwOption = 'vrijgesteld' | 'plichtig'

function formatIBAN(value: string) {
  const cleaned = value.replace(/\s/g, '').toUpperCase()
  return cleaned.replace(/(.{4})/g, '$1 ').trim()
}

export function OnboardingForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [btwOption, setBtwOption] = useState<BtwOption | null>(null)

  const form = useForm<OnboardingStep1Data>({
    resolver: zodResolver(onboardingStep1Schema),
    defaultValues: {
      kvk_number: '',
      company_name: '',
      address_street: '',
      address_postal_code: '',
      address_city: '',
      iban: '',
    },
  })

  const kvkValue = form.watch('kvk_number') ?? ''
  const ibanValue = form.watch('iban') ?? ''
  const kvkIsValid = isValidKvK(kvkValue)
  const ibanIsValid = isValidIBAN(ibanValue)

  async function onSubmitStep1(data: OnboardingStep1Data) {
    setError(null)
    setLoading(true)

    const response = await fetch('/api/onboarding/step1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    setLoading(false)

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? 'Er is een fout opgetreden. Probeer het opnieuw.')
      return
    }

    setCurrentStep(2)
  }

  async function onSubmitStep2() {
    if (!btwOption) return
    setError(null)
    setLoading(true)

    const response = await fetch('/api/onboarding/step2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ btw_vrijgesteld: btwOption === 'vrijgesteld' }),
    })

    if (!response.ok) {
      setLoading(false)
      setError('Er is een fout opgetreden. Probeer het opnieuw.')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="space-y-8">
      <ProgressHeader currentStep={currentStep} />

      {error && (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md border border-destructive/20 px-3 py-2 text-sm"
        >
          {error}
        </div>
      )}

      {currentStep === 1 && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitStep1)} className="space-y-5">
            <FormField
              control={form.control}
              name="kvk_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>KvK-nummer</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="12345678"
                        className="h-11 pr-10"
                        {...field}
                      />
                      {kvkIsValid && (
                        <Check
                          aria-hidden
                          className="text-invora-success absolute top-1/2 right-3 size-4 -translate-y-1/2"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    We vullen binnenkort automatisch je bedrijfsgegevens in.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bedrijfsnaam</FormLabel>
                  <FormControl>
                    <Input placeholder="bijv. Praktijk De Vries" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Straat en huisnummer</FormLabel>
                  <FormControl>
                    <Input placeholder="bijv. Kerkstraat 12" className="h-11" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
              <FormField
                control={form.control}
                name="address_postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode</FormLabel>
                    <FormControl>
                      <Input placeholder="1234 AB" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stad</FormLabel>
                    <FormControl>
                      <Input placeholder="bijv. Amsterdam" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="iban"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IBAN</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="NL91 ABNA 0417 1643 00"
                        className="h-11 pr-10 font-mono tracking-wide"
                        value={formatIBAN(field.value ?? '')}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                      {ibanIsValid && (
                        <Check
                          aria-hidden
                          className="text-invora-success absolute top-1/2 right-3 size-4 -translate-y-1/2"
                        />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Dit staat later op elke factuur als betaalinformatie.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" size="lg" className="h-11 w-full" disabled={loading}>
              {loading ? 'Bezig…' : 'Volgende stap →'}
            </Button>
          </form>
        </Form>
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-invora-text text-xl font-bold">Hoe factureer je?</h2>
            <p className="text-invora-text-muted text-sm">
              Kies hieronder of je BTW-vrijgesteld bent.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BtwCard
              selected={btwOption === 'vrijgesteld'}
              onSelect={() => setBtwOption('vrijgesteld')}
              title="Ja, ik ben BTW-vrijgesteld"
              subtitle="Voor BIG-geregistreerden en vergelijkbare zorgprofessionals"
              icon={<FileCheck className="size-7" />}
            />
            <BtwCard
              selected={btwOption === 'plichtig'}
              onSelect={() => setBtwOption('plichtig')}
              title="Nee, ik reken BTW"
              subtitle="Voor coaches en trainers zonder zorgvrijstelling"
              icon={<Receipt className="size-7" />}
            />
          </div>

          <p className="text-invora-text-muted text-xs">
            ℹ Twijfel je? Controleer met je boekhouder of de BTW-vrijstelling op jou van
            toepassing is.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11"
              disabled={loading}
              onClick={() => {
                setError(null)
                setCurrentStep(1)
              }}
            >
              ← Vorige stap
            </Button>
            <Button
              type="button"
              size="lg"
              className="h-11 flex-1"
              disabled={!btwOption || loading}
              onClick={onSubmitStep2}
            >
              {loading ? 'Bezig…' : 'Invora starten →'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressHeader({ currentStep }: { currentStep: Step }) {
  const percentage = currentStep === 1 ? 50 : 100
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-invora-text font-semibold">
          {currentStep === 1 ? 'Bedrijfsgegevens' : 'BTW-status'}
        </span>
        <span className="text-invora-text-muted">Stap {currentStep} van 2</span>
      </div>
      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-invora-primary h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function BtwCard({
  selected,
  onSelect,
  title,
  subtitle,
  icon,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  subtitle: string
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'bg-invora-surface flex flex-col gap-3 rounded-card border-2 p-5 text-left transition-all',
        selected
          ? 'border-invora-primary bg-invora-primary-light shadow-card'
          : 'border-border hover:border-invora-primary/40'
      )}
      aria-pressed={selected}
    >
      <span
        className={cn(
          'flex size-12 items-center justify-center rounded-full',
          selected
            ? 'bg-invora-primary text-white'
            : 'bg-muted text-invora-text-muted'
        )}
      >
        {icon}
      </span>
      <span className="text-invora-text text-base font-semibold leading-snug">{title}</span>
      <span className="text-invora-text-muted text-sm leading-snug">{subtitle}</span>
    </button>
  )
}
