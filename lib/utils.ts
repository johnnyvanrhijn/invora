import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'

// Tailwind class merger — gebruik altijd deze functie voor conditionele classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Bedrag formatteren in Nederlandse notatie: € 1.234,56
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Datum formatteren in Nederlandse notatie: 15 januari 2024
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'd MMMM yyyy', { locale: nl })
}

// Korte datum: 15 jan 2024
export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'd MMM yyyy', { locale: nl })
}

// Relatieve datum: "3 dagen geleden"
export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: nl })
}

// Tijdgebaseerde begroeting
export function getGreeting(firstName: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return `Goedemorgen, ${firstName}!`
  if (hour < 18) return `Goedemiddag, ${firstName}!`
  return `Goedenavond, ${firstName}!`
}

// Nederlandse IBAN: NL + 2 cijfers + 4 letters + 10 cijfers (18 tekens totaal)
export function isValidIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  return /^NL\d{2}[A-Z]{4}\d{10}$/.test(cleaned)
}

// KvK nummer: 8 cijfers
export function isValidKvK(kvk: string): boolean {
  return /^\d{8}$/.test(kvk.replace(/\s/g, ''))
}
