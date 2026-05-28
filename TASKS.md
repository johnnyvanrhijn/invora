# TASKS.md — Invora Takenlijst
*Bijgehouden gedurende het gehele project. Altijd up-to-date houden.*
*Laatste update: 28 mei 2026*

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

**Vercel production deploy fixes (27 mei 2026):**

Tijdens het uitrollen naar productie liepen we tegen twee gecombineerde problemen aan:

1. **Vercel Framework Preset stond op "Other"** in het project (vanaf project-creation in Fase 0.4). Output-dir op `public` of root. Daardoor deployde Vercel de Next.js routes niet — alles gaf 404, zelfs `/`. Dit viel pas op nadat we de middleware-issues hadden geëlimineerd. Opgelost met **`vercel.json`**:
   ```json
   { "framework": "nextjs" }
   ```
   Dit overrult de dashboard-instelling permanent.

2. **`middleware.ts` met `@supabase/ssr` crashte in Edge runtime** met `__dirname is not defined`. Pogingen die niet werkten:
   - Inline `updateSession` (path-alias bundling probleem fixte wel, maar `__dirname` bleef)
   - `experimental.nodeMiddleware: true` (build OK, runtime gaf `Cannot use import statement outside a module`)
   - `"type": "module"` in package.json (zelfde issue)

   **Definitieve oplossing:** middleware volledig verwijderd. Alle auth- en onboarding-redirects zitten nu in server-component layouts:
   - `app/(app)/layout.tsx` → `getUser()` + onboarding-completed check
   - `app/(onboarding)/layout.tsx` → `getUser()` check
   - `app/(auth)/login/page.tsx` + `register/page.tsx` → ingelogd → /dashboard
   - Welcome + onboarding pages → onboarding voltooid → /dashboard

   Trade-off: server-side `getUser()` per beschermde request (lichte extra load), maar zero Edge-runtime risico.

**Architectuurregel (vastleggen):** geen `@supabase/ssr` in middleware op Vercel. Auth-checks doen we in server components met de standaard Supabase server client. Mocht er ooit weer een middleware nodig zijn, dan alleen Edge-safe code zonder Node-only dependencies.

---

### Fase 3 — Dashboard en navigatie *(afgerond 27 mei 2026)*

**Wat is gebouwd:**
- **App layout** (`app/(app)/layout.tsx`) — auth + onboarding-check, leest sidebar-cookie, geeft profile-velden door aan banner + sidebar
- **Sidebar** (`components/app/app-sidebar.tsx`) — client component met inklap-toggle, actieve route detectie via `usePathname()`, cookie-persistentie via `/api/sidebar`. Collapsed state toont initialen + logout-icoon onder elkaar, beide met tooltip. Lucide-iconen + base-ui tooltip
- **BottomNav** (`components/app/bottom-nav.tsx`) — fixed bottom, 5 items, centrale verhoogde sage green gradient "Nieuw" knop, safe-area padding voor iOS, alleen `< lg` zichtbaar
- **SubscriptionBanner** (`components/app/subscription-banner.tsx`) — toont oranje warning-banner bij `trial_expired`/`cancelled`, lichte amber-banner bij trial die binnen 5 dagen verloopt (dismissable via sessionStorage). Render `null` als geen actie nodig
- **Dashboard API** (`app/api/dashboard/stats/route.ts`) — wrapt de bestaande `get_dashboard_stats` Supabase RPC, auth-check via `getUser()`
- **Dashboard page** (server-component wrapper) + **dashboard-client.tsx** (client met fetch + skeleton/error states)
- **UI componenten in `components/app/dashboard/`**: greeting (tijdgebaseerd), kpi-cards (3 kaarten + RecentInvoicesCard), revenue-chart (Recharts BarChart met sage-gradient en NL maandafkortingen), empty-state (SVG figuur die naar CTA wijst), skeleton (3 cards + chart), coach-mark (mobile + desktop varianten met DOM-position tracking)
- **StatusBadge** (`components/app/status-badge.tsx`) — herbruikbaar voor alle 5 `InvoiceStatus` types, klaar voor Fase 5
- **Onboarding form** (`app/(onboarding)/onboarding/onboarding-form.tsx`) — redirect naar `/dashboard?coach=true` na stap 2 (was `/dashboard`)
- **ComingSoon component** + placeholders voor `/facturen` (+ `/facturen/nieuw`), `/clienten`, `/uren`, `/diensten`, `/rapporten`, `/instellingen`
- **Loading + error states** voor `(app)` route group + `dashboard/loading.tsx` met `DashboardSkeleton`
- **ThemeProvider** (`components/theme-provider.tsx`) en **TooltipProvider** toegevoegd in root layout — dark mode volgt systeemvoorkeur, geen toggle in UI

