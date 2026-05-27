# TASKS.md — Invora Takenlijst
*Bijgehouden gedurende het gehele project. Altijd up-to-date houden.*
*Laatste update: 25 mei 2026*

## Status
- `[ ]` Nog niet gestart
- `[~]` In uitvoering
- `[x]` Afgerond
- `[!]` Geblokkeerd of vereist beslissing van Johnny

## Legenda
- 🧑 **JOHNNY** — Handmatige taak
- 🤖 **CLAUDE CODE** — Claude Code voert dit uit

## Mijlpalen
- **MVP lancering** — web app live, eerste betalende gebruiker
- **Mijlpaal 3 klanten** → KvK API + Postcode API activeren
- **Mijlpaal 10 klanten** → iOS app bouwen

---

## 📓 Fase samenvattingen

> Korte recaps per afgeronde fase: wat is gebouwd, welke afwijkingen er waren en welke nieuwe taken eruit voortkwamen. Bedoeld om snel terug te kunnen vinden waarom keuzes gemaakt zijn zonder de chatgeschiedenis door te lopen.

### Fase 0 — Accounts en externe services *(afgerond mei 2026)*

**Wat is gebeurd:**
- GitHub repo aangemaakt (Private, `johnnyvanrhijn/invora`)
- Supabase project `invora-production` in Frankfurt (eu-central-1, AVG-compliant), ref `obxvotpcrcdmrsxoxcjz`
- Vercel project gekoppeld via CLI (`prj_dLBw9jCjHuym75Tn4Qo2aYHrdzJf`), production URL `invora-zeta.vercel.app`
- Resend account + API key, Mollie account + test/live keys, alle env vars in `.env.local` + Vercel (Production + Development)
- `INVOICE_TOKEN_SECRET` en `INTERNAL_DASHBOARD_SECRET` gegenereerd

**Afwijkingen van plan:**
- Repo heet `invora` i.p.v. `invora-web` (besluit Johnny — geen aparte iOS repo nu)
- Eerste Vercel deploy faalde bewust (er was nog geen Next.js code) — opgelost in Fase 1.1
- Vercel CLI kan in non-interactive mode geen env vars naar de Preview environment pushen. Geaccepteerd risico: 13 vars staan in Production + Development; Preview vullen we later via dashboard of PAT
- Domein registratie (0.1), Resend domein verificatie (0.5b), Stripe controle (0.7), UptimeRobot (0.8) bewust uitgesteld — komen op natuurlijke momenten later in het project. Risico: invora.nl kan in de tussentijd geclaimed worden — geaccepteerd

**Nieuwe taken:**
- Geen nieuwe taken — alles wat uitgesteld is, staat al in latere fases gemarkeerd

---

### Fase 1.1 — Web app projectstructuur *(afgerond 25 mei 2026)*

**Wat is gebouwd:**
- Next.js 15.5.18 (React 19.1, App Router) aangemaakt via `create-next-app` met behoud van bestaande projectbestanden (CLAUDE.md, INVORA_CONTEXT.md, TASKS.md, `.env.*`, `.vercel`, `.git`) door tijdelijke backup → restore
- TypeScript strict-config met `noUnusedLocals` / `noUnusedParameters` / `noImplicitReturns`
- Volledige mapstructuur (`app/(auth|app|marketing)/`, `app/api/{kvk,postcode,invoice,payments,stripe,webhooks/{mollie,stripe}}`, `components/{ui,app,marketing}`, `lib/{supabase,validations}`, `hooks`, `types`, `supabase/migrations`, `public/{fonts,images}`)
- 23 shadcn componenten + handmatige `form.tsx` (zie afwijkingen)
- Invora design tokens (sage green `#7B9E87`, warm wit `#F9F7F4`, status-kleuren, card/button radius, `pulse-ring` keyframe voor de coach mark) in `app/globals.css` via Tailwind v4 `@theme`
- Plus Jakarta Sans via `next/font/google` (CSS-variable `--font-plus-jakarta`)
- Supabase clients (`client.ts`, `server.ts`, `middleware.ts`) met Next 15 async cookies API
- Route-protectie middleware: `/dashboard` → 307 → `/login?redirectTo=…` werkt
- Utilities (`cn`, `formatCurrency`, `formatDate`, `formatDateShort`, `formatRelativeDate`, `getGreeting`, `isValidIBAN`, `isValidKvK`) en constants (`APP_NAME`, `BTW_VRIJSTELLING_TEKST`, `PAYMENT_TERMS`, `TRIAL_DAYS`, etc.)
- Type-definities voor SubscriptionStatus, InvoiceStatus, ClientType, ServicePriceType, TimeEntryStatus, ActivityEventType, NotificationPreferences + placeholder `Database` (vervangen in 1.2)
- Zod-schemas (IBAN, KvK, e-mail, voornaam, wachtwoord, bedrag, uren) — kwartier-afronding via `.transform()`
- ESLint flat config (ESLint 9), Prettier + `.prettierignore`, samengevoegde `.gitignore`
- Placeholder pagina's voor `/`, dashboard, facturen, clienten, uren, diensten, rapporten, instellingen + `(auth)` en `(app)` layouts

**Afwijkingen van plan:**
- **Next.js 15** i.p.v. 14 — gekozen na overleg. Async `cookies()`/`headers()`/`params` API; React 19; stabiele LTS
- **Tailwind v4** i.p.v. v3 — moderne CSS-first config. Geen `tailwind.config.ts`; tokens leven in `@theme` in `globals.css`. `tailwindcss-animate` vervangen door `tw-animate-css` (door shadcn meegenomen). Kleuren als hex i.p.v. HSL
- **shadcn/ui v4 (`base-nova` style)** — gebruikt `@base-ui/react` i.p.v. Radix als onderliggende library. Componenten-API is identiek; geen runtime impact
- **`toast` → `sonner`** — shadcn v4 raadt Sonner aan; `<Toaster richColors closeButton />` ingebouwd in `app/layout.tsx`
- **Form-component handmatig geschreven** — `base-nova` registry levert geen `form.tsx`. Oplossing: `@radix-ui/react-slot` toegevoegd (micro-package) en de standaard shadcn-Form-API zelf gebouwd. Geeft directe compatibiliteit met alle online voorbeelden
- **ESLint flat config** (`eslint.config.mjs`) i.p.v. `.eslintrc.json` — moderne ESLint 9 standaard; dezelfde rules
- **`calendar.tsx`** — één `@ts-expect-error` toegevoegd op `table:` regel; upstream mismatch tussen shadcn calendar en huidige `react-day-picker` types. Werkt op runtime
- **Dev server poort** — draaide op 3001 (3000 was in gebruik). Geen probleem voor verdere fases

**Nieuwe taken (toegevoegd):**
- ThemeProvider met `next-themes` toevoegen in Fase 3.1 — CSS-tokens voor `.dark` staan klaar, alleen de switcher ontbreekt om systeemvoorkeur op te volgen
- Initial commit + push naar GitHub `invora` repo blijft openstaan — wacht tot 1.2 + 1.3 ook klaar zijn zodat we één coherente "Fase 1" commit hebben

---

### Fase 1.2 — Supabase database schema *(afgerond 25 mei 2026)*

