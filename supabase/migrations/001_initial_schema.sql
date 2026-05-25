-- ============================================================================
-- Invora — Initial database schema
-- Migration: 001_initial_schema.sql
-- Created:   2026-05-25
-- ============================================================================
-- Bevat:
--   - 9 publieke tabellen (users, clients, services, invoices, invoice_lines,
--     credit_notes, time_entries, reminder_templates, activity_log)
--   - Indexen op alle FKs + veelvuldig gefilterde kolommen
--   - Triggers voor updated_at, services.usage_count, single-default reminder,
--     en automatische users-row creatie bij Supabase Auth registratie
--   - Row Level Security (RLS) op alle tabellen
--   - 'logos' storage bucket met per-user RLS
--   - Helper functies: factuurnummer + creditnota nummer (atomic) en
--     dashboard statistieken
--
-- Volledig idempotent: kan meerdere keren worden uitgevoerd zonder fouten.
-- ============================================================================

-- Vereiste extensies (gen_random_uuid is in PG 13+ standaard maar pgcrypto
-- garandeert beschikbaarheid op elke PostgreSQL versie)
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================================
-- 1. TABEL: users
--    Uitbreiding op auth.users met Invora-specifieke profieldata.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id                        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basisgegevens (ingevuld bij registratie)
  email                     text NOT NULL,
  first_name                text NOT NULL DEFAULT '',

  -- Bedrijfsgegevens (ingevuld tijdens onboarding stap 1)
  kvk_number                text,
  company_name              text,
  address_street            text,
  address_city              text,
  address_postal_code       text,
  address_country           text NOT NULL DEFAULT 'NL',
  iban                      text,

  -- Logo (upload naar Supabase Storage 'logos' bucket)
  logo_url                  text,

  -- Factuurinstellingen
  invoice_prefix            text NOT NULL DEFAULT 'INV',
  invoice_start_number      integer NOT NULL DEFAULT 1,
  invoice_current_number    integer NOT NULL DEFAULT 1,
  payment_term_days         integer NOT NULL DEFAULT 14,

  -- BTW-status (ingevuld tijdens onboarding stap 2)
  btw_vrijgesteld           boolean NOT NULL DEFAULT true,
  btw_vrijstelling_tekst    text NOT NULL DEFAULT 'Op deze dienst is BTW-vrijstelling van toepassing op grond van artikel 11, lid 1, onderdeel g van de Wet op de omzetbelasting 1968.',

  -- Factuur e-mail instellingen
  standard_invoice_note     text,
  email_subject_template    text NOT NULL DEFAULT 'Factuur {factuurnummer} van {naam_therapeut}',
  bcc_email                 text,
  show_invora_branding      boolean NOT NULL DEFAULT true,
  show_logo_on_timesheet    boolean NOT NULL DEFAULT true,

  -- Optionele feature toggles
  auto_reminder_enabled     boolean NOT NULL DEFAULT true,
  show_invoice_note         boolean NOT NULL DEFAULT true,
  show_discount_on_invoice  boolean NOT NULL DEFAULT true,
  show_po_number_field      boolean NOT NULL DEFAULT false,
  show_internal_note_uren   boolean NOT NULL DEFAULT true,
  auto_save_concept         boolean NOT NULL DEFAULT true,
  round_hours_to_quarter    boolean NOT NULL DEFAULT true,
  show_hourly_amount        boolean NOT NULL DEFAULT true,
  allow_future_time_entries boolean NOT NULL DEFAULT true,
  warn_old_time_entries     boolean NOT NULL DEFAULT true,

  -- Mollie integratie (AES-256 versleuteld via Node crypto + MOLLIE_ENCRYPTION_KEY)
  mollie_api_key_encrypted  text,
  mollie_enabled            boolean NOT NULL DEFAULT false,
  mollie_payment_methods    text[] NOT NULL DEFAULT ARRAY['ideal'],

  -- Notificatievoorkeuren
  notification_preferences  jsonb NOT NULL DEFAULT '{"factuur_betaald":{"push":true,"email":true},"factuur_te_laat":{"push":true,"email":true},"herinnering_verstuurd":{"push":false,"email":true},"stornering":{"push":true,"email":true}}'::jsonb,

  -- Stripe abonnement
  stripe_customer_id        text,
  subscription_status       text NOT NULL DEFAULT 'trial'
                            CHECK (subscription_status IN ('trial', 'active', 'trial_expired', 'cancelled', 'past_due')),
  trial_ends_at             timestamptz NOT NULL DEFAULT (now() + interval '30 days'),

  -- Expo push token (voor toekomstige iOS app bij 10 betalende klanten)
  expo_push_token           text,

  -- Onboarding status
  onboarding_completed      boolean NOT NULL DEFAULT false,
  terms_accepted_at         timestamptz,
  privacy_accepted_at       timestamptz,

  -- Tijdstempels
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Uitbreiding op auth.users met Invora-specifieke profieldata';
COMMENT ON COLUMN public.users.first_name IS 'Voornaam, verplicht bij registratie of overgenomen van Google OAuth (raw_user_meta_data.given_name)';
COMMENT ON COLUMN public.users.mollie_api_key_encrypted IS 'Mollie API key, AES-256 versleuteld op applicatie-niveau (Node crypto, key in MOLLIE_ENCRYPTION_KEY env var)';
COMMENT ON COLUMN public.users.invoice_current_number IS 'Huidige factuurnummer teller. Wordt atomair opgehoogd door public.generate_invoice_number().';
COMMENT ON COLUMN public.users.expo_push_token IS 'Expo push notification token. Wordt ingevuld zodra de iOS app gebouwd is (bij 10 betalende klanten).';


