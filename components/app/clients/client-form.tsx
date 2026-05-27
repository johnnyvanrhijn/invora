'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { clientSchema, type ClientFormData } from '@/lib/validations'
import type {
  ClientCategory,
  ClientType,
  ClientWithStats,
  DiscountType,
} from '@/types'

interface ClientFormDialogProps {
  open: boolean
  initialData?: ClientWithStats | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

interface FormState {
  type: ClientType
  name: string
  email: string
  phone: string
  address_street: string
  address_postal_code: string
  address_city: string
  billing_email: string
  category: ClientCategory
  default_service_id: string | null
  discount_enabled: boolean
  discount_type: DiscountType
  discount_value: string
  administrative_note: string
  // Zakelijk
  company_kvk_number: string
  btw_number: string
  payment_term_days: string // '' = standaard
  contact_name: string
  contact_email: string
  use_billing_address: boolean
  billing_address_street: string
  billing_address_postal_code: string
  billing_address_city: string
}

interface ServiceOption {
  id: string
  name: string
  archived: boolean
}

const NONE_SERVICE_VALUE = '__none__'
const TERM_INHERIT_VALUE = '__inherit__'

function emptyState(): FormState {
  return {
    type: 'particulier',
    name: '',
    email: '',
    phone: '',
    address_street: '',
    address_postal_code: '',
    address_city: '',
    billing_email: '',
    category: 'actief',
    default_service_id: null,
    discount_enabled: false,
    discount_type: 'percentage',
    discount_value: '',
    administrative_note: '',
    company_kvk_number: '',
    btw_number: '',
    payment_term_days: '',
    contact_name: '',
    contact_email: '',
    use_billing_address: false,
    billing_address_street: '',
    billing_address_postal_code: '',
    billing_address_city: '',
  }
}

function fromInitialData(d: ClientWithStats): FormState {
  return {
    type: d.type,
    name: d.name,
    email: d.email,
    phone: d.phone ?? '',
    address_street: d.address_street ?? '',
    address_postal_code: d.address_postal_code ?? '',
    address_city: d.address_city ?? '',
    billing_email: d.billing_email ?? '',
    category: d.category,
    default_service_id: d.default_service_id,
    discount_enabled: d.discount_type !== null,
    discount_type: (d.discount_type ?? 'percentage') as DiscountType,
    discount_value: d.discount_value !== null ? String(d.discount_value) : '',
    administrative_note: d.administrative_note ?? '',
    company_kvk_number: d.company_kvk_number ?? '',
    btw_number: d.btw_number ?? '',
    payment_term_days:
      d.payment_term_days !== null ? String(d.payment_term_days) : '',
    contact_name: d.contact_name ?? '',
    contact_email: d.contact_email ?? '',
    use_billing_address: Boolean(
      d.billing_address_street ||
        d.billing_address_postal_code ||
        d.billing_address_city
    ),
    billing_address_street: d.billing_address_street ?? '',
    billing_address_postal_code: d.billing_address_postal_code ?? '',
    billing_address_city: d.billing_address_city ?? '',
  }
}

export function ClientFormDialog({
  open,
  initialData,
  onOpenChange,
  onSaved,
}: ClientFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyState())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [services, setServices] = useState<ServiceOption[]>([])
  const lastCheckedEmailRef = useRef<string>('')

  // Reset state bij open / initialData wijziging
  useEffect(() => {
    if (open) {
      setForm(initialData ? fromInitialData(initialData) : emptyState())
      setErrors({})
      setDuplicateWarning(null)
      lastCheckedEmailRef.current = initialData?.email ?? ''
    }
  }, [open, initialData])