**Wat is gebouwd:**
- `supabase/migrations/001_initial_schema.sql` (888 regels) — volledig idempotent, één-shot migratie
- 9 publieke tabellen exact zoals INVORA_CONTEXT.md sectie 3–16 voorschrijft, plus iOS-ready kolommen (`expo_push_token` op `users`)
- 31 indexen op alle FKs + veelvuldig gefilterde kolommen (status, archived, due_date, payment_token, etc.)
- 10 triggers: 7× `set_updated_at`, `update_service_usage_count` op invoice_lines, `ensure_single_default_reminder` op reminder_templates, `on_auth_user_created` op `auth.users`
- 7 helper-functies: `handle_updated_at`, `handle_service_usage_count`, `handle_single_default_reminder`, `handle_new_auth_user`, `generate_invoice_number` (atomic), `generate_credit_note_number`, `get_dashboard_stats`
- RLS aan op alle tabellen met `USING` + `WITH CHECK` voor INSERT-safety
- Storage bucket `logos` (private, 2 MB, png/jpeg/svg) met 4 per-user RLS policies
- `types/database.ts` gegenereerd via `supabase gen types typescript` — placeholder vervangen (854 regels)
- Verificatiescript `scripts/verify-schema.mjs` met 30 checks — allemaal groen
- Migratie uitgevoerd via Supabase CLI (`supabase init` + `link --project-ref obxvotpcrcdmrsxoxcjz` + `db push`). Migration history nu lokaal aanwezig

**Afwijkingen van plan:**
- **Mollie encryptie:** Optie A gekozen — applicatie-level AES-256 met `MOLLIE_ENCRYPTION_KEY` env var (toegevoegd aan `.env.example`). Geen pgsodium/Vault. Kolom blijft `text` met base64 ciphertext + IV
- **activity_log:** Optie B gekozen — `activity_log_insert_own` policy verwijderd uit prompt. Alleen `SELECT` voor ingelogde gebruiker; alle INSERTs uitsluitend via `service_role` (webhooks, server API routes)
- **Factuurnummer race condition:** Optie B gekozen — `generate_invoice_number` doet `UPDATE … RETURNING` in één atomic statement. De trigger `handle_invoice_number_increment` uit de prompt is **niet** geïmplementeerd (overbodig en zou dubbele increments veroorzaken)
- **Migratie methode:** Optie B gelukt — Supabase CLI. Eén hick-up: het wachtwoord in `DATABASE_URL` was URL-encoded; voor `supabase link --password` moest het eerst worden gedecodeerd (`decodeURIComponent`). Direct opgelost
- **Verificatie:** in plaats van handmatige queries in Supabase Dashboard heb ik een `scripts/verify-schema.mjs` geschreven (vereist `pg` als dev-dep, toegevoegd) — geautomatiseerd, idempotent, herbruikbaar na elke migratie. Vermeld in `.prettierignore` is `types/database.ts` al; `scripts/` mappen worden gewoon door Prettier gepakt
- **RLS-test met twee echte users:** uitgesteld — vereist werkende registratie + login (Fase 2). De RLS-policy-definities zijn wel geverifieerd: aanwezig, juiste cmd, juiste USING/WITH CHECK expressies

**Nieuwe taken (toegevoegd):**
- **Encryptie utility** voor Mollie key (Fase 6 — Mollie koppeling): `lib/crypto/mollie.ts` met `encryptMollieKey(plain)` / `decryptMollieKey(ciphertext)` op basis van `MOLLIE_ENCRYPTION_KEY`. Format: `<iv-hex>:<ciphertext-base64>`. Komt natuurlijk in 6.1
- **`MOLLIE_ENCRYPTION_KEY` lokaal genereren** door Johnny: `openssl rand -hex 32` → in `.env.local` zetten. Voor Vercel envs idem doen vóór Fase 6
- **`pg` als dev-dep** toegevoegd voor verificatie/migratiescripts (geen runtime impact)
- **RLS-integration test met 2 users** verplaatst naar Fase 2 — komt na werkende registratie

---

### Fase 1.3 — Environment variables controleren *(afgerond 25 mei 2026)*

**Wat is gebeurd:**
- `lib/env.ts → validateEnv()` runtime-uitgevoerd tegen `.env.local` — alle vijf required vars present
- TypeScript (`tsc --noEmit`) en ESLint (`npm run lint`) regression: 0 fouten / 0 warnings
- Dev server start `Ready in 4.3s` zonder env-warnings, automatisch op vrije poort (3002 — 3000/3001 nog in gebruik door restjes vorige Fase-runs)
- HTTP-tests: `/` → 200 + correcte title, `/dashboard` → 307 → `/login?redirectTo=%2Fdashboard`, `/login` → 404 (verwacht, route komt in Fase 2)
- End-to-end smoke test (`scripts/smoke-supabase.mjs`): anon-client haalt 0 rijen op `clients` (RLS blokkeert correct), onbestaande tabel geeft error (negative control), RPC `get_dashboard_stats({p_user_id})` is aanroepbaar en retourneert JSON met de 4 verwachte velden — bewijst dat env vars + Supabase clients + remote schema bij elkaar werken

**Afwijkingen van plan:**
- **Eigenaar veranderd 🧑 → 🤖**: in de oorspronkelijke planning was 1.3 ingepland als handmatige check ("controleer dat npm run dev start"). Volledig automatiseerbaar, dus geautomatiseerd uitgevoerd; Johnny hoeft hier niets meer voor te doen
- **Smoke test toegevoegd**: niet expliciet in 1.3 vereist, wel toegevoegd omdat we anders pas in Fase 2 zouden ontdekken of de Supabase-keten echt werkt. Klein script, herbruikbaar voor toekomstige sanity checks

**Nieuwe taken:**
- Geen — Fase 1 is compleet en klaar voor Fase 2

---

### Fase 1 — Overall afronding *(25 mei 2026)*

Drie sub-fases (1.1 fundament, 1.2 schema, 1.3 env-check) opgeleverd in één werkdag. Stack-keuzes vastgelegd (Next 15, Tailwind v4, shadcn v4 met base-nova, Supabase EU-Frankfurt). Database staat klaar met 9 tabellen, volledige RLS, 7 helper-functies en gegenereerde TypeScript types. Twee dev-only scripts (`verify-schema.mjs`, `smoke-supabase.mjs`) zijn herbruikbaar voor latere fases. Eén `pg` dev-dep toegevoegd voor die scripts.

**Openstaande follow-ups vanuit Fase 1:**
- Initial commit + push naar GitHub `invora` repo (al sinds 1.1 openstaand — nu kan dit als één coherente "Fase 1" commit)
- `MOLLIE_ENCRYPTION_KEY` lokaal genereren (`openssl rand -hex 32`) vóór Fase 6
- ThemeProvider met `next-themes` ingepland in Fase 3.1
- RLS-2-user-integration-test ingepland in Fase 2

---

### Fase 2 — Authenticatie en onboarding *(afgerond 25 mei 2026)*