-- ============================================================================
-- 2. TABEL: clients
--    FK clients.default_service_id -> services wordt verderop toegevoegd
--    (services bestaat nog niet op dit punt).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- Type
  type                        text NOT NULL DEFAULT 'particulier'
                              CHECK (type IN ('particulier', 'zakelijk')),

  -- Basisgegevens
  name                        text NOT NULL,
  email                       text NOT NULL,
  phone                       text,

  -- Bezoekadres
  address_street              text,
  address_postal_code         text,
  address_city                text,
  address_country             text NOT NULL DEFAULT 'NL',

  -- Factuuradres
  billing_email               text,
  billing_address_street      text,
  billing_address_postal_code text,
  billing_address_city        text,

  -- Zakelijke gegevens
  company_kvk_number          text,
  btw_number                  text,
  payment_term_days           integer, -- NULL = gebruik users.payment_term_days

  -- Extra contactpersoon
  contact_name                text,
  contact_email               text,

  -- Standaard dienst + korting
  default_service_id          uuid, -- FK constraint volgt na services-tabel
  discount_type               text CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value              numeric(10,2) CHECK (discount_value >= 0),

  -- Categorisering
  category                    text NOT NULL DEFAULT 'actief'
                              CHECK (category IN ('actief', 'inactief', 'vip')),

  -- Administratieve notitie (AVG-bewust: geen medische info)
  administrative_note         text CHECK (char_length(administrative_note) <= 500),

  -- Archivering
  archived                    boolean NOT NULL DEFAULT false,
  archived_at                 timestamptz,

  -- Tijdstempels
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.clients IS 'Cliënten van de therapeut';
COMMENT ON COLUMN public.clients.administrative_note IS 'Zakelijke notitie, max 500 tekens. Geen medische of gezondheidsdata (AVG artikel 9)';
COMMENT ON COLUMN public.clients.payment_term_days IS 'Afwijkende betalingstermijn voor zakelijke cliënten. NULL = users.payment_term_days';
COMMENT ON COLUMN public.clients.billing_email IS 'Apart factuuradres. Als gevuld, gaan facturen hierheen i.p.v. email';