  // Diensten laden voor de dropdown
  useEffect(() => {
    if (!open) return
    fetch('/api/services?include_archived=false', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return
        const { services: list } = (await res.json()) as { services: ServiceOption[] }
        setServices(list)
      })
      .catch(() => undefined)
  }, [open])

  const isZakelijk = form.type === 'zakelijk'
  const labelName = isZakelijk ? 'Bedrijfsnaam' : 'Naam'

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  async function checkEmailDuplicate(email: string) {
    if (!email || email === lastCheckedEmailRef.current) return
    lastCheckedEmailRef.current = email
    try {
      const params = new URLSearchParams({ email })
      if (initialData?.id) params.set('exclude_id', initialData.id)
      const res = await fetch(`/api/clients/check-email?${params.toString()}`)
      if (!res.ok) return
      const data = await res.json()
      if (data.exists) {
        setDuplicateWarning(data.name)
      } else {
        setDuplicateWarning(null)
      }
    } catch {
      // Stille faal — niet blokkerend
    }
  }

  function buildPayload(force: boolean) {
    const discount_type = form.discount_enabled ? form.discount_type : null
    const discount_value_raw = form.discount_enabled
      ? Number(form.discount_value.replace(',', '.'))
      : null
    const discount_value = Number.isFinite(discount_value_raw as number)
      ? discount_value_raw
      : null

    const payload: ClientFormData & { force?: boolean } = {
      type: form.type,
      name: form.name,
      email: form.email,
      phone: form.phone || '',
      address_street: form.address_street || '',
      address_postal_code: form.address_postal_code || '',
      address_city: form.address_city || '',
      address_country: 'NL',
      billing_email: form.billing_email || '',
      category: form.category,
      default_service_id: form.default_service_id,
      discount_type: discount_type,
      discount_value: discount_value,
      administrative_note: form.administrative_note || '',
      company_kvk_number: isZakelijk ? form.company_kvk_number || '' : '',
      btw_number: isZakelijk ? form.btw_number || '' : '',
      payment_term_days:
        isZakelijk && form.payment_term_days
          ? Number(form.payment_term_days)
          : null,
      contact_name: isZakelijk ? form.contact_name || '' : '',
      contact_email: isZakelijk ? form.contact_email || '' : '',
      billing_address_street:
        isZakelijk && form.use_billing_address
          ? form.billing_address_street || ''
          : '',
      billing_address_postal_code:
        isZakelijk && form.use_billing_address
          ? form.billing_address_postal_code || ''
          : '',
      billing_address_city:
        isZakelijk && form.use_billing_address
          ? form.billing_address_city || ''
          : '',
    }
    if (force) payload.force = true
    return payload
  }

  async function handleSubmit(force = false) {
    const payload = buildPayload(force)
    const result = clientSchema.safeParse(payload)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        if (!newErrors[path]) newErrors[path] = issue.message
      }
      setErrors(newErrors)
      return
    }

    setIsSaving(true)
    try {
      const url = initialData
        ? `/api/clients/${initialData.id}`
        : '/api/clients'
      const method = initialData ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.status === 409) {
        const data = await res.json()
        if (data.duplicate) {
          // Vraag confirmatie en stuur opnieuw met force
          const confirmed = window.confirm(
            `Er bestaat al een cliënt met dit e-mailadres (${data.existingName}). Toch opslaan?`
          )
          if (confirmed) {
            await handleSubmit(true)
          }
          return
        }
        toast.error(data.message ?? 'Niet opgeslagen')
        return
      }
      if (!res.ok) throw new Error('Opslaan mislukt')
      toast.success(
        initialData ? 'Cliënt bijgewerkt' : 'Cliënt aangemaakt'
      )
      onSaved()
    } catch (err) {
      console.error(err)
      toast.error('Opslaan mislukt')
    } finally {
      setIsSaving(false)
    }
  }

  const isFirstSave = !initialData

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !isSaving) onOpenChange(false)
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isFirstSave ? 'Nieuwe cliënt' : 'Cliënt bewerken'}
          </DialogTitle>
          <DialogDescription>
            Vul de gegevens van je cliënt in. Velden met een * zijn verplicht.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-4">
          {/* Sectie 1: Type */}
          <FormSection title="Type cliënt">
            <div className="grid grid-cols-2 gap-2">
              <TypeToggle
                active={form.type === 'particulier'}
                onClick={() => update('type', 'particulier')}
                label="Particulier"
              />
              <TypeToggle
                active={form.type === 'zakelijk'}
                onClick={() => update('type', 'zakelijk')}
                label="Zakelijk"
              />
            </div>
          </FormSection>

          {/* Sectie 2: Basisgegevens */}
          <FormSection title="Basisgegevens">
            <Field label={`${labelName} *`} error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder={
                  isZakelijk ? 'bijv. Praktijk de Linde' : 'bijv. Anna de Vries'
                }
              />
            </Field>
            <Field label="E-mailadres *" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                onBlur={(e) => checkEmailDuplicate(e.target.value.trim().toLowerCase())}
                placeholder="naam@voorbeeld.nl"
              />
              {duplicateWarning && (
                <div className="bg-amber-50 text-amber-900 border-amber-200 mt-2 flex items-start gap-2 rounded-md border p-2 text-sm">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Er bestaat al een cliënt met dit e-mailadres:{' '}
                    <strong>{duplicateWarning}</strong>. Als je doorgaat, wordt
                    er een tweede cliënt aangemaakt.
                  </span>
                </div>
              )}
            </Field>
            <Field label="Telefoonnummer" error={errors.phone}>
              <Input
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="bijv. 0612345678"
              />
            </Field>
          </FormSection>

          {/* Sectie 3: Adres */}
          <FormSection title="Adres">
            <p className="text-muted-foreground -mt-1 mb-2 text-xs">
              Vul het adres handmatig in. Automatisch invullen via postcode
              komt binnenkort beschikbaar.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Straat en huisnummer" error={errors.address_street}>
                <Input
                  value={form.address_street}
                  onChange={(e) => update('address_street', e.target.value)}
                />
              </Field>
              <Field label="Postcode" error={errors.address_postal_code}>
                <Input
                  value={form.address_postal_code}
                  onChange={(e) => update('address_postal_code', e.target.value)}
                  placeholder="1234 AB"
                />
              </Field>
              <Field label="Stad" error={errors.address_city}>
                <Input
                  value={form.address_city}
                  onChange={(e) => update('address_city', e.target.value)}
                />
              </Field>
              <Field label="Land">
                <Input value="Nederland" disabled />
              </Field>
            </div>
          </FormSection>

          {/* Sectie 4: Zakelijk */}
          {isZakelijk && (
            <FormSection title="Zakelijke gegevens">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="KvK-nummer" error={errors.company_kvk_number}>
                  <Input
                    value={form.company_kvk_number}
                    onChange={(e) =>
                      update('company_kvk_number', e.target.value)
                    }
                    placeholder="12345678"
                    maxLength={8}
                  />
                </Field>
                <Field label="BTW-nummer" error={errors.btw_number}>
                  <Input
                    value={form.btw_number}
                    onChange={(e) => update('btw_number', e.target.value)}
                    placeholder="NL123456789B01"
                  />
                </Field>
              </div>
              <Field label="Afwijkende betalingstermijn">
                <Select
                  value={form.payment_term_days || TERM_INHERIT_VALUE}
                  onValueChange={(v) => {
                    const next = typeof v === 'string' ? v : ''
                    update(
                      'payment_term_days',
                      next === TERM_INHERIT_VALUE ? '' : next
                    )
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TERM_INHERIT_VALUE}>
                      Geen afwijking (standaard)
                    </SelectItem>
                    <SelectItem value="7">7 dagen</SelectItem>
                    <SelectItem value="14">14 dagen</SelectItem>
                    <SelectItem value="21">21 dagen</SelectItem>
                    <SelectItem value="30">30 dagen</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field
                  label="Contactpersoon"
                  error={errors.contact_name}
                  hint="Optioneel — naam van je primaire contact"
                >
                  <Input
                    value={form.contact_name}
                    onChange={(e) => update('contact_name', e.target.value)}
                  />
                </Field>
                <Field label="E-mail contactpersoon" error={errors.contact_email}>
                  <Input
                    type="email"
                    value={form.contact_email}
                    onChange={(e) => update('contact_email', e.target.value)}
                  />
                </Field>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="use_billing_address"
                  checked={form.use_billing_address}
                  onCheckedChange={(v) =>
                    update('use_billing_address', Boolean(v))
                  }
                />
                <Label htmlFor="use_billing_address" className="cursor-pointer">
                  Facturen sturen naar een ander adres
                </Label>
              </div>

              {form.use_billing_address && (
                <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                  <Field
                    label="Factuuradres — straat"
                    error={errors.billing_address_street}
                  >
                    <Input
                      value={form.billing_address_street}
                      onChange={(e) =>
                        update('billing_address_street', e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Factuuradres — postcode"
                    error={errors.billing_address_postal_code}
                  >
                    <Input
                      value={form.billing_address_postal_code}
                      onChange={(e) =>
                        update('billing_address_postal_code', e.target.value)
                      }
                    />
                  </Field>
                  <Field
                    label="Factuuradres — stad"
                    error={errors.billing_address_city}
                  >
                    <Input
                      value={form.billing_address_city}
                      onChange={(e) =>
                        update('billing_address_city', e.target.value)
                      }
                    />
                  </Field>
                </div>
              )}
            </FormSection>
          )}

          {/* Sectie 5: Facturatie voorkeuren */}
          <FormSection title="Facturatie voorkeuren">
            <Field
              label="Facturen versturen naar (afwijkend e-mailadres)"
              hint="Laat leeg om facturen naar het hoofd e-mailadres te sturen"
              error={errors.billing_email}
            >
              <Input
                type="email"
                value={form.billing_email}
                onChange={(e) => update('billing_email', e.target.value)}
              />
            </Field>
            <Field label="Standaard dienst">
              <Select
                value={form.default_service_id ?? NONE_SERVICE_VALUE}
                onValueChange={(v) =>
                  update(
                    'default_service_id',
                    v === NONE_SERVICE_VALUE ? null : v
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_SERVICE_VALUE}>
                    Geen standaard dienst
                  </SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FormSection>

          {/* Sectie 6: Korting */}
          <FormSection title="Standaard korting">
            <div className="flex items-start gap-2">
              <Checkbox
                id="discount_enabled"
                checked={form.discount_enabled}
                onCheckedChange={(v) => update('discount_enabled', Boolean(v))}
              />
              <Label htmlFor="discount_enabled" className="cursor-pointer">
                Standaard korting toepassen
              </Label>
            </div>
            {form.discount_enabled && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type">
                  <Select
                    value={form.discount_type}
                    onValueChange={(v) =>
                      update('discount_type', v as DiscountType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Vast bedrag</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Waarde" error={errors.discount_value}>
                  <div className="relative">
                    {form.discount_type === 'fixed' && (
                      <span className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2 text-sm">
                        €
                      </span>
                    )}
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={form.discount_value}
                      onChange={(e) => update('discount_value', e.target.value)}
                      className={form.discount_type === 'fixed' ? 'pl-6' : ''}
                    />
                    {form.discount_type === 'percentage' && (
                      <span className="text-muted-foreground absolute top-1/2 right-2.5 -translate-y-1/2 text-sm">
                        %
                      </span>
                    )}
                  </div>
                </Field>
              </div>
            )}
          </FormSection>

          {/* Sectie 7: Categorie */}
          <FormSection title="Categorie">
            <div className="grid grid-cols-3 gap-2">
              {(['actief', 'inactief', 'vip'] as ClientCategory[]).map((cat) => (
                <TypeToggle
                  key={cat}
                  active={form.category === cat}
                  onClick={() => update('category', cat)}
                  label={
                    cat === 'actief' ? 'Actief' : cat === 'vip' ? 'VIP' : 'Inactief'
                  }
                />
              ))}
            </div>
          </FormSection>

          {/* Sectie 8: Administratieve notitie */}
          <FormSection title="Administratieve notitie">
            <p className="text-muted-foreground -mt-1 text-xs">
              Gebruik dit voor zakelijke informatie over het facturatieproces.
              Voeg geen medische of persoonlijke gezondheidsinformatie toe.
            </p>
            <Field error={errors.administrative_note}>
              <Textarea
                value={form.administrative_note}
                onChange={(e) =>
                  update('administrative_note', e.target.value.slice(0, 500))
                }
                placeholder="bijv. factureert altijd aan het einde van de maand"
                maxLength={500}
              />
              <div className="text-muted-foreground mt-1 text-right text-xs">
                {form.administrative_note.length} / 500 tekens
              </div>
            </Field>
          </FormSection>
        </div>

        <div className="bg-muted/30 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Annuleren
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Cliënt opslaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-foreground border-b pb-1 text-sm font-semibold">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label?: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      {label && <Label className="text-xs">{label}</Label>}
      {children}
      {hint && !error && (
        <p className="text-muted-foreground text-xs">{hint}</p>
      )}
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

function TypeToggle({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-card border px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-invora-primary border-invora-primary text-white'
          : 'border-invora-primary/30 text-invora-primary-dark hover:bg-invora-primary-light bg-transparent'
      )}
    >
      {label}
    </button>
  )
}