**Wat is gebouwd:**
- **Service role client** `lib/supabase/service.ts` — bypast RLS, alleen server-side
- **Validatieschema's** uitgebreid (`lib/validations/index.ts`): register, login, forgotPassword, resetPassword, termsAcceptance, onboardingStep1, onboardingStep2 — allemaal Zod 4-compatibel met `.refine()` voor verplichte booleans
- **API routes** voor mutations (iOS-ready): `/api/onboarding/step1`, `/api/onboarding/step2`, `/api/auth/accept-terms` — alle met `getUser()` auth-check + Zod parsing + Supabase update
- **Middleware** uitgebreid met onboarding redirect: ingelogd + `onboarding_completed=false` + niet op `/welcome`/`/onboarding` → redirect naar `/welcome`. `/reset-password` en `/forgot-password` uit AUTH_ROUTES gehaald zodat Supabase-link sessies niet meteen worden weggeleid
- **Auth-pagina's** in `app/(auth)/`: gesplitste layout (formulier links, sage green gradient rechts met tagline + © Work Remote, op mobiel alleen formulier). Pagina's: `register`, `register/verify`, `login`, `forgot-password`, `reset-password` + eigen `loading.tsx` en `error.tsx`
- **Registratieformulier** met Google login knop, wachtwoordsterkte-indicator (te kort/zwak/gemiddeld/sterk), toon/verberg wachtwoord toggle, twee verplichte checkboxes (voorwaarden + privacy met externe links), inline Zod-validatie, fout-mapping ("User already registered" → klik naar login)
- **E-mailbevestigingspagina** met SVG-illustratie (envelop + persoon in sage green/warm zand), 60-seconden cooldown op "opnieuw versturen" knop, e-mail uit sessionStorage gelezen met fallback op invoerveld
- **OAuth callback** (`app/auth/callback/route.ts`): wisselt code → sessie, checkt `terms_accepted_at` (Google users) en `onboarding_completed`, en redirect naar `/auth/accept-terms`, `/welcome` of `/dashboard`
- **Google OAuth terms-acceptatie** (`app/auth/accept-terms/`): kaart-stijl pagina, begroet met voornaam uit Google account (`given_name` via auth-trigger), twee checkboxes → POST naar `/api/auth/accept-terms` → redirect `/welcome`
- **Login** met Google knop, "of" divider, toon/verberg wachtwoord, wachtwoord vergeten link, foutmapping ("Invalid login credentials" / "Email not confirmed"), URL-parameter handling voor `?error=auth_callback_failed` en `?message=password_updated`, redirect honourt `?redirectTo=`
- **Wachtwoord vergeten:** stuurt magic link via `resetPasswordForEmail`, toont altijd dezelfde melding (verbergt of e-mail bestaat)
- **Wachtwoord reset:** detecteert sessie (anders "link verlopen" foutmelding), wachtwoordsterkte indicator, na succes uitloggen + redirect naar `/login?message=password_updated`
- **Welkomstscherm** en **onboarding** in nieuwe route group `app/(onboarding)/` (naast `(app)` en `(auth)`) — zo blijven ze buiten de straks gebouwde app-sidebar:
  - `/welcome`: server component, fetcht `first_name`, toont SVG-illustratie (figuur die naar knop wijst), groene gradient CTA "Account instellen →"
  - `/onboarding`: server-side onboarding-check (al voltooid → `/dashboard`), client form met progress balk (50% / 100%), stap 1 (KvK optioneel met validatie-vinkje, bedrijfsgegevens, IBAN met live formatter + validatie-vinkje), stap 2 (twee BTW-kaarten met Lucide-icons FileCheck/Receipt, sage green geselecteerde border)
- **Placeholder-pagina's** `app/voorwaarden/page.tsx` en `app/privacy/page.tsx` — werkende links vanuit registratie + accept-terms, gemarkeerd als placeholder tot Fase 12 inhoudelijke teksten oplevert
- **Herbruikbare componenten** in `components/app/auth/`: `GoogleLoginButton`, `PasswordStrength`

**Afwijkingen van plan:**
- **Welkomstscherm + onboarding in eigen route group `(onboarding)`** i.p.v. `(app)`. De prompt stond beide opties expliciet toe. Reden: in Fase 3 krijgt `(app)` een sidebar — door `/welcome` en `/onboarding` daar buiten te houden, hoeven we straks geen conditionele "verberg sidebar voor deze paden" te bouwen
- **Voorwaarden/privacy placeholders bewust aangemaakt** — antwoord van Johnny op vraagstelling tijdens fase. Auth-flow heeft verplichte juridische links; 404 bij klikken = juridisch zwak. Definitieve tekst komt in/voor Fase 12
- **`/reset-password` en `/forgot-password` uit AUTH_ROUTES verwijderd** — Supabase logt de gebruiker bij een reset-link al in voordat hij op `/reset-password` aankomt. Als ingelogde users automatisch worden weggeleid van auth-routes, werkt de reset-flow niet
- **Google OAuth knop is gebouwd maar werkt nog niet** — vereist dat Johnny in Google Cloud Console OAuth-credentials aanmaakt en die in Supabase invoert. Knop staat klaar, geeft tijdens klik nu een Supabase fout (geen provider geconfigureerd). Geen blocker voor MVP-build
- **Supabase Auth dashboard-instellingen niet automatisch te verifiëren** — Johnny moet handmatig controleren: Email confirmations aan, Site URL = `NEXT_PUBLIC_APP_URL`, redirect allowlist met `http://localhost:3000/**` en `http://localhost:3003/**`, Nederlandse e-mail templates voor "Confirm signup" en "Reset password"
- **Pre-existing lint-fout in `scripts/smoke-supabase.mjs`** gefixt (ongebruikte `data` variabele) zodat lint schoon blijft
- **Zod 4-syntax** voor verplichte booleans (`z.boolean().refine((v) => v === true)`) i.p.v. `z.literal(true, { errorMap })` uit prompt — Zod 4 heeft `errorMap` hernoemd naar `error`. Refine is robuuster en draagt de bedoeling beter over

**Tests:**
- `npx tsc --noEmit` → 0 fouten
- `npm run lint` → schoon
- `npm run build` → 26 routes gegenereerd, geen errors
- HTTP-tests publieke routes: register/login/forgot/reset/verify/voorwaarden/privacy → 200
- HTTP-tests beveiligde routes: /dashboard, /welcome, /onboarding → 307 → /login?redirectTo=…
- HTTP-tests speciale routes: /auth/callback zonder code → 307 → /login?error=auth_callback_failed; /auth/accept-terms zonder auth → 307 → /login
- HTTP-tests API: POST /api/onboarding/step1, /step2, /api/auth/accept-terms zonder auth → 401
- End-to-end integratietest (`scripts/test-auth-flow.mjs`, 16/16 ✓): user aanmaken via admin API → auth-trigger maakt public.users rij met juiste `first_name` → `onboarding_completed=false` → onboarding step 1 + step 2 updaten correct → `btw_vrijgesteld=true` en `onboarding_completed=true` na step 2 → **RLS-test met 2 echte users:** user A kan eigen rij lezen, user B krijgt `null` voor user A (RLS blokkeert) — hiermee is de openstaande RLS-test uit Fase 1.2 ook afgevinkt
- Responsive: visuele check niet mogelijk zonder browser maar layout (`flex` met `lg:flex-1`-paneel verborgen op mobiel) volgt mobile-first patroon, build succesvol

**Handmatige acties voor Johnny:**
1. **Supabase dashboard → Authentication → Settings:** email confirmations aan, Site URL = `NEXT_PUBLIC_APP_URL`, voeg `http://localhost:3000/**` en `http://localhost:3003/**` toe aan redirect allowlist (+ later `https://invora.nl/**`)
2. **Supabase → Email templates:** vervang "Confirm signup" en "Reset password" met Nederlandse teksten uit Fase 2-prompt (alleen kosmetisch — flow werkt al wel met defaults)
3. **Google OAuth credentials (optioneel voor MVP):** Google Cloud Console → OAuth 2.0 client ID → invullen in Supabase → Authentication → Providers → Google. Zonder dit werkt e-mail/wachtwoord normaal; Google-knop geeft alleen een foutmelding bij gebruik
4. **Test handmatig in browser** zodra je de Supabase-instellingen hebt gecheckt: register, ontvang bevestigingsmail, login, doorloop onboarding, controleer dat /facturen redirect naar /welcome voor een tweede testaccount dat onboarding nog niet heeft voltooid