**Sidebar persistentie:**
- Cookie `invora_sidebar_collapsed` (1 jaar TTL, lax, niet-httpOnly zodat client desnoods ook kan lezen)
- Helper in `lib/sidebar.ts` + `POST /api/sidebar` zet de cookie
- Server-side gelezen in app layout → `defaultCollapsed` prop → geen layout-shift bij refresh

**Coach mark logica:**
- `useCoachMark()` hook leest `?coach=true` URL parameter, checkt `localStorage.invora_coach_mark_seen`, verwijdert `?coach=true` uit URL na show
- 10 seconden auto-dismiss
- `MobileCoachMark`: ring rondom centrale Nieuw-knop in bottomnav (alleen `< lg`)
- `DesktopCoachMark`: ring rondom DOM-element met gegeven `targetId` (default: `empty-state-cta`), positioneert via `getBoundingClientRect()` met resize/scroll listeners

**Afwijkingen van plan / keuzes (na vraagstelling):**
- **Lees-only modus alleen banner, geen API blokkering** (gekozen optie 1) — POST/PUT/DELETE blokkering komt in Fase 11 zodra Stripe webhook events bestaan om de status te wijzigen, en zodra latere fases mutatie-routes hebben om te blokkeren
- **Dark mode via ThemeProvider met system preference** (gekozen optie 1) — geen UI-toggle in deze fase, CSS-tokens voor `.dark` waren al klaar in `app/globals.css`
- **Sidebar collapsed: initialen + logout onder elkaar** (gekozen optie 1) — Slack/Linear-patroon, één klik om uit te loggen ook in collapsed mode
- **`tailwind.config.ts` bestaat niet** — we gebruiken Tailwind v4 met `@theme` in `app/globals.css`. `animate-pulse-ring` keyframe staat daar al sinds Fase 1.1, geen aanpassing nodig
- **Onboarding form locatie** — prompt verwees naar `app/(app)/onboarding/`, in Fase 2 hadden we het verplaatst naar `app/(onboarding)/onboarding/`. Daar de redirect aangepast
- **Recharts maand_kort** — DB returnt Engelse afkortingen (Jan/Feb/...), frontend overschrijft met NL afkortingen (`Mrt/Mei/Okt`) via een lokale array in `revenue-chart.tsx`
- **Auth-redirect zonder `redirectTo=`** — bekende beperking. Zonder middleware kent de server-component layout de huidige pathname niet automatisch. Bij niet-ingelogd op `/facturen` redirect nu naar `/login` (geen param), na inloggen land je op `/dashboard` ipv `/facturen`. Acceptabel voor MVP, oplosbaar met `next-url` header parsing of een nieuwe minimal middleware als het nodig wordt

**Tests:**
- `npx tsc --noEmit` → 0 fouten
- `npm run lint` → schoon
- `npm run build` → 26 routes, dashboard route 115 kB (Recharts), middleware-bundle 0 kB (geen middleware)
- HTTP smoke lokaal: `/` 200, `/login` 200, `/dashboard` zonder auth → 307 `/login`, `/api/dashboard/stats` zonder auth → 401, `/api/sidebar` POST → 200
- Visuele tests (sidebar animatie, coach mark, responsive, dark mode) staan in handmatig testplan voor Johnny — niet automatisch te valideren

**Nieuwe taken (toegevoegd):**
- Geen nieuwe TASKS.md items. `redirectTo=` parameter herstellen is geen blocker voor Fase 4, kan tegelijk met Fase 11 (lees-only blokkering) als beide ingrijpen op de middleware-laag

---

### Fase 12 — Marketingsite *(afgerond 28 mei 2026 — naar voren gehaald)*

**Wat is gebouwd:**

*Route group `app/(marketing)/`*
- **`layout.tsx`** — eigen marketing layout met `metadataBase`, OpenGraph en titel-template. Geen sidebar/bottomnav. Bevat `MarketingNav` boven `<main>` en `Footer` onder.
- **`page.tsx`** — server component die 10 secties orchestreert. Alle SEO meta tags (title, description, keywords, OG) aanwezig.
- **`contact/page.tsx`** — eenvoudige contact-pagina met sage green CTA-knop naar `mailto:support@invora.nl`. Verwijst naar Work Remote als bedrijf.
- **`voorwaarden/page.tsx`** + **`privacy/page.tsx`** — verplaatst vanuit `app/voorwaarden/` en `app/privacy/`. Content uit Fase 2 behouden (warning blok, juridisch correcte intro). Eigen `<main>` wrapper + "← Terug naar Invora" link verwijderd want marketing nav/footer doet dat al.
- **`blog/.gitkeep`** — folder blijft leeg conform prompt ("geen blog in deze fase").

