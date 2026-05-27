// Invora TypeScript types — domeintypes voor de hele app

// Abonnementsstatus
export type SubscriptionStatus = 'trial' | 'active' | 'trial_expired' | 'cancelled' | 'past_due'

// Factuurstatus
export type InvoiceStatus = 'concept' | 'verstuurd' | 'betaald' | 'te_laat' | 'gecrediteerd'

// Cliënttype
export type ClientType = 'particulier' | 'zakelijk'

// Cliëntcategorie
export type ClientCategory = 'actief' | 'inactief' | 'vip'

// Dienst prijstype
export type ServicePriceType = 'fixed' | 'hourly'

// Urenregistratie status
export type TimeEntryStatus = 'niet_gefactureerd' | 'gefactureerd'

// Kortingstype
export type DiscountType = 'percentage' | 'fixed'

// Activiteitslog eventtype
export type ActivityEventType =
  | 'factuur_verstuurd'
  | 'betaling_ontvangen'
  | 'herinnering_verstuurd'
  | 'creditnota_aangemaakt'
  | 'factuur_te_laat'
  | 'stornering_ontvangen'

// Betaalmethode
export type PaymentMethod = 'ideal' | 'cash' | 'pin' | 'bank'

// Notificatietype
export type NotificationType =
  | 'factuur_betaald'
  | 'factuur_te_laat'
  | 'herinnering_verstuurd'
  | 'stornering'

// Notificatiekanaal per type
export interface NotificationPreferences {
  factuur_betaald: { push: boolean; email: boolean }
  factuur_te_laat: { push: boolean; email: boolean }
  herinnering_verstuurd: { push: boolean; email: boolean }
  stornering: { push: boolean; email: boolean }
}

// Standaard notificatievoorkeuren
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  factuur_betaald: { push: true, email: true },
  factuur_te_laat: { push: true, email: true },
  herinnering_verstuurd: { push: false, email: true },
  stornering: { push: true, email: true },
}

// Dashboard statistieken (response van get_dashboard_stats Supabase RPC).
// De DB returnt Engelse maandafkortingen voor maand_kort — de UI bouwt
// de Nederlandse afkortingen zelf op basis van het YYYY-MM formaat.
export interface DashboardLatestInvoice {
  id: string
  invoice_number: string
  total: number
  status: InvoiceStatus
  issue_date: string
  client_name: string | null
}

export interface DashboardMonthlyRevenue {
  maand: string // Formaat: "2024-01"
  maand_kort: string // Database geeft Engels — UI vervangt door NL
  omzet: number
}

export interface DashboardStats {
  omzet_deze_maand: number
  openstaand_bedrag: number
  laatste_facturen: DashboardLatestInvoice[]
  omzet_per_maand: DashboardMonthlyRevenue[]
}

// ─── Cliënten ───────────────────────────────────────────────────────────────

// Volledige cliëntdata met berekende statistieken (voor slide-over + bewerken)
export interface ClientWithStats {
  id: string
  type: ClientType
  name: string
  email: string
  phone: string | null
  address_street: string | null
  address_postal_code: string | null
  address_city: string | null
  address_country: string
  billing_email: string | null
  billing_address_street: string | null
  billing_address_postal_code: string | null
  billing_address_city: string | null
  company_kvk_number: string | null
  btw_number: string | null
  payment_term_days: number | null
  contact_name: string | null
  contact_email: string | null
  default_service_id: string | null
  discount_type: DiscountType | null
  discount_value: number | null
  category: ClientCategory
  administrative_note: string | null
  archived: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
  // Berekende velden
  total_revenue: number
  average_invoice_amount: number
  invoice_count: number
  last_invoice_date: string | null
  default_service_name: string | null
}

// Lichte rij voor de lijst weergave
export interface ClientListItem {
  id: string
  type: ClientType
  name: string
  email: string
  category: ClientCategory
  archived: boolean
  default_service_id: string | null
  default_service_name: string | null
  // Berekende velden (0/null tot Fase 5 en 7)
  session_count: number
  total_revenue: number
  last_invoice_date: string | null
}

// ─── Diensten ───────────────────────────────────────────────────────────────

export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  price_type: ServicePriceType
  category: string | null
  usage_count: number
  archived: boolean
  archived_at: string | null
  created_at: string
  updated_at: string
  // Berekende velden (0 tot Fase 5)
  total_revenue: number
}

// ─── Activity log ───────────────────────────────────────────────────────────

export interface ActivityLogEntry {
  id: string
  event_type: ActivityEventType
  description: string
  metadata: Record<string, unknown> | null
  created_at: string
}

// ─── Paginering ─────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