**Nieuwe taken (toegevoegd):**
- `scripts/test-auth-flow.mjs` als herbruikbaar regressiescript bewaard — handig in latere fases om RLS niet te breken
- Voorwaarden + privacy placeholderteksten moeten in Fase 12 (of eerder als juridische tekst beschikbaar komt) worden vervangen door definitieve inhoud — staat al in scope van Fase 12 marketingsite

**Bug-fixes tijdens handmatige testronde (27 mei 2026):**

1. **Dubbele accept-terms voor e-mail/wachtwoord-registratie** — register-form vroeg de checkboxes wel uit, maar `terms_accepted_at` werd nooit opgeslagen, waardoor de callback iedereen onnodig naar `/auth/accept-terms` stuurde. Opgelost via:
   - Migratie `002_terms_in_signup_metadata.sql` — auth-trigger leest nu `terms_accepted_at` en `privacy_accepted_at` uit `raw_user_meta_data`
   - `register-form.tsx` stuurt beide timestamps mee in `signUp().options.data`
   - Google OAuth pad ongewijzigd (geen metadata → blijft via accept-terms gaan)

2. **"er" fallback voor lege voornaam** — `first_name || 'er'` in welkomstscherm + accept-terms gaf grammaticaal foutieve UI ("Welkom, er!"). Opgelost door conditionele headings: bij lege voornaam toon "Welkom bij Invora!" / "Welkom! Nog één stap." zonder naam.

3. **Google geeft niet altijd `given_name` mee** — bij oudere/persoonlijke Gmail-accounts ontvingen we alleen `name` of `full_name` (full name als één string), waardoor `first_name` leeg bleef. Opgelost door:
   - `accept-terms/page.tsx` detecteert lege voornaam en suggereert auto-extract (eerste woord van `given_name` → `name` → `full_name`, title-cased — "johnny van rhijn" → "Johnny")
   - `accept-terms-form.tsx` toont voornaam-veld conditioneel (alleen als nodig) met suggestie als default
   - `termsAcceptanceSchema` heeft optionele `first_name`
   - `/api/auth/accept-terms` accepteert en slaat optionele `first_name` op

4. **Google OAuth provider aangezet** — door Johnny credentials aangemaakt in Google Cloud Console (project "Invora", OAuth consent External/Testing, web client met `localhost:3000` + `obxvotpcrcdmrsxoxcjz.supabase.co` als origins). Client ID + Secret rechtstreeks via Supabase dashboard ingevuld (niet via Management API). Werkt nu end-to-end voor login + registratie.

5. **Supabase Auth config gezet via Management API** — `scripts/configure-supabase-auth.mjs` schrijft idempotent: NL bevestigings- + recovery-mail templates, `uri_allow_list` met alle dev poorten + productie URLs, site_url. Vereist eenmalig een Personal Access Token (revoked na gebruik).

**Aangemaakte dev-only scripts:**
- `scripts/check-user.mjs <email>` — toont auth.users + public.users state per gebruiker
- `scripts/apply-migration.mjs <pad>` — past SQL migratie toe via DATABASE_URL met `pg`
- `scripts/configure-supabase-auth.mjs` — idempotent Auth config via Management API

**Tests handmatige testronde (uit `TESTPLAN_FASE2.md`):**
- Alle 20 secties doorlopen door Johnny → akkoord
- Registratie, login, wachtwoord vergeten/reset, Google OAuth (na configuratie), onboarding, middleware-redirects, multi-user RLS, responsive design, URL-parameter mapping — allemaal geslaagd

---

## FASE 0 — Accounts en externe services (MVP)

> Doe dit allemaal vóór Fase 1. Geen code nodig.
> KvK API (0.6) en Postcode API (0.7) sla je nu over — die komen bij 3 betalende klanten.

- [!] 🧑 **0.1** Domein registreren — **UITGESTELD tot werkende web app**
  - Wordt opgepakt zodra de web app draait en deploy-klaar is (uiterlijk vóór Fase 13 lancering)
  - transip.nl → zoek "invora.nl" → registreer voor 1 jaar (~€10)
  - Stel nog geen nameservers in (doet Vercel later)
  - ⚠️ Risico bewust geaccepteerd: domeinnaam zou in de tussentijd door iemand anders geregistreerd kunnen worden
  - ✅ Klaar als: invora.nl staat op jouw naam in TransIP

- [x] 🧑 **0.2** GitHub repository aanmaken
  - Repo: https://github.com/johnnyvanrhijn/invora.git (Private)
  - Naam afgeweken van plan: `invora` i.p.v. `invora-web` — bijgewerkt overal
  - Nog geen iOS repo — die komt bij 10 klanten
  - ✅ Klaar

- [x] 🧑 **0.3** Supabase project aanmaken
  - Project: invora-production in Frankfurt (eu-central-1) — AVG ✅
  - Project ref: `obxvotpcrcdmrsxoxcjz`
  - Anon key + service_role key in .env.local ✅
  - DATABASE_URL (direct connection met URL-encoded wachtwoord) ✅
  - ℹ️ Supabase CLI installatie uitgesteld tot Fase 1.2 (wanneer we migraties gaan schrijven)
  - ✅ Klaar

- [x] 🧑 **0.4** Vercel account koppelen
  - Project: `johnnyvanrhijns-projects/invora` (prj_dLBw9jCjHuym75Tn4Qo2aYHrdzJf)
  - Production URL: invora-zeta.vercel.app
  - Eerste deploy faalde zoals verwacht (geen Next.js code yet) — wordt opgelost in Fase 1.1
  - Vercel CLI v54.4.1 lokaal geïnstalleerd + `vercel link` uitgevoerd
  - ✅ Klaar

- [x] 🧑 **0.5** Resend account aanmaken (domein verificatie uitgesteld)
  - resend.com → Sign up ✅
  - API Keys → Create API Key → naam: "invora-local" → key in .env.local ✅
  - ⚠️ Domein verificatie NU NIET uitvoeren — komt in taak 0.5b zodra invora.nl geregistreerd is
  - ✅ Klaar

- [ ] 🧑 **0.5b** Resend domein verificatie — **WACHT op 0.1**
  - Pas uitvoeren nadat invora.nl is geregistreerd in TransIP
  - resend.com → Domains → Add Domain → "invora.nl"
  - DNS records (SPF, DKIM, DMARC) toevoegen in TransIP DNS beheer
  - Wacht op verificatie (5–30 minuten)
  - ✅ Klaar als: domein verified groen in Resend dashboard

- [x] 🧑 **0.6** Mollie account aanmaken (voor testdoeleinden)
  - mollie.com → Aanmelden (op naam van Work Remote) ✅
  - Developers → API keys → Test + Live key in .env.local ✅
  - ✅ Klaar

- [!] 🧑 **0.7** Stripe account controleren — **UITGESTELD tot Fase 11**
  - Wordt opgepakt aan het begin van Fase 11 (Stripe abonnement) zodat we direct doortikken
  - Controleer of Stripe Tax is ingeschakeld voor NL (BTW 21%)
  - Dashboard → Developers → API keys → noteer Test publishable key + test secret key
  - Stripe CLI installeren: `npm install -g stripe` → `stripe login`
  - ✅ Klaar als: test keys genoteerd + Stripe CLI werkend