*Components in `components/marketing/`*
- **`marketing-nav.tsx`** — sticky header (`top-0 z-50`), scroll-detectie via `useEffect` + `passive` listener, transparant boven de pagina → wit-met-blur + bottom-border bij `scrollY > 20`. Desktop links: Features/Hoe het werkt/Prijzen/FAQ + Inloggen + Gratis proberen knop. Mobiel: hamburger (Lucide `Menu`/`X`) opent een slide-down panel onder de header. Body-scroll-lock wanneer mobiel menu open is. Alle anchors als `/#section` zodat ze ook werken vanaf `/contact` etc.
- **`hero-section.tsx`** + **`hero-illustration.tsx`** — twee-koloms hero op desktop, gestapeld op mobiel. NL-pill-badge, headline met sage-green accent op "Invora maakt factureren simpel.", twee knoppen (gradient + ghost), drie checkmark vertrouwenspunten. Custom 500×400 SVG illustratie met laptop/browser frame, abstract figuur (silhouet zonder gezicht), zwevende factuur-kaart, sage green check-badge en decoratieve gradient cirkels. Geen tekst in de SVG.
- **`trust-bar.tsx`** — smalle balk met 4 items (Heart/Lock/Landmark/Star iconen + label), tussen hero en features.
- **`features-section.tsx`** — 6 feature-kaarten in `lg:grid-cols-3 sm:grid-cols-2` grid. Elke kaart: tweekleurig icoon-blokje, naam, pijnpunt (cursief grijs), oplossing. Hover `-translate-y-1 hover:shadow-md`. Iconen: FileText/ShieldCheck/CreditCard/Bell/Clock/Smartphone.
- **`app-mockup.tsx`** + **`app-mockup-section.tsx`** — gestileerde 600×400 SVG van het Invora dashboard (browser frame, sidebar, 3 KPI-kaartjes, 12-balks staafdiagram). Drie sage green checkmark-bulletpoints, "Probeer het zelf →" CTA naar `/register`. Tekst links / mockup rechts op desktop, omgekeerd op mobiel (`order-1` + `order-2`).
- **`how-it-works-section.tsx`** — licht sage green achtergrond. 3 stappen met grote `01`/`02`/`03` cijfers in sage green, titel + beschrijving. Pijl-iconen tussen kaarten op desktop (verborgen op mobiel via `hidden md:block`).
- **`comparison-section.tsx`** — vergelijkingstabel met 8 rijen × 4 kolommen. Invora-kolom heeft `border-2 border-invora-primary` rondom, sage-light achtergrond, groene checkmarks. Andere kolommen grijs met rode kruisjes / "Soms"-labels. Mobiel: horizontaal scrollbaar met een tip-tekst eronder.
- **`pricing-section.tsx`** — één gecentreerde prijskaart `max-w-[480px]` met `border-2 border-invora-primary`. Floating pill-badge "Meest gekozen door zorgprofessionals" overlapt de bovenrand. €12 in `text-5xl`, BTW-uitleg eronder. 8 checkmark features. Volle-breedte gradient CTA.
- **`testimonials-section.tsx`** — sage green gradient achtergrond. 3 placeholder testimonials in `md:grid-cols-3`. Witte kaarten met decoratief `Quote` icoon, 5-sterren ratings, cursieve quote, naam + beroep. PLACEHOLDER comment in source voor vervanging vóór lancering.
- **`faq-section.tsx`** — gebruikt shadcn `Accordion` (geïnstalleerd via CLI, `base-nova` variant met `@base-ui/react/accordion`). 7 vragen met uitgebreide antwoorden over prijs, proefperiode, BTW-vrijstelling, iDEAL, AVG, CSV import, opzeggen. Default multi-open. Subtekst boven met mailto-link voor extra vragen.
- **`cta-section.tsx`** — afsluitende sage gradient sectie met decoratieve witte blur-cirkels. Twee knoppen: witte primary "Gratis proberen →" + transparante outline "Inloggen". Vertrouwensregel eronder.
- **`footer.tsx`** — donker (`#1A1A1A`) — logo + tagline links, Privacy/Voorwaarden/Contact nav rechts. Onderste regel: copyright met dynamic year + "Made with ♥ in Nederland".