-- ============================================================================
-- 3. TABEL: services
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  name          text NOT NULL,
  description   text, -- Wordt gebruikt als factuurregel tekst
  price         numeric(10,2) NOT NULL CHECK (price >= 0),
  price_type    text NOT NULL DEFAULT 'fixed'
                CHECK (price_type IN ('fixed', 'hourly')),
  category      text,

  -- Statistieken (automatisch bijgehouden via trigger op invoice_lines)
  usage_count   integer NOT NULL DEFAULT 0,

  -- Archivering
  archived      boolean NOT NULL DEFAULT false,
  archived_at   timestamptz,

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.services IS 'Diensten bibliotheek van de therapeut';
COMMENT ON COLUMN public.services.usage_count IS 'Aantal keer in een invoice_line gezet. Telt ook concept-facturen mee.';


-- ============================================================================
-- 4. TABEL: invoices
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id                uuid REFERENCES public.clients(id) ON DELETE SET NULL,

  -- Factuurnummer (uniek per gebruiker, UNIQUE constraint volgt onderaan)
  invoice_number           text NOT NULL,

  -- Status lifecycle
  status                   text NOT NULL DEFAULT 'concept'
                           CHECK (status IN ('concept', 'verstuurd', 'betaald', 'te_laat', 'gecrediteerd')),

  -- Datums
  issue_date               date NOT NULL DEFAULT CURRENT_DATE,
  due_date                 date NOT NULL,

  -- Bedragen
  subtotal                 numeric(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_type            text CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value           numeric(10,2) CHECK (discount_value >= 0),
  discount_amount          numeric(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total                    numeric(10,2) NOT NULL DEFAULT 0, -- mag negatief voor edge cases; gewone facturen >= 0

  -- Optionele velden
  notes                    text, -- Persoonlijke noot aan cliënt (zichtbaar op factuur en PDF)
  po_number                text, -- PO-referentie

  -- Betaling
  payment_method           text CHECK (payment_method IN ('ideal', 'cash', 'pin', 'bank')),
  paid_at                  timestamptz,

  -- Mollie
  mollie_payment_id        text,
  mollie_payment_url       text,
  payment_token            text UNIQUE,

  -- Betalingsherinneringen
  reminder_count           integer NOT NULL DEFAULT 0,
  last_reminder_sent_at    timestamptz,
  auto_reminder_enabled    boolean NOT NULL DEFAULT true,
  reminder_days            integer NOT NULL DEFAULT 14,

  -- Tijdstempels
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.invoices IS 'Facturen aangemaakt door therapeuten';
COMMENT ON COLUMN public.invoices.invoice_number IS 'Uniek per user_id. Formaat: INV-YYYY-NNN. Gegenereerd door public.generate_invoice_number().';
COMMENT ON COLUMN public.invoices.payment_token IS 'Cryptografisch token voor publieke betaalpagina URL (/pay/[token])';

-- UNIQUE constraint: factuurnummer per gebruiker
ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_user_invoice_number_unique;
ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_user_invoice_number_unique UNIQUE (user_id, invoice_number);


-- ============================================================================
-- 5. TABEL: invoice_lines
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.invoice_lines (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id   uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,

  -- Koppeling aan dienst (NULL als dienst later verwijderd is)
  service_id   uuid REFERENCES public.services(id) ON DELETE SET NULL,

  -- Factuurregel inhoud (AVG-bewuste veldnamen)
  description  text NOT NULL CHECK (char_length(description) <= 200),
  quantity     numeric(10,2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price   numeric(10,2) NOT NULL CHECK (unit_price >= 0),
  total        numeric(10,2) NOT NULL,

  -- Sortering binnen factuur
  sort_order   integer NOT NULL DEFAULT 0,

  -- Append-only — invoice_lines worden niet bewerkt na aanmaken
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.invoice_lines IS 'Factuurregels behorend bij een factuur';
COMMENT ON COLUMN public.invoice_lines.description IS 'Max 200 tekens. AVG: gebruik generieke omschrijving, geen persoonlijke cliëntinfo';
COMMENT ON COLUMN public.invoice_lines.service_id IS 'NULL als de dienst later verwijderd wordt — description en prijzen blijven bewaard';


-- ============================================================================
-- 6. TABEL: credit_notes
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.credit_notes (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id               uuid REFERENCES public.clients(id) ON DELETE SET NULL,

  -- Koppeling aan originele factuur
  original_invoice_id     uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  original_invoice_number text, -- Bewaard als tekst voor historische referentie

  -- Creditnota nummer (eigen reeks, formaat CN-YYYY-NNN)
  credit_note_number      text NOT NULL,

  -- Status
  status                  text NOT NULL DEFAULT 'verstuurd'
                          CHECK (status IN ('verstuurd', 'verwerkt')),

  issue_date              date NOT NULL DEFAULT CURRENT_DATE,
  total                   numeric(10,2) NOT NULL, -- Negatief bedrag

  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.credit_notes IS 'Creditnotas bij corrigeren van een verstuurde factuur';
COMMENT ON COLUMN public.credit_notes.total IS 'Negatief bedrag (bijv. -95.00) dat de originele factuur crediteert';

ALTER TABLE public.credit_notes
  DROP CONSTRAINT IF EXISTS credit_notes_user_number_unique;
ALTER TABLE public.credit_notes
  ADD CONSTRAINT credit_notes_user_number_unique UNIQUE (user_id, credit_note_number);


-- ============================================================================
-- 7. TABEL: time_entries
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id     uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  service_id    uuid REFERENCES public.services(id) ON DELETE SET NULL,
  invoice_id    uuid REFERENCES public.invoices(id) ON DELETE SET NULL,

  date          date NOT NULL,
  hours         numeric(4,2) NOT NULL CHECK (hours > 0 AND hours <= 24),

  -- AVG-bewust: 'Omschrijving', niet 'behandelomschrijving'
  description   text NOT NULL CHECK (char_length(description) <= 150),
  internal_note text, -- Nooit zichtbaar op factuur

  status        text NOT NULL DEFAULT 'niet_gefactureerd'
                CHECK (status IN ('niet_gefactureerd', 'gefactureerd')),

  -- Uurtarief op moment van registratie (snapshot, immune voor latere prijswijzigingen)
  hourly_rate   numeric(10,2) CHECK (hourly_rate >= 0),

  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.time_entries IS 'Urenregistraties van de therapeut';
COMMENT ON COLUMN public.time_entries.client_id IS 'NULL voor indirecte uren (administratie, acquisitie, etc.)';
COMMENT ON COLUMN public.time_entries.internal_note IS 'Interne notitie. Nooit zichtbaar op factuur of voor cliënt';
COMMENT ON COLUMN public.time_entries.hourly_rate IS 'Snapshot van uurtarief bij registratie. Latere dienst-prijswijzigingen raken bestaande entries niet';


-- ============================================================================
-- 8. TABEL: reminder_templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reminder_templates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  name        text NOT NULL, -- Interne naam voor gebruiker
  subject     text NOT NULL,
  body        text NOT NULL,
  -- Variabelen: {naam_client}, {factuurnummer}, {bedrag}, {vervaldatum}, {betaallink}, {naam_therapeut}

  is_default  boolean NOT NULL DEFAULT false,

  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.reminder_templates IS 'E-mail templates voor betalingsherinneringen';
COMMENT ON COLUMN public.reminder_templates.is_default IS 'Maximaal één template per gebruiker is default (gehandhaafd via trigger)';


-- ============================================================================
-- 9. TABEL: activity_log (append-only audit trail)
--    INSERTs gaan uitsluitend via server-side code (service_role).
--    RLS: alleen SELECT voor de ingelogde gebruiker, geen INSERT/UPDATE/DELETE.
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id    uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  invoice_id   uuid REFERENCES public.invoices(id) ON DELETE SET NULL,

  event_type   text NOT NULL CHECK (event_type IN (
                 'factuur_verstuurd',
                 'betaling_ontvangen',
                 'herinnering_verstuurd',
                 'creditnota_aangemaakt',
                 'factuur_te_laat',
                 'stornering_ontvangen'
               )),

  description  text NOT NULL,
  metadata     jsonb,

  -- Append-only — log entries worden nooit bewerkt
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.activity_log IS 'Audit trail per cliënt. Append-only. INSERT uitsluitend via service_role.';
COMMENT ON COLUMN public.activity_log.metadata IS 'Extra data, bijv. {"bedrag": 95.00, "factuurnummer": "INV-2024-001"}';


-- ============================================================================
-- CIRCULAIRE FK: clients.default_service_id -> services
-- ============================================================================
ALTER TABLE public.clients
  DROP CONSTRAINT IF EXISTS clients_default_service_id_fkey;
ALTER TABLE public.clients
  ADD CONSTRAINT clients_default_service_id_fkey
  FOREIGN KEY (default_service_id)
  REFERENCES public.services(id)
  ON DELETE SET NULL;


-- ============================================================================
-- INDEXEN
-- ============================================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at        ON public.users(trial_ends_at);

-- clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id            ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id_archived   ON public.clients(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_clients_user_id_email      ON public.clients(user_id, email);
CREATE INDEX IF NOT EXISTS idx_clients_default_service_id ON public.clients(default_service_id);

-- services
CREATE INDEX IF NOT EXISTS idx_services_user_id           ON public.services(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id_archived  ON public.services(user_id, archived);
CREATE INDEX IF NOT EXISTS idx_services_user_id_usage     ON public.services(user_id, usage_count DESC);

-- invoices
CREATE INDEX IF NOT EXISTS idx_invoices_user_id              ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id            ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id_status       ON public.invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id_issue_date   ON public.invoices(user_id, issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date             ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_token        ON public.invoices(payment_token);
CREATE INDEX IF NOT EXISTS idx_invoices_mollie_payment_id    ON public.invoices(mollie_payment_id);

-- invoice_lines
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id      ON public.invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_service_id      ON public.invoice_lines(service_id);

-- credit_notes
CREATE INDEX IF NOT EXISTS idx_credit_notes_user_id              ON public.credit_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_notes_original_invoice_id  ON public.credit_notes(original_invoice_id);

-- time_entries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id          ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id        ON public.time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id_status   ON public.time_entries(user_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id_date     ON public.time_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_invoice_id       ON public.time_entries(invoice_id);

-- reminder_templates
CREATE INDEX IF NOT EXISTS idx_reminder_templates_user_id    ON public.reminder_templates(user_id);

-- activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id          ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_client_id        ON public.activity_log(client_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_invoice_id       ON public.activity_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at       ON public.activity_log(created_at DESC);


-- ============================================================================
-- TRIGGER FUNCTIES
-- ============================================================================

-- ── handle_updated_at: zet updated_at = now() op elke UPDATE
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Koppel updated_at trigger aan alle tabellen die de kolom hebben
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'users', 'clients', 'services', 'invoices',
    'credit_notes', 'time_entries', 'reminder_templates'
  ]
  LOOP
    EXECUTE format($f$
      DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    $f$, t, t);
  END LOOP;
END;
$$;


-- ── handle_service_usage_count: synchroniseert services.usage_count met invoice_lines
CREATE OR REPLACE FUNCTION public.handle_service_usage_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.service_id IS NOT NULL THEN
    UPDATE public.services
       SET usage_count = usage_count + 1
     WHERE id = NEW.service_id;

  ELSIF TG_OP = 'DELETE' AND OLD.service_id IS NOT NULL THEN
    UPDATE public.services
       SET usage_count = GREATEST(0, usage_count - 1)
     WHERE id = OLD.service_id;

  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.service_id IS NOT NULL AND OLD.service_id IS DISTINCT FROM NEW.service_id THEN
      UPDATE public.services
         SET usage_count = GREATEST(0, usage_count - 1)
       WHERE id = OLD.service_id;
    END IF;
    IF NEW.service_id IS NOT NULL AND OLD.service_id IS DISTINCT FROM NEW.service_id THEN
      UPDATE public.services
         SET usage_count = usage_count + 1
       WHERE id = NEW.service_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS update_service_usage_count ON public.invoice_lines;
CREATE TRIGGER update_service_usage_count
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_lines
  FOR EACH ROW EXECUTE FUNCTION public.handle_service_usage_count();


-- ── handle_single_default_reminder: max één is_default = true per user
CREATE OR REPLACE FUNCTION public.handle_single_default_reminder()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.reminder_templates
       SET is_default = false
     WHERE user_id = NEW.user_id
       AND id != NEW.id
       AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ensure_single_default_reminder ON public.reminder_templates;
CREATE TRIGGER ensure_single_default_reminder
  BEFORE INSERT OR UPDATE ON public.reminder_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_single_default_reminder();


-- ── handle_new_auth_user: maakt automatisch public.users rij aan na Supabase Auth registratie
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'given_name', -- Google OAuth
      ''
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user() IS
  'Maakt automatisch public.users rij aan na Supabase Auth registratie. Haalt voornaam uit raw_user_meta_data (first_name of given_name uit Google OAuth).';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_notes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log        ENABLE ROW LEVEL SECURITY;


-- ── users: alleen eigen profiel zien/bewerken
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- INSERT in public.users gebeurt uitsluitend via SECURITY DEFINER trigger
-- handle_new_auth_user. Eindgebruikers krijgen geen INSERT policy.


-- ── clients
DROP POLICY IF EXISTS "clients_all_own" ON public.clients;
CREATE POLICY "clients_all_own" ON public.clients
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── services
DROP POLICY IF EXISTS "services_all_own" ON public.services;
CREATE POLICY "services_all_own" ON public.services
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── invoices
DROP POLICY IF EXISTS "invoices_all_own" ON public.invoices;
CREATE POLICY "invoices_all_own" ON public.invoices
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── invoice_lines: toegang via gekoppelde factuur
DROP POLICY IF EXISTS "invoice_lines_all_own" ON public.invoice_lines;
CREATE POLICY "invoice_lines_all_own" ON public.invoice_lines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_lines.invoice_id
        AND invoices.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_lines.invoice_id
        AND invoices.user_id = auth.uid()
    )
  );


-- ── credit_notes
DROP POLICY IF EXISTS "credit_notes_all_own" ON public.credit_notes;
CREATE POLICY "credit_notes_all_own" ON public.credit_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── time_entries
DROP POLICY IF EXISTS "time_entries_all_own" ON public.time_entries;
CREATE POLICY "time_entries_all_own" ON public.time_entries
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── reminder_templates
DROP POLICY IF EXISTS "reminder_templates_all_own" ON public.reminder_templates;
CREATE POLICY "reminder_templates_all_own" ON public.reminder_templates
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- ── activity_log: ALLEEN SELECT voor ingelogde gebruiker.
--    INSERTs gaan uitsluitend via server-side code (service_role bypassed RLS).
DROP POLICY IF EXISTS "activity_log_select_own" ON public.activity_log;
DROP POLICY IF EXISTS "activity_log_insert_own" ON public.activity_log;
CREATE POLICY "activity_log_select_own" ON public.activity_log
  FOR SELECT USING (auth.uid() = user_id);


-- ============================================================================
-- STORAGE: logos bucket
--    Pad-conventie: <user_id>/logo.<ext>
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  false,
  2097152, -- 2 MB
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "logos_upload_own" ON storage.objects;
CREATE POLICY "logos_upload_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'logos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "logos_select_own" ON storage.objects;
CREATE POLICY "logos_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "logos_update_own" ON storage.objects;
CREATE POLICY "logos_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "logos_delete_own" ON storage.objects;
CREATE POLICY "logos_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'logos'
    AND auth.uid()::text = (string_to_array(name, '/'))[1]
  );


-- ============================================================================
-- HELPER FUNCTIES
-- ============================================================================

-- ── generate_invoice_number: atomair ophogen + nummer teruggeven
--    Race-condition-vrij: UPDATE...RETURNING in één statement.
--    Het oude (huidige) nummer wordt gebruikt als factuurnummer; daarna wordt
--    invoice_current_number opgehoogd. Geen aparte trigger meer nodig.
CREATE OR REPLACE FUNCTION public.generate_invoice_number(
  p_user_id uuid,
  p_year    integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer
)
RETURNS text
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_prefix text;
  v_number integer;
BEGIN
  -- Ophogen + huidige (vóór de UPDATE) waarde teruggeven in één atomic statement
  UPDATE public.users
     SET invoice_current_number = invoice_current_number + 1
   WHERE id = p_user_id
  RETURNING invoice_prefix, (invoice_current_number - 1)
       INTO v_prefix, v_number;

  IF v_prefix IS NULL THEN
    RAISE EXCEPTION 'User % bestaat niet', p_user_id;
  END IF;

  RETURN v_prefix || '-' || p_year || '-' || LPAD(v_number::text, 3, '0');
END;
$$;

COMMENT ON FUNCTION public.generate_invoice_number(uuid, integer) IS
  'Genereert het volgende factuurnummer en hoogt invoice_current_number atomair op. Roep aan VOOR het aanmaken van de factuur. Race-condition-vrij.';


-- ── generate_credit_note_number: telt bestaande creditnotas in het jaar
CREATE OR REPLACE FUNCTION public.generate_credit_note_number(
  p_user_id uuid,
  p_year    integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer
)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*) + 1
    INTO v_count
    FROM public.credit_notes
   WHERE user_id = p_user_id
     AND EXTRACT(YEAR FROM issue_date) = p_year;

  RETURN 'CN-' || p_year || '-' || LPAD(v_count::text, 3, '0');
END;
$$;


-- ── get_dashboard_stats: omzet deze maand, openstaand, laatste 3 facturen, 6-maands grafiek
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'omzet_deze_maand',
    COALESCE((
      SELECT SUM(total)
        FROM public.invoices
       WHERE user_id = p_user_id
         AND status = 'betaald'
         AND DATE_TRUNC('month', paid_at) = DATE_TRUNC('month', NOW())
    ), 0),

    'openstaand_bedrag',
    COALESCE((
      SELECT SUM(total)
        FROM public.invoices
       WHERE user_id = p_user_id
         AND status IN ('verstuurd', 'te_laat')
    ), 0),

    'laatste_facturen',
    COALESCE((
      SELECT json_agg(row_to_json(t))
        FROM (
          SELECT
            i.id,
            i.invoice_number,
            i.total,
            i.status,
            i.issue_date,
            c.name AS client_name
            FROM public.invoices i
            LEFT JOIN public.clients c ON i.client_id = c.id
           WHERE i.user_id = p_user_id
           ORDER BY i.created_at DESC
           LIMIT 3
        ) t
    ), '[]'::json),

    'omzet_per_maand',
    COALESCE((
      SELECT json_agg(row_to_json(t))
        FROM (
          SELECT
            TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM') AS maand,
            TO_CHAR(DATE_TRUNC('month', paid_at), 'Mon')     AS maand_kort,
            SUM(total)                                       AS omzet
            FROM public.invoices
           WHERE user_id = p_user_id
             AND status = 'betaald'
             AND paid_at >= NOW() - INTERVAL '6 months'
           GROUP BY DATE_TRUNC('month', paid_at)
           ORDER BY DATE_TRUNC('month', paid_at)
        ) t
    ), '[]'::json)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_dashboard_stats(uuid) IS
  'Geoptimaliseerde query voor dashboard KPIs en 6-maands staafdiagram. SECURITY DEFINER zodat dezelfde call vanuit anon/authenticated client werkt.';


-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
