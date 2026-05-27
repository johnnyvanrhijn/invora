import { z } from 'zod'

// IBAN validatie — Nederlands formaat
export const ibanSchema = z
  .string()
  .transform((val) => val.replace(/\s/g, '').toUpperCase())
  .refine((val) => /^NL\d{2}[A-Z]{4}\d{10}$/.test(val), {
    message: 'Voer een geldig Nederlands IBAN-nummer in (bijv. NL91ABNA0417164300)',
  })

// KvK nummer — 8 cijfers
export const kvkSchema = z
  .string()
  .transform((val) => val.replace(/\s/g, ''))
  .refine((val) => /^\d{8}$/.test(val), {
    message: 'KvK-nummer bestaat uit 8 cijfers',
  })

// E-mail
export const emailSchema = z
  .string()
  .email({ message: 'Voer een geldig e-mailadres in' })
  .toLowerCase()

// Voornaam
export const firstNameSchema = z
  .string()
  .min(1, { message: 'Voornaam is verplicht' })
  .max(50, { message: 'Voornaam mag maximaal 50 tekens bevatten' })
  .trim()

// Wachtwoord — minimaal 8 tekens
export const passwordSchema = z
  .string()
  .min(8, { message: 'Wachtwoord moet minimaal 8 tekens bevatten' })

// Bedrag — positief, max 2 decimalen
export const amountSchema = z
  .number()
  .positive({ message: 'Bedrag moet groter zijn dan 0' })
  .multipleOf(0.01, { message: 'Maximaal 2 decimalen toegestaan' })

// Aantal uren — afgerond op kwartieren bij opslaan
export const hoursSchema = z
  .number()
  .positive({ message: 'Aantal uren moet groter zijn dan 0' })
  .max(24, { message: 'Maximaal 24 uur per registratie' })
  .transform((val) => Math.round(val / 0.25) * 0.25)

// ─── Auth flow ──────────────────────────────────────────────────────────────