*SEO + root files*
- **`app/sitemap.ts`** — 4 entries (`/`, `/privacy`, `/voorwaarden`, `/contact`) met dynamic `lastModified: new Date()`. URL via `process.env.NEXT_PUBLIC_APP_URL`.
- **`app/robots.ts`** — Allow `/`, disallow alle app-routes (`/dashboard`, `/facturen`, etc.) + `/api`. Sitemap-URL via env var.

*Verwijderd*
- **`app/page.tsx`** (oude placeholder homepage) — botste met `app/(marketing)/page.tsx` op route `/`. Marketing-versie pakt nu de root.

**Keuzes gemaakt (na vraagstelling aan Johnny):**
1. **Voorwaarden + privacy locatie:** Optie A — verplaatst naar `app/(marketing)/voorwaarden/` en `app/(marketing)/privacy/` met `git mv` (history bewaard). Content uit Fase 2 ongewijzigd, alleen `<main>` wrapper en "Terug naar Invora" link verwijderd. URLs (`/voorwaarden`, `/privacy`) blijven gelijk — auth-flow links breken niet.
2. **SEO domein URL:** Optie A — `process.env.NEXT_PUBLIC_APP_URL` dynamisch in `layout.tsx`, `page.tsx`, `sitemap.ts`, `robots.ts`. Fallback `https://invora.nl` voor productie zodra het domein actief is. Geen refactor nodig na domein-registratie.

**Eigen keuzes (gedocumenteerd zonder vraag):**
- **`/#features` cross-page anchors** — anchors werken ook vanaf `/contact` of `/privacy`. Next.js scrollt automatisch na navigatie.
- **Accordion via shadcn CLI** (`npx shadcn@latest add accordion --yes`) — `base-nova` variant op `@base-ui/react/accordion`. API: `Accordion` (Root) > `AccordionItem value="..."` > `AccordionTrigger` + `AccordionContent`. Default multi-open is voor FAQ prettig.
- **Marketing nav scrollY threshold = 20px** — eerste pixels blijven transparant; daarna wit + `supports-backdrop-filter:backdrop-blur-md`.
- **Body-scroll-lock** bij mobiel menu open — voorkomt achtergrond-scroll achter het slide-down panel.

**Afwijkingen van prompt:**
- **Mobiel menu = slide-down panel onder de header**, niet shadcn `Sheet side="right"`. Reden: de prompt liet "Sheet of een eenvoudige absolute div" open. Een full-height side sheet is overkill voor 4 nav-items + 2 knoppen. De slide-down panel sluit beter aan bij verwachte mobile-web-patronen (Stripe, Linear) en is sneller.
- **Tekst boven FAQ** vermeldt `mailto:support@invora.nl` als fallback voor onbeantwoorde vragen — niet expliciet in prompt, voelt natuurlijk.
- **Robots disallow `/api`** toegevoegd naast de app-routes uit de prompt — verstandiger, voorkomt dat crawlers API-routes proberen te indexeren.

**Tests uitgevoerd:**
- `npx tsc --noEmit` → 0 fouten (na `rm -rf .next` om stale type cache van verplaatste bestanden weg te halen)
- `npm run lint` → schoon
- `npm run build` → 39 routes (was 36, +`/contact`, +`/sitemap.xml`, +`/robots.txt`), homepage nu **static** prerendered, `/` 8.11 kB / 119 kB First Load. Geen warnings.
- **Visuele tests** (kleuren, animaties, responsive, navigatie hover/scroll, hamburger animatie, vergelijkingstabel scroll) staan in handmatige testronde voor Johnny — vereist browser.

**Handmatige acties voor Johnny:**
1. Browser-test `/` desktop + mobiel (375px iPhone-emulatie of echte telefoon)
2. Klik door alle nav-anchors (Features/Hoe het werkt/Prijzen/FAQ) — controleer smooth scroll en sticky-nav blur na scrollen
3. Klik vanaf `/contact` op een nav-anchor — controleer cross-page anchor werking
4. Klik op alle CTA-knoppen — `/register` + `/login` redirects moeten werken (gebouwd in Fase 2)
5. FAQ accordion open/sluit
6. Vergelijkingstabel op mobiel — horizontaal scrollbaar
7. Hamburger menu op mobiel — open/sluit + body scroll lock
8. Check `/sitemap.xml` en `/robots.txt` URLs

