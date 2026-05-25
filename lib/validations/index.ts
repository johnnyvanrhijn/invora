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