- [!] 🧑 **0.8** Uptime Robot account aanmaken — **UITGESTELD tot Fase 13.2**
  - Vlak voor MVP lancering oppakken (samen met 13.2 monitor instellen)
  - uptimerobot.com → Sign up (gratis)
  - ✅ Klaar als: account aangemaakt

- [x] 🤖 **0.9** .env.local + Vercel env vars
  - `.env.local` met alle MVP-vars + `.env.example` template ✅
  - Supabase URL + anon + service_role + DATABASE_URL ✅
  - Resend key ✅
  - Mollie test + live keys ✅
  - INVOICE_TOKEN_SECRET + INTERNAL_DASHBOARD_SECRET gegenereerd ✅
  - KVK + Postcode + Stripe + GA leeg (komen later per fase) ✅
  - Vercel env vars gepusht via CLI naar **Production + Development** (13 vars elk) ✅
  - ⚠️ **Preview environment leeg** — CLI heeft beperking in non-interactive mode voor preview-zonder-branch. Op te lossen wanneer we eerste feature-PR/preview gebruiken: ofwel via Vercel dashboard UI, ofwel via PAT + REST API. Niet kritiek voor MVP development op main branch.
  - ✅ Klaar voor Fase 1

---

## FASE 1 — Projectfundament (MVP)
*Vereist: Fase 0 afgerond*

- [x] 🤖 **1.1** Web app projectstructuur opzetten — *afgerond 25 mei 2026*
  - Next.js **15.5.18** App Router + TypeScript strict + **Tailwind v4** + shadcn/ui v4 (`base-nova` style, @base-ui/react onder de motorkap)
  - Invora design tokens in `app/globals.css` via `@theme` (Tailwind v4: geen `tailwind.config.ts` meer)
  - 23 shadcn componenten geïnstalleerd: button, input, label, card, badge, dialog, dropdown-menu, tabs, **sonner** (i.p.v. toast), separator, skeleton, form (handmatig geschreven), select, textarea, switch, checkbox, table, sheet, progress, tooltip, popover, calendar, avatar
  - Plus Jakarta Sans via `next/font/google` → CSS-variable `--font-plus-jakarta`
  - Supabase clients (`lib/supabase/{client,server,middleware}.ts`) met Next 15 async cookies API
  - Route-protectie middleware (`middleware.ts`) — getest: `/dashboard` redirect 307 → `/login?redirectTo=…`
  - Volledige mapstructuur (`app/(auth|app|marketing)/...`, `api/`, `components/{ui,app,marketing}`, `lib/{supabase,validations}`, etc.) met `.gitkeep`s
  - `.gitignore` gemerged met bestaande Vercel/Claude regels
  - `.eslintrc` → ESLint 9 flat config (`eslint.config.mjs`), Prettier + `.prettierignore` voor vendor code
  - **iOS-readiness:** alle mutations via API routes (nog te bouwen in latere fases), geen server actions voor data
  - **Tests uitgevoerd:** `npx tsc --noEmit` (0 fouten), `npm run lint` (schoon), dev server op `localhost:3001` (3000 was bezet), homepage HTTP 200 met Invora tokens zichtbaar, middleware redirect werkt
  - **Initial commit naar GitHub:** nog te doen — Johnny voert handmatig uit zodra dit en 1.2 + 1.3 afgerond zijn

- [x] 🤖 **1.2** Supabase database schema aanmaken — *afgerond 25 mei 2026*
  - Migratie: `supabase/migrations/001_initial_schema.sql` (888 regels), uitgevoerd via Supabase CLI `db push` naar project `obxvotpcrcdmrsxoxcjz`
  - 9 tabellen: users, clients, services, invoices, invoice_lines, credit_notes, time_entries, reminder_templates, activity_log
  - Alle velden zoals INVORA_CONTEXT.md secties 3–16 + iOS-ready kolommen (`expo_push_token`, etc.)
  - 31 indexen, 10 triggers, 7 helper-functies
  - **RLS aan op alle tabellen.** Eigen-data-only via `auth.uid() = user_id` (met `WITH CHECK` voor INSERT)
  - **activity_log:** alleen SELECT — INSERTs uitsluitend via server-side service_role
  - **Factuurnummer atomic:** `generate_invoice_number()` doet `UPDATE … RETURNING` in één statement (race-condition-vrij); aparte increment-trigger vervalt
  - **Mollie API key:** kolom `mollie_api_key_encrypted text` + `MOLLIE_ENCRYPTION_KEY` env var (AES-256 via Node crypto, toegevoegd aan `.env.example`)
  - Storage bucket `logos` private, 2 MB limit, alleen png/jpeg/svg, RLS per user-folder
  - Auth trigger `on_auth_user_created` maakt automatisch `public.users` rij aan (haalt voornaam uit `raw_user_meta_data.first_name` of `given_name` voor Google OAuth)
  - TypeScript types gegenereerd (`types/database.ts`, 854 regels) — placeholder vervangen
  - **Verificatie:** `scripts/verify-schema.mjs` draait 30 checks (tabellen, RLS, triggers, functies, indexen, storage, activity_log policy-set). Alles groen
  - **Tests:** alle 9 tabellen aangemaakt, RLS aan, types compileren, `npx tsc --noEmit` schoon, `npm run lint` schoon
  - **RLS met 2 test users:** niet getest — vereist echte auth flow (komt in Fase 2)

- [x] 🤖 **1.3** Environment variables controleren — *afgerond 25 mei 2026*
  - `lib/env.ts → validateEnv()` slaagt: alle 5 required vars in `.env.local` (Supabase URL/anon/service_role, APP_URL, INVOICE_TOKEN_SECRET)
  - `npx tsc --noEmit` 0 fouten, `npm run lint` schoon
  - Dev server start op `localhost:3002` (3000/3001 in gebruik) zonder env-warnings
  - Homepage `/` HTTP 200 met juiste title
  - Middleware-redirect `/dashboard` → 307 → `/login?redirectTo=%2Fdashboard` werkt
  - End-to-end smoke test (`scripts/smoke-supabase.mjs`): anon-client → DB, RLS blokkeert (0 rijen voor anon), RPC `get_dashboard_stats` returnt 4 verwachte velden
  - Eigenaar veranderd van 🧑 naar 🤖: was als handmatige check ingepland maar volledig te automatiseren

---

## FASE 2 — Authenticatie en onboarding (MVP)
*Vereist: Fase 1 afgerond*

- [x] 🤖 **2.1** Volledige authenticatie flow — *afgerond 25 mei 2026*
  - **Registratiepagina** (`/register`): voornaam (verplicht) + e-mail + wachtwoord + wachtwoord bevestigen + checkbox voorwaarden (verplicht) + checkbox privacy (verplicht)
  - Voornaam wordt opgeslagen in `users.first_name` — dit is de naam die overal in de app verschijnt
  - **Google login:** voornaam automatisch overgenomen via OAuth profile (`given_name`)
  - Na Google OAuth callback: aparte stap voor accepteren voorwaarden + privacy als die nog niet geaccepteerd zijn
  - E-mailbevestiging verplicht — geen app-toegang zonder bevestigde e-mail
  - **Loginpagina** (`/login`): Google knop + e-mail/wachtwoord formulier
  - **Wachtwoord vergeten** (`/forgot-password`): e-mail invoer → magic link
  - **Nieuw wachtwoord** (`/reset-password`): nieuw wachtwoord instellen
  - **Wacht op bevestiging** (`/register/verify`): uitleg + "opnieuw versturen" knop (max 1x/minuut)
  - Route protectie middleware: `/app/*` vereist authenticatie + `onboarding_completed = true`
  - Layout auth pagina's: gesplitst (formulier links, sage green gradient rechts met tagline) — op mobiel alleen formulier
  - **Tests:** registreer met voornaam → e-mail bevestigen → inloggen → voornaam correct opgeslagen → toegang geblokkeerd zonder auth

