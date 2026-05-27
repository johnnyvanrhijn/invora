'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { serviceSchema } from '@/lib/validations'
import type { Service, ServicePriceType } from '@/types'

interface ServiceFormProps {
  open: boolean
  initialData?: Service | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

interface FormState {
  name: string
  description: string
  price: string
  price_type: ServicePriceType
  category: string
}

function emptyState(): FormState {
  return {
    name: '',
    description: '',
    price: '',
    price_type: 'fixed',
    category: '',
  }
}

function fromService(s: Service): FormState {
  return {
    name: s.name,
    description: s.description ?? '',
    price: String(s.price),
    price_type: s.price_type,
    category: s.category ?? '',
  }
}

export function ServiceFormDialog({
  open,
  initialData,
  onOpenChange,
  onSaved,
}: ServiceFormProps) {
  const [form, setForm] = useState<FormState>(emptyState())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialData ? fromService(initialData) : emptyState())
      setErrors({})
    }
  }, [open, initialData])

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

  async function handleSubmit() {
    const priceNumber = Number(form.price.replace(',', '.'))
    const payload = {
      name: form.name,
      description: form.description || '',
      price: Number.isFinite(priceNumber) ? priceNumber : -1,
      price_type: form.price_type,
      category: form.category || '',
    }
    const result = serviceSchema.safeParse(payload)
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
        ? `/api/services/${initialData.id}`
        : '/api/services'
      const method = initialData ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Opslaan mislukt')
      toast.success(initialData ? 'Dienst bijgewerkt' : 'Dienst aangemaakt')
      onSaved()
    } catch (err) {
      console.error(err)
      toast.error('Opslaan mislukt')
    } finally {
      setIsSaving(false)
    }
  }

  const priceLabel = form.price_type === 'hourly' ? 'Uurtarief' : 'Prijs'

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !isSaving) onOpenChange(false)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Dienst bewerken' : 'Nieuwe dienst'}
          </DialogTitle>
          <DialogDescription>
            Voeg een dienst toe aan je bibliotheek. Diensten verschijnen als
            suggesties bij het aanmaken van een factuur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Naam *</Label>
            <Input
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="bijv. Intakegesprek"
            />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Omschrijving</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                update('description', e.target.value.slice(0, 500))
              }
              placeholder="Wordt automatisch ingevuld als factuurregel"
            />
            <p className="text-muted-foreground text-xs">
              Dit wordt de standaard tekst op de factuurregel als je deze
              dienst selecteert
            </p>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Prijstype *</Label>
            <div className="grid grid-cols-2 gap-2">
              <PriceTypeToggle
                active={form.price_type === 'fixed'}
                onClick={() => update('price_type', 'fixed')}
                label="Vaste prijs"
              />
              <PriceTypeToggle
                active={form.price_type === 'hourly'}
                onClick={() => update('price_type', 'hourly')}
                label="Uurtarief"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">{priceLabel} *</Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2 text-sm">
                €
              </span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className="pl-6"
                placeholder="0,00"
              />
              {form.price_type === 'hourly' && (
                <span className="text-muted-foreground absolute top-1/2 right-2.5 -translate-y-1/2 text-xs">
                  per uur
                </span>
              )}
            </div>
            {errors.price && (
              <p className="text-destructive text-xs">{errors.price}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Categorie</Label>
            <Input
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              placeholder="bijv. Intake"
            />
            <p className="text-muted-foreground text-xs">
              Maak je eigen categorieën, bijv. &laquo;Intake&raquo;,
              &laquo;Behandeling&raquo;, &laquo;Online&raquo;
            </p>
          </div>
        </div>

        <div className="bg-muted/30 -mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t p-4 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Annuleren
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 size-4 animate-spin" />}
            Dienst opslaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PriceTypeToggle({
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
          : 'border-invora-primary/30 text-invora-primary-dark hover:bg-invora-primary-light'
      )}
    >
      {label}
    </button>
  )
}