**Nieuwe taken:**
- Geen nieuwe TASKS.md items. Wel een notitie voor de toekomst:
  - **Testimonials** zijn gemarkeerd met `PLACEHOLDER` comment — vervangen door echte voor lancering (Fase 13.5).
  - **Privacy/voorwaarden teksten** worden definitief vóór lancering (Fase 13 of eerder als juristische tekst beschikbaar).

---

### Mobiele UX optimalisatie *(afgerond 28 mei 2026, na Fase 4)*

**Wat is gebouwd:**
- **Mobiele sticky header** (`components/app/mobile-header.tsx`) — sage green balk, hamburger links, paginatitel gecentreerd, alleen `lg:hidden`. Volgt `env(safe-area-inset-top)` voor iOS-notch.
- **Slide-in navigatiemenu** (`components/app/mobile-nav.tsx`) — `Sheet side="left" w-72`. Volledige navigatie (Dashboard, Facturen, Cliënten, Uren, Diensten, Rapporten + Instellingen onderaan) inclusief actieve-route markering. Footer met initialencirkel, voornaam en logout-knop. Sluit automatisch bij klikken op een item.
- **MobileLayoutWrapper** (`components/app/mobile-layout-wrapper.tsx`) — client wrapper die paginatitel afleidt via `usePathname` en de open/closed state van het menu beheert. Wordt aangeroepen vanuit de server-side `app/(app)/layout.tsx`.
- **Mobiele lijstweergave cliënten** (`components/app/clients/mobile-client-list.tsx`) — vervangt de tabel onder `lg`. Per rij: checkbox + naam (met `[GEARCHIVEERD]` label) + e-mail + categoriebadge + drie-puntjes menu met dezelfde 6 acties als desktop. `min-h-[64px]` voor tap-comfort, `active:bg-accent/30`.
- **Mobiele lijstweergave diensten** (`components/app/services/mobile-service-list.tsx`) — analoog: naam + categorie · prijs onderregel + prijstype-badge + drie-puntjes (bewerken/archiveren/verwijderen).
- **Herbruikbare FilterChips** (`components/app/filter-chips.tsx`) — horizontaal scrollbare chip-rij met `scrollbar-hide`. Gegenereerd type-veilig via generic `<T extends string>`.
- **ServiceDetailSheet** (`components/app/services/service-detail-sheet.tsx`) — read-only slide-over met naam + prijstype-badge + details (prijs, categorie, omschrijving) + statistiek-blokken (gebruik + omzet) + "Bewerken"-knop onderaan. Identiek patroon als `ClientDetailSheet`.
- **GET /api/services/[id]** toegevoegd aan bestaande route file — auth-check + RLS via `user_id`-filter + omzet via `getServiceRevenueMap` helper. Retourneert het volledige `Service` type.
- **Cliëntenpagina** (`clienten-client.tsx`): `<h1>` verborgen op mobiel, zoekbalk full-width met `bg-background`, filter dropdown op desktop / chips op mobiel, paginering werkt voor beide weergaven.
- **Dienstenpagina** (`diensten-client.tsx`): `<h1>` verborgen op mobiel, "Toon gearchiveerde diensten" checkbox vervangen door dropdown (desktop) + chips (mobiel) met Alle/Gearchiveerd — consistent met cliënten. Klikken op een dienstrij opent nu de read-only slide-over (was: direct bewerken). Bewerken via drie-puntjes of via "Bewerken"-knop in de slide-over.

**Keuzes gemaakt (na vraagstelling aan Johnny):**
1. **Paginatitel-aanpak (Optie B):** centraal mapping in MobileLayoutWrapper via `usePathname()` — geen plumbing per page.tsx, geen Context. Eenvoudig, token-efficiënt, dekt alle huidige routes. Fallback `'Invora'` voor onbekende routes.
2. **Titel-duplicatie (Optie A):** `<h1>` verbergen op mobiel (`hidden lg:block`), actieknoppen-rij blijft. Header in sage green doet de wayfinding op mobiel.

