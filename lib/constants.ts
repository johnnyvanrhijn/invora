// App-brede constanten — wijzig hier, werkt overal

export const APP_NAME = 'Invora'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://invora.nl'
export const SUPPORT_EMAIL = 'support@invora.nl'
export const INVOICE_FROM_EMAIL = 'facturen@invora.nl'

// BTW-vrijstellingstekst — wettelijk verplicht op elke factuur (Wet OB 1968)
export const BTW_VRIJSTELLING_TEKST =
  'Op deze dienst is BTW-vrijstelling van toepassing op grond van artikel 11, lid 1, onderdeel g van de Wet op de omzetbelasting 1968.'

// Factuurnummer formaat
export const INVOICE_PREFIX_DEFAULT = 'INV'
export const INVOICE_START_NUMBER = 1

// Betalingstermijnen in dagen
export const PAYMENT_TERMS = [7, 14, 21, 30] as const
export const PAYMENT_TERM_DEFAULT = 14

// Bestands upload limieten
export const MAX_LOGO_SIZE_MB = 2
export const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']

// Proefperiode
export const TRIAL_DAYS = 30

// Tijdregistratie
export const HOURS_ROUNDING = 0.25 // Afronden op kwartieren
export const HOURS_WARNING_DAYS = 90 // Waarschuwing als datum ouder dan X dagen

// Paginering
export const DEFAULT_PAGE_SIZE = 20
