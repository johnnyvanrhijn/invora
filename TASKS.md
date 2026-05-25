# TASKS.md — Invora Takenlijst
*Bijgehouden gedurende het gehele project. Altijd up-to-date houden.*
*Laatste update: mei 2026*

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

- [~] 🧑 **0.3** Supabase project aanmaken
  - supabase.com → New project → naam: "invora-production"
  - **VERPLICHT regio: Frankfurt (eu-central-1)** — AVG vereiste
  - Sterk wachtwoord instellen + opslaan in wachtwoordmanager
  - Settings → API → noteer: Project URL, anon key, service_role key ✅
  - Settings → Database → Connection string → noteer de URI ⚠️ NOG NIET INGEVULD in .env.local (DATABASE_URL leeg)
  - ✅ Klaar als: project draait, 4 sleutels genoteerd (3/4 — DATABASE_URL ontbreekt)

- [ ] 🧑 **0.4** Vercel account koppelen — **WACHT op initial commit**
  - vercel.com → Login met GitHub
  - New Project → Import `invora` repository → Framework: Next.js
  - Eerste deploy zal falen (geen Next.js code yet) — dat is ok, code volgt in Fase 1.1
  - Nog NIET environment variables instellen (komen later in Fase 0.9 wrap-up)
  - ✅ Klaar als: Vercel project aangemaakt + gekoppeld aan GitHub repo

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

- [ ] 🧑 **0.7** Stripe account controleren
  - Controleer of Stripe Tax is ingeschakeld
  - Dashboard → Developers → API keys → noteer Test publishable key + test secret key
  - Stripe CLI installeren: `npm install -g stripe` → `stripe login`
  - ✅ Klaar als: test keys genoteerd + Stripe CLI werkend

- [ ] 🧑 **0.8** Uptime Robot account aanmaken
  - uptimerobot.com → Sign up (gratis) — nog geen monitor instellen
  - ✅ Klaar als: account aangemaakt

- [~] 🧑 **0.9** .env.local aanmaken en invullen
  - `.env.local` aangemaakt + `.env.example` template ✅
  - Supabase URL + anon + service_role keys ✅
  - Resend key ✅
  - Mollie test + live keys ✅
  - INVOICE_TOKEN_SECRET + INTERNAL_DASHBOARD_SECRET gegenereerd ✅
  - KVK_API_KEY en POSTCODE_API_KEY leeg (komen bij mijlpaal 3 klanten) ✅
  - DATABASE_URL ⏳ wachten op 0.3 wrap-up
  - Stripe keys ⏳ wachten op 0.7
  - Vercel ENV variables ⏳ wachten op 0.4 (eerst Vercel project koppelen)
  - ✅ Klaar als: `npm run dev` start zonder errors (kan pas na Fase 1.1)

---

## FASE 1 — Projectfundament (MVP)
*Vereist: Fase 0 afgerond*

- [ ] 🤖 **1.1** Web app projectstructuur opzetten
  - Next.js 14 App Router + TypeScript + Tailwind + shadcn/ui
  - Invora design tokens configureren in tailwind.config.ts (zie INVORA_CONTEXT.md sectie 20)
  - shadcn/ui componenten installeren (button, input, label, card, badge, dialog, dropdown-menu, tabs, toast, separator, skeleton, form, select, textarea, switch, checkbox, table, sheet, progress, tooltip, popover, calendar)
  - Plus Jakarta Sans font configureren via next/font
  - Supabase clients: browser client, server client, middleware helper
  - Route protectie middleware (auth + onboarding check)
  - Mapstructuur aanmaken (zie CLAUDE.md sectie 6)
  - .gitignore (nooit .env bestanden committen)
  - Initial commit naar `invora-web` repo
  - **iOS-readiness:** alle mutations via API routes, geen server actions voor data wijzigingen
  - **Tests:** `npm run dev` start foutloos, TypeScript 0 fouten, alle shadcn componenten beschikbaar

- [ ] 🤖 **1.2** Supabase database schema aanmaken
  - Migratie: `/supabase/migrations/001_initial_schema.sql`
  - Tabellen: users, clients, services, invoices, invoice_lines, time_entries, credit_notes, reminder_templates, activity_log
  - Alle velden zoals beschreven in INVORA_CONTEXT.md secties 3–16
  - `users` tabel bevat `first_name` kolom (verplicht bij registratie)
  - `clients` tabel bevat alle velden voor toekomstige postcode lookup (address_street, etc.) — velden bestaan, auto-invullen komt pas bij 3 klanten
  - `users` tabel bevat `kvk_number` veld — veld bestaat, KvK lookup komt pas bij 3 klanten
  - RLS policies op alle tabellen (gebruiker ziet alleen eigen data)
  - Indexen op: alle foreign keys, user_id, status, created_at
  - Triggers: updated_at automatisch bijwerken, invoice_current_number ophogen
  - TypeScript types genereren via Supabase CLI
  - **Tests:** alle tabellen aangemaakt, RLS werkt met 2 test users, types gegenereerd

- [ ] 🧑 **1.3** Environment variables controleren
  - Controleer dat `npm run dev` start zonder missing variable errors
  - ✅ Klaar als: app laadt op localhost:3000

---

## FASE 2 — Authenticatie en onboarding (MVP)
*Vereist: Fase 1 afgerond*

- [ ] 🤖 **2.1** Volledige authenticatie flow
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

- [ ] 🤖 **2.2** Welkomstscherm + onboarding flow
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
  - **Tests:** sidebar inklapbaar, responsive gedrag op alle breakpoints, coach mark werkt, skeleton loading zichtbaar, lege staat correct

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
| 0 | Accounts + services | [~] | Domein 0.1 uitgesteld tot werkende web app · KvK + Postcode overgeslagen (komen bij M3) |
| 1 | Projectfundament | [ ] | Web only, iOS-ready architectuur |
| 2 | Auth + onboarding | [ ] | Voornaam bij registratie, handmatig adres invullen |
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