**Afwijkingen / inhoudelijke wijzigingen:**
- **Filter diensten:** "Alle | Gearchiveerd" is een aparte view (niet meer optionele toon-toggle bovenop alles). Consistent met cliënten-filter sinds Fase 4. De BulkActionBar krijgt `showUnarchive` doorgegeven afhankelijk van actieve filter — bestaande bulk API ondersteunde `unarchive` al.
- **INVORA_CONTEXT.md sectie 6** vermeldt dat Diensten en Rapporten "bereikbaar via Instellingen of direct via URL". De hamburger-menu is een nieuwe, expliciet gevraagde ontsluiting. Geen wijziging in bottomnav (blijft 5 items met centrale Nieuw-knop). Bottomnav en hamburger overlappen voor 4 items — acceptabel, hamburger is de canonical map.
- **Diensten lijst client-side filter:** in 'archived'-view geeft API alles (omdat `include_archived=true` zonder strict-archived filter), client-side filter `.filter(s => s.archived)` knipt niet-archived eruit. Geen API-uitbreiding nodig.

**Tests uitgevoerd:**
- `npx tsc --noEmit` → 0 fouten
- `npm run lint` → schoon
- `npm run build` → 36 routes, geen warnings. `/clienten` 19.2 kB / 245 kB, `/diensten` 6.42 kB / 232 kB. Nieuwe API route `/api/services/[id]` aanwezig.
- **Visuele/responsive tests:** vereist handmatig op echte mobiel of Chrome DevTools 375px — testplan in prompt sectie "Stap 8".

**Handmatige acties voor Johnny:**
- Test 1: sticky header titel + scroll-gedrag
- Test 2: hamburger menu open/sluit + alle routes bereikbaar
- Test 3: desktop (1280px) onaangetast — geen mobile header zichtbaar
- Test 4: mobiele lijst cliënten + slide-over flow
- Test 5: filter chips selectie + horizontaal scrollen
- Test 6: zoekbalk witte achtergrond + focus ring
- Test 7: dienst slide-over read-only + bewerken flow
- Test 8: desktop diensten — slide-over opent ook hier bij klik op rij (gedragsverandering!)

**Handmatige tests:** door Johnny op echte mobiel uitgevoerd (28 mei 2026) → alles werkt. Fase 4 + mobiele UX goedgekeurd.

**Nieuwe taken:** geen.

---

### Fase 4 — Cliënten en diensten *(afgerond 27 mei 2026, akkoord 28 mei 2026)*

**Wat is gebouwd:**

*Cliënten*
- **API routes** (alle `getUser()` + Zod-gevalideerd, iOS-ready):
  - `GET/POST /api/clients` — gepagineerde lijst (20/pagina, `count: 'exact'`), filter op `category` (alle/actief/inactief/vip/archived), zoek op naam+email via `or(name.ilike,email.ilike)` met escapen van `%/_`, sortering alfabetisch. POST doet duplicate-check op e-mail en retourneert 409 met `{ duplicate: true, existingName }` tenzij `force: true`
  - `GET/PUT/DELETE /api/clients/[id]` — DELETE blokkeert bij openstaande facturen (status verstuurd/te_laat) met 409 `{ hasOpenInvoices: true }`
  - `POST /api/clients/[id]/archive` — set archived flag + archived_at
  - `POST /api/clients/bulk` — archive/unarchive/delete in één call, retourneert `{ processed, skipped, skippedIds, reason? }`. Delete slaat cliënten met openstaande facturen automatisch over
  - `POST /api/clients/import` — multipart upload, gebruikt `papaparse` server-side, valideert met `csvClientRowSchema`, skipt duplicaten
  - `GET /api/clients/export` — CSV met UTF-8 BOM, Nederlandse kolomnamen, inclusief omzet + sessies + laatste factuurdatum
  - `GET /api/clients/check-email?email=&exclude_id=` — aparte route voor onBlur duplicaat detectie
- **`lib/clients/stats.ts`** — helpers `getClientListStats` (lijst), `getClientDetailStats` (slide-over), `getServiceNamesByIds`. Aparte queries i.p.v. Supabase nested JOIN (gekozen optie). Geeft 0/null terug zolang `invoices`/`time_entries` nog leeg zijn — geen Fase 5/7 dependency
- **Pagina** `app/(app)/clienten/page.tsx` (server wrapper) + `clienten-client.tsx` (volledige UI)
- **UI features:** zoekbalk met 300ms debounce, filter dropdown (5 opties), bulk action bar bij selectie, skeleton tijdens laden, lege staat met CTA, paginering met "Pagina X van Y" + total count
- **Tabel:** sticky header, zebra `even:bg-invora-background/30`, gearchiveerd `opacity-60` + `[GEARCHIVEERD]` label, klikbare naam → slide-over, drie-puntjes menu (Lucide `MoreHorizontal`) met 6 acties contextafhankelijk
- **`ClientDetailSheet`** — `Sheet` van rechts, breedte 480px desktop / full mobile, drie blokken: basisgegevens, statistieken (3 mini-kaarten), activiteitslog met gekleurde bolletjes per event type
- **`ClientFormDialog`** — `Dialog` max-w-2xl, controlled state (zonder react-hook-form voor token-efficiency). Acht secties: type-toggle, basis, adres, zakelijk (conditioneel met `transition-all`), facturatie voorkeuren, korting (toggle + percentage/fixed), categorie, administratieve notitie met tellertje. Bij zakelijk wordt `name` label `Bedrijfsnaam` (gekozen optie — geen schemawijziging)
- **Duplicaat detectie:** onBlur op e-mailveld → `/api/clients/check-email` → gele warning banner. Bij submit retourneert API 409 met `duplicate: true` → `window.confirm()` → optioneel `{force: true}` opnieuw sturen
- **`CsvImportModal`** — drag-zone (click), template download (met BOM), client-side preview via papaparse, validatie per rij (groen ✓ / rood ✗ met error), max 10 rijen preview, bij import via FormData naar `/api/clients/import`, eindscherm met `imported/skipped/errors`

