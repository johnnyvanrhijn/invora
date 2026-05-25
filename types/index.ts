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