- [x] 🤖 **2.2** Welkomstscherm + onboarding flow — *afgerond 25 mei 2026*
  - **Welkomstscherm** (`/welcome`): "Welkom bij Invora, [voornaam]!" + 2 zinnen uitleg + illustratie placeholder + knop "Account instellen"
  - Voornaam komt uit `users.first_name` — deze is al ingevuld via registratie
  - **Onboarding** (`/onboarding`):
    - Voortgangsbalk: sage green balk, vult per voltooide stap
    - **Stap 1 — Bedrijfsgegevens:** KvK-nummer veld (8 cijfers) + handmatig invullen van bedrijfsnaam, straat, postcode, stad + IBAN veld
    - KvK lookup: veld aanwezig maar API nog niet actief (MVP) — gebruiker vult handmatig in. Veld label: "KvK-nummer" met subtext: "We vullen binnenkort automatisch je gegevens in."
    - IBAN validatie: check NL IBAN formaat (begint met NL, 18 karakters)
    - Postcode/adres: handmatige invoer (MVP) — geen auto-invullen
    - **Stap 2 — BTW-status:** twee grote kaarten (BTW-vrijgesteld / BTW-plichtig) + ℹ️ tooltip
    - Na stap 2: `onboarding_completed = true` opslaan → redirect `/dashboard`
  - Middleware: ingelogd maar `onboarding_completed = false` → redirect `/welcome`
  - **Tests:** volledige onboarding flow, IBAN validatie (geldig + ongeldig), data correct opgeslagen, middleware redirect werkt

---

## FASE 3 — Dashboard en navigatie (MVP)
*Vereist: Fase 2 afgerond*

- [ ] 🤖 **3.1** Hoofdlayout + navigatie + dashboard
  - **Sidebar (desktop >1024px):**
    - Breedte: 240px uitgeklapt / 64px ingeklapt
    - Inklapknop bovenaan
    - Ingeklapt: alleen iconen (Lucide React), geen labels
    - Uitgeklapt: icoon + label
    - Items: Dashboard, Facturen, Cliënten, Uren, Diensten, Rapporten, Instellingen (onderaan)
    - Actief item: sage green achtergrond + witte tekst
    - Bovenaan: tekst "Invora" (geen logo — komt later na designer)
    - Onderaan: voornaam gebruiker + uitlogknop
  - **Bottomnavigatie (mobiel/tablet <1024px):**
    - 5 items: Dashboard | Facturen | [Nieuw] | Uren | Instellingen
    - Nieuw: centrale vierkante knop met afgeronde hoeken, sage green gradient
    - Actief: sage green icoon + label, inactief: grijs
  - **Dashboard** (`/dashboard`):
    - Persoonlijke begroeting: "Goedemorgen/middag/avond, [voornaam]!" (tijdgebaseerd)
    - Voornaam uit `users.first_name`
    - 3 KPI-kaarten (omzet deze maand, openstaand bedrag, laatste 3 facturen)
    - Skeleton loading op alle kaarten en diagram
    - Staafdiagram omzet per maand, laatste 6 maanden (Recharts BarChart)
    - Lege staat als geen facturen (abstracte SVG placeholder + CTA knop)
    - Coach mark na onboarding: sage green pulse rondom "Nieuw" knop, tooltip, verdwijnt na klik of 10 sec
  - **Dark mode:** `ThemeProvider` met `next-themes` toevoegen in `app/layout.tsx` (attribute `class`, default `system`). De CSS-tokens voor `.dark` staan al klaar in `globals.css` sinds Fase 1.1.
  - **Tests:** sidebar inklapbaar, responsive gedrag op alle breakpoints, coach mark werkt, skeleton loading zichtbaar, lege staat correct, dark mode volgt systeemvoorkeur

---

## FASE 4 — Cliënten en diensten (MVP)
*Vereist: Fase 3 afgerond*

- [ ] 🤖 **4.1** Volledig cliëntenbeheer
  - Cliëntenoverzicht: zoekbalk (instant op naam/e-mail), filter (Alle/Actief/Inactief/VIP/Gearchiveerd), alfabetische sortering
  - Lijstweergave: zebra patroon, sticky kolomkoppen (Naam | Categorie | Sessies | Omzet | Laatste factuur)
  - Drie puntjes menu per rij: Nieuwe factuur, Uren registreren, Bewerken, Archiveren, Verwijderen
  - Slide-over detailpaneel: naam + categorie + type + e-mail + standaard dienst + statistieken + activiteitslog
  - **Cliënt aanmaken/bewerken:**
    - Type toggle: Particulier / Zakelijk
    - Naam, e-mail, telefoon (verplicht: naam + e-mail)
    - Adres: straat, postcode, stad — handmatige invoer (MVP, geen postcode lookup)
    - Zakelijk extra: bedrijfsnaam, KvK-nummer, BTW-nummer, apart factuuradres, extra contactpersoon, afwijkende betalingstermijn
    - Standaard dienst (dropdown uit diensten bibliotheek)
    - Korting (type + waarde)
    - Categorie (Actief/Inactief/VIP)
    - Facturatie e-mailadres
    - Administratieve notitie (label: "Administratieve notitie", placeholder: "bijv. factureert altijd aan het einde van de maand", max 500 tekens)
  - Duplicaat detectie op e-mailadres
  - Archiveren/dearchiveren, verwijderen (alleen zonder openstaande facturen)
  - Bulk acties: archiveren + verwijderen
  - CSV import + CSV export + PDF export
  - **Tests:** aanmaken particulier + zakelijk, duplicaat detectie, alle CRUD acties, RLS check

- [ ] 🤖 **4.2** Diensten bibliotheek
  - Overzicht gesorteerd op usage_count DESC
  - Aanmaken/bewerken: naam + omschrijving + prijs + type (fixed/hourly) + categorie
  - Statistieken bovenaan: meest gebruikt + hoogste omzet
  - Archiveren (verdwijnt uit suggesties, historische facturen intact)
  - Verwijderen (invoice_lines.service_id → NULL, tekst blijft bewaard)
  - Bulk acties, zoeken op naam + omschrijving
  - **Tests:** aanmaken, sortering, archiveren, verwijderen + historische regels intact

---

## FASE 5 — Facturen (MVP)
*Vereist: Fase 4 afgerond*