*Diensten*
- **API routes:**
  - `GET/POST /api/services` — lijst sorteert op `usage_count DESC` dan `name ASC`, optioneel `include_archived=true`
  - `PUT/DELETE /api/services/[id]` — invoice_lines.service_id is ON DELETE SET NULL (historische regels behouden tekst+prijs)
  - `POST /api/services/[id]/archive` + `POST /api/services/bulk`
- **`lib/services/stats.ts`** — `getServiceRevenueMap`: omzet per service via `invoice_lines` JOIN op betaalde `invoices`. 0 zolang Fase 5 nog niet bestaat
- **Pagina** `app/(app)/diensten/page.tsx` + `diensten-client.tsx`
- **Statistieken kaarten:** "Meest gebruikt" (eerste service met `usage_count > 0`) + "Hoogste omzet" (gesorteerd op total_revenue)
- **`ServiceFormDialog`** — `Dialog` max-w-md, simpel: naam, omschrijving (textarea), prijstype toggle, prijs (numeriek met € prefix + "per uur" suffix bij hourly), categorie. AVG-bewuste subtext bij omschrijvingveld

*Gedeelde componenten*
- **`ConfirmDialog`** — herbruikbaar voor alle bevestigingen. Gebruikt `Dialog` ipv `AlertDialog` (niet geïnstalleerd). Variant `destructive` voor verwijderen
- **`BulkActionBar`** — generiek voor cliënten + diensten, geeft archive/unarchive (afhankelijk van view), verwijderen en sluiten

*Validatieschema's + types*
- `clientSchema`, `serviceSchema`, `csvClientRowSchema`, `bulkActionSchema`, `archiveSchema` toegevoegd aan `lib/validations/index.ts`
- `ClientWithStats`, `ClientListItem`, `Service`, `ActivityLogEntry`, `PaginatedResult` toegevoegd aan `types/index.ts`

**Keuzes gemaakt (na vraagstelling aan Johnny):**
1. **Statistieken in lijst:** tonen met `0` / `—` nu, vullen automatisch wanneer Fase 5 + Fase 7 hun data leveren. Geen rework nodig. (Optie 1)
2. **PDF export:** **bewust overgeslagen in Fase 4** — alleen CSV-export, één knop ipv dropdown. PDF komt in Fase 5 of later wanneer Puppeteer al geïnstalleerd is. (Optie 3)
3. **Bedrijfsnaam bij zakelijk:** geen schemawijziging — bij zakelijk wordt het label `Naam` automatisch `Bedrijfsnaam` (alleen UI). Contactpersoon via bestaand `contact_name`. (Optie 1)
4. **Activity log:** geen cliënt-CRUD events. `activity_log` blijft puur factuur/betaling-events conform INVORA_CONTEXT.md. (Optie 1)
5. **Query strategie:** aparte queries voor statistieken (lijst + slide-over) ipv Supabase nested JOIN met expliciete FK-naam. Voorspelbaarder en makkelijker debuggen. (Optie 1)
6. **Filter 'Alle':** = niet-gearchiveerd, alle categorieën. 'Gearchiveerd' is een aparte view. Linear/Notion-patroon. (Optie 1)
7. **Duplicate check:** aparte route `/api/clients/check-email` voor onBlur. Voor submit zit logica in POST/PUT zelf (409 response). (Optie 1)