// Registratie formulier validatie
export const registerSchema = z
  .object({
    first_name: firstNameSchema,
    email: emailSchema,
    password: passwordSchema,
    password_confirm: z.string(),
    terms_accepted: z.boolean().refine((val) => val === true, {
      message: 'Je moet akkoord gaan met de voorwaarden',
    }),
    privacy_accepted: z.boolean().refine((val) => val === true, {
      message: 'Je moet akkoord gaan met het privacybeleid',
    }),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Wachtwoorden komen niet overeen',
    path: ['password_confirm'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

// Login formulier validatie
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: 'Wachtwoord is verplicht' }),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Wachtwoord vergeten validatie
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Wachtwoord reset validatie
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Wachtwoorden komen niet overeen',
    path: ['password_confirm'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// Google OAuth terms acceptatie validatie.
// first_name is optioneel — wordt alleen verstuurd als de gebruiker geen
// voornaam uit de OAuth-provider heeft gekregen (bijv. Google zonder given_name).
export const termsAcceptanceSchema = z.object({
  first_name: firstNameSchema.optional(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: 'Je moet akkoord gaan met de voorwaarden',
  }),
  privacy_accepted: z.boolean().refine((val) => val === true, {
    message: 'Je moet akkoord gaan met het privacybeleid',
  }),
})

export type TermsAcceptanceFormData = z.infer<typeof termsAcceptanceSchema>

// ─── Onboarding ─────────────────────────────────────────────────────────────

// Onboarding stap 1: KvK-nummer optioneel, rest verplicht
export const onboardingStep1Schema = z.object({
  kvk_number: z
    .string()
    .transform((val) => val.replace(/\s/g, ''))
    .refine((val) => val === '' || /^\d{8}$/.test(val), {
      message: 'KvK-nummer bestaat uit 8 cijfers',
    })
    .optional()
    .or(z.literal('')),
  company_name: z
    .string()
    .min(1, { message: 'Bedrijfsnaam is verplicht' })
    .max(100, { message: 'Bedrijfsnaam mag maximaal 100 tekens bevatten' })
    .trim(),
  address_street: z
    .string()
    .min(1, { message: 'Straat en huisnummer zijn verplicht' })
    .max(100)
    .trim(),
  address_postal_code: z
    .string()
    .min(1, { message: 'Postcode is verplicht' })
    .max(10)
    .trim(),
  address_city: z.string().min(1, { message: 'Stad is verplicht' }).max(100).trim(),
  iban: ibanSchema,
})

export type OnboardingStep1Data = z.infer<typeof onboardingStep1Schema>

// Onboarding stap 2: BTW-status (verplicht)
export const onboardingStep2Schema = z.object({
  btw_vrijgesteld: z.boolean({
    message: 'Selecteer je BTW-status',
  }),
})

export type OnboardingStep2Data = z.infer<typeof onboardingStep2Schema>

// ─── Cliënten ───────────────────────────────────────────────────────────────

// Cliënt aanmaken/bewerken validatie
export const clientSchema = z.object({
  type: z.enum(['particulier', 'zakelijk']),
  name: z
    .string()
    .min(1, { message: 'Naam is verplicht' })
    .max(100, { message: 'Naam mag maximaal 100 tekens bevatten' })
    .trim(),
  email: emailSchema,
  phone: z.string().max(20).trim().optional().or(z.literal('')),

  // Bezoekadres
  address_street: z.string().max(100).trim().optional().or(z.literal('')),
  address_postal_code: z.string().max(10).trim().optional().or(z.literal('')),
  address_city: z.string().max(100).trim().optional().or(z.literal('')),
  address_country: z.string().default('NL'),

  // Optioneel voor alle types
  billing_email: emailSchema.optional().or(z.literal('')),
  category: z.enum(['actief', 'inactief', 'vip']).default('actief'),
  default_service_id: z.string().uuid().optional().nullable(),
  discount_type: z.enum(['percentage', 'fixed']).optional().nullable(),
  discount_value: z.number().min(0).optional().nullable(),
  administrative_note: z.string().max(500).trim().optional().or(z.literal('')),

  // Alleen zakelijk
  company_kvk_number: z
    .string()
    .max(8)
    .trim()
    .optional()
    .or(z.literal('')),
  btw_number: z.string().max(20).trim().optional().or(z.literal('')),
  payment_term_days: z.number().int().min(1).max(365).optional().nullable(),
  contact_name: z.string().max(100).trim().optional().or(z.literal('')),
  contact_email: emailSchema.optional().or(z.literal('')),
  billing_address_street: z.string().max(100).trim().optional().or(z.literal('')),
  billing_address_postal_code: z.string().max(10).trim().optional().or(z.literal('')),
  billing_address_city: z.string().max(100).trim().optional().or(z.literal('')),
})

export type ClientFormData = z.infer<typeof clientSchema>

// CSV import rij — minimaal: naam + email
export const csvClientRowSchema = z.object({
  naam: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase(),
  telefoon: z.string().max(20).trim().optional().or(z.literal('')),
  straat: z.string().max(100).trim().optional().or(z.literal('')),
  postcode: z.string().max(10).trim().optional().or(z.literal('')),
  stad: z.string().max(100).trim().optional().or(z.literal('')),
  type: z.enum(['particulier', 'zakelijk']).default('particulier'),
})

export type CsvClientRow = z.infer<typeof csvClientRowSchema>

// ─── Diensten ───────────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Naam is verplicht' })
    .max(100, { message: 'Naam mag maximaal 100 tekens bevatten' })
    .trim(),
  description: z.string().max(500).trim().optional().or(z.literal('')),
  price: z.number().min(0, { message: 'Prijs moet 0 of hoger zijn' }),
  price_type: z.enum(['fixed', 'hourly']),
  category: z.string().max(50).trim().optional().or(z.literal('')),
})

export type ServiceFormData = z.infer<typeof serviceSchema>

// ─── Bulk acties ────────────────────────────────────────────────────────────

export const bulkActionSchema = z.object({
  action: z.enum(['archive', 'unarchive', 'delete']),
  ids: z.array(z.string().uuid()).min(1, { message: 'Selecteer minimaal één item' }),
})

export type BulkActionData = z.infer<typeof bulkActionSchema>

export const archiveSchema = z.object({
  archived: z.boolean(),
})

export type ArchiveData = z.infer<typeof archiveSchema>