- [ ] 🤖 **5.1** Volledig factuurproces
  - **Factuuroverzicht:** status tabs (Alle/Openstaand/Betaald/Te laat), zoekbalk, sortering oudste boven, paginering
  - Zebra patroon, sticky kolomkoppen, pill-badges voor status
  - Drie puntjes menu contextafhankelijk op status (zie INVORA_CONTEXT.md sectie 9)
  - Slide-over detailpaneel met contextafhankelijke actieknoppen
  - **Factuur aanmaken** (`/facturen/nieuw`):
    - Cliënt autocomplete (mini-modal "nieuwe cliënt" als niet gevonden: naam + e-mail)
    - Factuurnummer automatisch (INV-YYYY-NNN), aanpasbaar
    - Factuurdatum + vervaldatum (auto-berekend op betalingstermijn), datumkiezer met snelknoppen
    - PO-nummer (conditioneel op instellingen)
    - Factuurregels: dienst autocomplete, omschrijving (AVG-bewuste placeholder), aantal, prijs, totaal
    - Meest gebruikte dienst cliënt bovenaan in suggesties
    - Korting (toggle, type + waarde, auto-ingevuld als cliënt standaard korting heeft)
    - Totaaloverzicht + BTW-vrijstellingstekst
    - Persoonlijke noot (auto-ingevuld vanuit instellingen)
    - Automatisch concept opslaan elke 30 seconden
  - **E-mail preview modal** voor versturen (aanpasbaar onderwerp + berichttekst)
  - **Verstuurflow:** PDF genereren → e-mail via Resend → status update → activity_log
  - **Bevestigingsscherm:** groen vinkje animatie + 3 opties
  - **PDF generatie:** Puppeteer + @sparticuz/chromium, A4, layout zoals INVORA_CONTEXT.md sectie 9
  - **Publieke betaalpagina** (`/pay/[token]`): factuurinhoud + betaalknop (als Mollie) + PDF download + IBAN
  - Betaalpagina na betaling: `/pay/[token]/bedankt`
  - Betaalpagina na mislukte betaling: fout + opnieuw proberen + IBAN
  - **Handmatig markeren als betaald:** datum + methode
  - **Creditnota flow:** selecteer originele factuur → creditnota automatisch aangemaakt → verstuurflow
  - **Tests:** volledige aanmaak-verstuur-betaalflow, PDF kwaliteit, publieke betaalpagina, concept auto-save, creditnota, RLS

---

## FASE 6 — Mollie betaalintegratie (MVP)
*Vereist: Fase 5 afgerond*

- [ ] 🤖 **6.1** Mollie koppeling + webhook
  - Instellingen: Mollie toggle (standaard UIT) + stap-voor-stap instructie + API key invoer + validatie
  - Encrypted opslag Mollie API key
  - Betaallink genereren bij factuur versturen (als Mollie gekoppeld)
  - Webhook `/api/webhooks/mollie`: payment.paid → betaald + notificatie; stornering → openstaand + notificatie
  - IBAN altijd als fallback
  - **Tests:** API key validatie, betaallink test mode, webhook test, stornering, IBAN fallback

---

## FASE 7 — Urenregistratie (MVP)
*Kan parallel aan Fase 5-6. Vereist: Fase 4 afgerond*

- [ ] 🤖 **7.1** Volledige urenregistratie
  - Overzicht: twee tabbladen (Niet gefactureerd / Gefactureerd), gegroepeerd per dag
  - Statistieken: totaal uren + gefactureerd vs niet-gefactureerd + uitsplitsing per cliënt
  - **Registreren modal:** datum (+ waarschuwing >90 dagen) + cliënt (optioneel) + dienst + uren (decimaal, afronden op 0.25) + omschrijving + interne notitie
  - Totaalbedrag automatisch tonen als dienst type "hourly"
  - Bewerken + verwijderen altijd mogelijk
  - Omzetten naar factuur: selecteer registraties → keuze per/samengevoegd → factuur aanmaken
  - Fout als meerdere cliënten geselecteerd
  - PDF timesheet export
  - Filter op cliënt, periode, status; sortering op datum/cliënt/uren
  - **Tests:** registreren, afronden kwartieren, omzetten naar factuur, timesheet PDF, RLS

---

## FASE 8 — Betalingsherinneringen + notificaties (MVP)
*Vereist: Fase 5 afgerond*

- [ ] 🤖 **8.1** Herinneringen + notificaties
  - Vercel Cron dagelijks 09:00: factuurstatus check (verstuurd + vervaldatum verstreken → te_laat) + automatische herinneringen
  - Handmatige herinnering sturen (modal: template selectie + eenmalig tekst aanpassen)
  - Reminder templates beheer in instellingen (naam, onderwerp, berichttekst, variabelen als chips)
  - **E-mail notificaties via Resend:** factuur betaald, te laat, herinnering verstuurd, stornering
  - Proefperiode e-mails: dag 25 + dag 29
  - Wekelijkse samenvatting: maandag 09:00, alleen als openstaande facturen
  - Inactiviteitsmelding naar Johnny: 14 dagen geen login in proefperiode → e-mail naar johnny.van.rhijn@khe.eu
  - **Geen iOS push notificaties in MVP** — e-mail only totdat iOS app gebouwd is
  - **Tests:** cron simulatie, handmatige herinnering, e-mail notificatie test

---

## FASE 9 — Instellingen (MVP)
*Parallel te bouwen. Vereist minimaal Fase 3*

- [ ] 🤖 **9.1** Volledige instellingenpagina
  - Één lange scrollbare pagina, 6 secties, automatisch opslaan met toast
  - **Mijn bedrijf:** voornaam, KvK-nummer (veld aanwezig, geen lookup), bedrijfsnaam, adres, IBAN, logo upload (Supabase Storage, max 2MB), testfactuur sturen
  - **Facturen:** prefix, startnummer (waarschuwing bij verlaging), betalingstermijn, BTW-toggle (bevestigingsdialoog), standaard notitie, BCC e-mail, onderwerpregel template, alle toggles
  - **Betaallink:** Mollie sectie (zie Fase 6)
  - **Notificaties:** per type toggle voor e-mail (geen push in MVP)
  - **Beveiliging:** wachtwoord wijzigen, e-mailadres wijzigen, 2FA SMS configureren
  - **Abonnement:** plan status, betaalhistorie, Stripe portal link, account verwijderen meerstaps flow, data export ZIP
  - **Tests:** alle instellingen opslaan + herladen, logo upload, BTW toggle dialoog, account verwijderen flow

---

## FASE 10 — Rapportages (MVP)
*Vereist: Fase 5 + 7 afgerond*

- [ ] 🤖 **10.1** Rapportagemodule
  - 4 rapporten: Omzet, Openstaande facturen, Uren, Cliënten
  - Vrije periode selectie (begin- en einddatum)
  - Grafieken per rapport (Recharts), filter per rapport
  - PDF export (logo + naam + periode + grafiek + tabel)
  - CSV export (Nederlandse kolomnamen, UTF-8)
  - E-mail versturen met rapport
  - **Tests:** elk rapport met gevulde + lege data, alle exports, e-mail versturen

---

## FASE 11 — Stripe abonnement (MVP)
*Vereist: Fase 9 afgerond*

- [ ] 🤖 **11.1** Stripe checkout + webhooks + lees-only modus
  - Product + prijs in Stripe (€12/mnd ex BTW, Stripe Tax 21% NL)
  - Lanceringsaanbieding coupon (eerste betaalde maand gratis)
  - Checkout: `/api/stripe/checkout` + Customer Portal: `/api/stripe/portal`
  - Webhook: subscription events + invoice payment events
  - Proefperiode cron: banner dag 25+29 + e-mails
  - Lees-only modus: banner + blokkering POST/PUT/DELETE
  - **Tests:** checkout test mode, proefperiode verlopen, lees-only modus, Stripe CLI webhook test

---

## FASE 12 — Marketingsite (MVP)
*Volledig parallel te bouwen*

- [ ] 🤖 **12.1** Volledige marketingsite
  - Hoofdpagina: Hero, Features, Hoe het werkt, Prijzen, Testimonials, FAQ, CTA, Footer
  - Sticky navigatiebalk + hamburger mobiel
  - Abstracte figuur SVG illustraties (placeholder sage green/warm zand)
  - Blog overzicht + artikel pagina (3 placeholder artikelen)
  - SEO: title tags, meta descriptions, Open Graph, JSON-LD, sitemap.xml, robots.txt
  - Google Analytics 4 (conditioneel op env var)
  - Cookiemelding, privacy + voorwaarden pagina's (placeholder tekst)
  - **Tests:** alle secties desktop + mobiel, SEO meta tags, Open Graph check, sitemap bereikbaar