**Afwijkingen van plan:**
- **`window.confirm()` voor duplicate-doorzetten** in client-form — een tweede confirm dialog binnen het formulier overlapt visueel met de `Dialog` zelf in base-ui. Native `confirm` is pragmatisch; vervangbaar in Fase 12 polish.
- **AlertDialog niet beschikbaar** in shadcn `base-nova` registry — `ConfirmDialog` gebouwd bovenop `Dialog`. Identieke UX, één component minder om te onderhouden.
- **`papaparse` toegevoegd** als runtime dep (+ `@types/papaparse` als dep, niet devDep — wordt direct geïmporteerd in een server route). Geen alternatief in stdlib zonder zelf een CSV-parser te schrijven.

**Tests:**
- `npx tsc --noEmit` → 0 fouten
- `npm run lint` → schoon
- `npm run build` → 36 routes (was 26), `/clienten` 31.6 kB, `/diensten` 4.93 kB, alle 11 nieuwe API routes succesvol
- **`scripts/test-clients-services.mjs`** (10/10 ✓): 2 testgebruikers → cliënt + dienst aanmaken via service_role → RLS check (user B ziet niets) → user A ziet eigen data via anon+signIn → archive flag werkt → duplicate insert op DB-niveau mogelijk (check zit in app)
- HTTP smoke via dev server (curl): `/api/clients` zonder auth → 401, `/api/clients/check-email` → 401, `/api/clients/export` → 401, `/api/services` → 401, `/api/clients/bulk` POST → 401, `/api/services/bulk` POST → 401, `/clienten` → 307 → `/login`, `/diensten` → 307 → `/login`
- **Visuele tests** (formulier rendering, slide-over animatie, responsive tabel, CSV preview) staan in het handmatig testplan voor Johnny — vereist browser

**Handmatige acties voor Johnny:**
1. **Browser-test** beide pagina's: cliënt aanmaken (particulier + zakelijk), bewerken, archiveren, verwijderen; dienst aanmaken, prijstype toggle, archiveren. Test CSV import met de meegeleverde template.
2. **Optioneel: `redirectTo=`** voor cliënten/diensten — bij niet-ingelogd op `/clienten` redirect je nu naar `/login` zonder `?redirectTo=`. Bekende beperking sinds Fase 3.

**Nieuwe taken (toegevoegd):**
- Cliënten/diensten zijn **klaar voor Fase 5**. Factuurformulier kan direct cliënt-autocomplete (op `/api/clients?search=`) en dienst-suggesties (op `/api/services`) gebruiken.
- `default_service_id` voor cliënt is voorbereid — bij Fase 5 wordt deze automatisch geselecteerd in de factuurregel.
- `clients.payment_term_days` voor zakelijke cliënten wordt in Fase 5 gebruikt om vervaldatum te berekenen.

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

- [x] 🤖 **3.1** Hoofdlayout + navigatie + dashboard — *afgerond 27 mei 2026*
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

- [x] 🤖 **4.1** Volledig cliëntenbeheer — *afgerond 27 mei 2026*
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

- [x] 🤖 **4.2** Diensten bibliotheek — *afgerond 27 mei 2026*
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
| 3 | Dashboard + nav | [x] | 3.1 ✅ sidebar desktop, bottomnav mobiel, dashboard met KPIs + grafiek, coach mark, dark mode via system. Lees-only blokkering uitgesteld naar Fase 11. |
| 4 | Cliënten + diensten | [x] | 4.1 ✅ cliëntenbeheer + slide-over. 4.2 ✅ diensten + slide-over. Mobiele UX: sticky header, hamburger menu, lijstweergave + filter chips. Handmatig getest 28 mei 2026 — akkoord Johnny. |
| 5 | Facturen | [ ] | Kernfeature |
| 6 | Mollie | [ ] | |
| 7 | Uren | [ ] | Parallel aan 5 |
| 8 | Herinneringen | [ ] | E-mail only (geen push in MVP) |
| 9 | Instellingen | [ ] | Parallel |
| 10 | Rapportages | [ ] | Na 5 + 7 |
| 11 | Stripe | [ ] | Na 9 |
| 12 | Marketingsite | [x] | Naar voren gehaald. 10 secties, alle SEO, voorwaarden/privacy verplaatst naar (marketing)/, contact-pagina nieuw, sitemap.xml + robots.txt aanwezig. Handmatig browser-testen door Johnny. |
| 13 | Lancering | [ ] | MVP live |
| M3 | KvK + Postcode APIs | [ ] | Bij 3 betalende klanten |
| M10 | iOS app | [ ] | Bij 10 betalende klanten |