---

## FASE 13 — MVP lancering
*Vereist: Fase 1–12 afgerond*

- [ ] 🤖 **13.1** Security audit + productie-gereedheid
  - Alle API routes: auth checks, Zod validatie, RLS test met 2 users
  - Geen secrets in client-side code
  - Webhook signature verificatie (Stripe + Mollie)
  - Encrypted Mollie API key opslag
  - Performance: laadtijden <3 seconden
  - AVG compliance check (artikel 9, verwerkersovereenkomst)

- [ ] 🧑 **13.2** Uptime Robot monitor instellen
  - uptimerobot.com → Add Monitor → HTTP(s) → https://invora.nl → interval 5 min
  - ✅ Klaar als: monitor actief

- [ ] 🧑 **13.3** Google Search Console + Analytics koppelen
  - Search Console property + DNS verificatie in TransIP
  - Analytics Measurement ID → NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel → redeploy
  - ✅ Klaar als: Search Console verified + Analytics ontvangt pageviews

- [ ] 🧑 **13.4** Stripe live modus activeren
  - Account activeren (KvK, bankrekening, ID verificatie)
  - Live API keys → Vercel environment variables updaten
  - Nieuwe live webhook endpoint + STRIPE_WEBHOOK_SECRET updaten
  - ✅ Klaar als: eerste echte test betaling geslaagd

- [ ] 🧑 **13.5** Lancering
  - LinkedIn lanceringspost publiceren
  - ProductHunt launch plannen
  - Lanceringsaanbieding activeren in Stripe
  - Eerste 10 potentiële gebruikers persoonlijk benaderen
  - ✅ Klaar als: eerste betalende gebruiker in Stripe dashboard

---

## MIJLPAAL: 3 BETALENDE KLANTEN
*Activeer KvK API + Postcode API*

- [ ] 🧑 **M3.1** KvK API toegang aanvragen
  - developers.kvk.nl → Account + applicatie aanmaken → "Basisprofielen API"
  - Test API key ophalen (gratis)
  - Test met KvK-nummer: 90004973
  - KVK_API_KEY invullen in Vercel + lokaal .env.local
  - ✅ Klaar als: testverzoek gelukt

- [ ] 🧑 **M3.2** Postcode API toegang regelen
  - postcodeapi.nu → Account + API key
  - POSTCODE_API_KEY invullen in Vercel + lokaal .env.local
  - ✅ Klaar als: testverzoek gelukt

- [ ] 🤖 **M3.3** KvK lookup activeren in onboarding + instellingen
  - `/api/kvk/lookup?nummer=[8-cijfers]` API route bouwen (KvK Basisprofielen API)
  - Onboarding stap 1: KvK-nummer veld wordt lookup knop — automatisch bedrijfsnaam + adres invullen
  - Instellingen "Mijn bedrijf": vernieuwen-knop werkt nu ook echt
  - Foutafhandeling: 404 (niet gevonden), 403 (ongeldige key), 500 (API down) → handmatig invullen fallback
  - Subtext bij KvK veld verwijderen (die verwees naar "binnenkort")
  - **Tests:** lookup succesvol, fout scenario's, handmatige invoer fallback

- [ ] 🤖 **M3.4** Postcode lookup activeren in cliëntformulier
  - `/api/postcode/lookup?postcode=[pc]&huisnummer=[nr]` API route bouwen
  - Cliëntformulier: postcode + huisnummer velden → automatisch straat + stad invullen
  - Graceful fallback: API niet beschikbaar → geen foutmelding, handmatig invullen
  - **Tests:** lookup succesvol, fallback bij fout

---

## MIJLPAAL: 10 BETALENDE KLANTEN
*iOS app bouwen op basis van feedback eerste klanten*

- [ ] 🧑 **M10.1** Apple Developer Account aanmaken
  - developer.apple.com/programs → Enroll → Individual → $99/jaar
  - ✅ Klaar als: "Your enrollment is complete" ontvangen

- [ ] 🧑 **M10.2** GitHub iOS repository aanmaken
  - `invora-ios` (Private, geen template)

- [ ] 🤖 **M10.3** iOS app bouwen
  - React Native + Expo + NativeWind
  - Gedeelde Supabase backend (zelfde project, geen aanpassingen)
  - Kernfuncties: authenticatie, dashboard, facturen, uren, nieuw, instellingen
  - Push notificaties (Expo Notifications)
  - Haptic feedback
  - Deeplinks
  - EAS Build configureren
  - App Store publicatie
  - Aankondiging als gratis extra feature voor bestaande klanten

---

## Afhankelijkheidsgraph (MVP)

```
Fase 0 (accounts)
  └── Fase 1 (fundament)
        └── Fase 2 (auth + onboarding)
              └── Fase 3 (dashboard)
                    └── Fase 4 (cliënten + diensten)
                          ├── Fase 5 (facturen)
                          │     ├── Fase 6 (Mollie)
                          │     ├── Fase 8 (herinneringen)
                          │     └── Fase 10 (rapporten) ← ook Fase 7 nodig
                          └── Fase 7 (uren) [parallel aan 5]
                    └── Fase 9 (instellingen) [parallel, min. Fase 3]
                          └── Fase 11 (Stripe)
              └── Fase 12 (marketing) [volledig parallel]
  └── Fase 13 (lancering)

Bij 3 klanten → M3 (KvK + Postcode APIs)
Bij 10 klanten → M10 (iOS app)
```

---

## Voortgang

| Fase | Naam | Status | Opmerkingen |
|------|------|--------|-------------|
| 0 | Accounts + services | [x] | Klaar voor Fase 1. Uitgesteld: 0.1 domein (tot werkende app), 0.5b Resend domein, 0.7 Stripe (Fase 11), 0.8 UptimeRobot (Fase 13). Preview env vars: later via PAT/UI. |
| 1 | Projectfundament | [x] | 1.1 ✅ stack. 1.2 ✅ schema + types. 1.3 ✅ env + smoke test. Klaar voor Fase 2. |
| 2 | Auth + onboarding | [x] | 2.1 ✅ register/login/forgot/reset + Google + e-mail bevestiging. 2.2 ✅ welcome + 2-staps onboarding + middleware redirect. Voorwaarden/privacy als placeholder. Google OAuth credentials nog handmatig door Johnny. |
| 3 | Dashboard + nav | [ ] | Responsive: sidebar desktop, bottomnav mobiel |
| 4 | Cliënten + diensten | [ ] | |
| 5 | Facturen | [ ] | Kernfeature |
| 6 | Mollie | [ ] | |
| 7 | Uren | [ ] | Parallel aan 5 |
| 8 | Herinneringen | [ ] | E-mail only (geen push in MVP) |
| 9 | Instellingen | [ ] | Parallel |
| 10 | Rapportages | [ ] | Na 5 + 7 |
| 11 | Stripe | [ ] | Na 9 |
| 12 | Marketingsite | [ ] | Volledig parallel |
| 13 | Lancering | [ ] | MVP live |
| M3 | KvK + Postcode APIs | [ ] | Bij 3 betalende klanten |
| M10 | iOS app | [ ] | Bij 10 betalende klanten |
