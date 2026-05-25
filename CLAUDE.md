# CLAUDE.md — Invora Project Instructies

> Dit bestand is de primaire instructieset voor Claude Code. Lees dit volledig bij het starten van elke sessie. Raadpleeg INVORA_CONTEXT.md voor productdetails en TASKS.md voor de actuele takenlijst.

---

## 1. Projectoverzicht

**Invora** is een Nederlandse facturatie- en urenregistratie SaaS voor therapeuten en zorgprofessionals met BTW-vrijstelling. Solo founder: Johnny van Rhijn (Work Remote).

### Huidige scope: MVP web app
- **Web app:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui — responsive voor desktop én mobiel
- **Backend:** Supabase (PostgreSQL, Auth, Storage) — EU-regio Frankfurt
- **Betalingen gebruikers:** Stripe Billing
- **Betalingen cliënten:** Mollie (gebruiker koppelt eigen account)
- **E-mail:** Resend
- **PDF:** Puppeteer + @sparticuz/chromium (Vercel serverless)
- **Hosting:** Vercel

### Toekomstige uitbreidingen (nog niet bouwen)
- **Bij 3 betalende klanten:** KvK API + Postcode API activeren (velden bestaan al, alleen auto-invullen ontbreekt)
- **Bij 10 betalende klanten:** iOS app bouwen (React Native + Expo + NativeWind)

### iOS-readiness principe
De web app wordt gebouwd alsof er later een iOS app bijkomt. Concreet:
- Alle businesslogica via getypte API routes (geen Next.js-gebonden server actions voor mutations)
- Supabase als enige databron — geen state die alleen op de server leeft
- Auth via JWT tokens (Supabase Auth) — werkt identiek op web en mobile
- Responsive design is niet hetzelfde als een native app, maar overbrugt de periode tot 10 klanten

Raadpleeg `INVORA_CONTEXT.md` voor de volledige productspecificaties.

---

## 2. Nul-aannames beleid (KRITIEK)

**Claude Code mag NOOIT aannames doen.** Bij enige onduidelijkheid geldt:

1. Stop met bouwen
2. Stel de vraag expliciet aan Johnny
3. Geef altijd **minimaal 3 concrete opties** met per optie:
   - Wat de optie inhoudt
   - Aanbeveling en waarom
   - Best practice overwegingen
   - Impact op het product
4. Wacht op een keuze voordat je verdergaat
5. Stel vragen **één voor één** — nooit meerdere vragen tegelijk

**Voorbeelden van situaties die altijd een vraag vereisen:**
- Onduidelijke UI-interactie of navigatiepatroon
- Onduidelijk datamodel (welke velden, welke relaties)
- Foutafhandeling die niet beschreven is
- Meerdere technische implementatieopties
- Iets dat in conflict is met eerder gemaakte keuzes

---

## 3. Token-efficiëntie

Invora is een langlopend project. Ga zuinig om met tokens zonder in te leveren op kwaliteit.

**Doe:**
- Schrijf efficiënte, herbruikbare code
- Gebruik bestaande componenten en utilities voor je iets nieuws bouwt
- Bundel gerelateerde taken in één sessie
- Gebruik server components (Next.js) waar mogelijk — minder client-side code
- Lees alleen de bestanden die je nodig hebt voor de huidige taak

**Doe niet:**
- Laad de volledige codebase in context voor een kleine wijziging
- Roep agents aan voor simpele taken die je zelf kunt uitvoeren
- Herschrijf werkende code zonder duidelijke reden
- Genereer uitgebreide commentaar op voor de hand liggende code

**Agents inzetten:**
- `/code-review` — alleen na afronding van een complete feature of fase
- `/simplify` — alleen als een module meer dan 200 regels code bevat
- `frontend-design` skill — alleen voor gebruikersgerichte schermen, niet voor interne logica

---

## 4. Werkwijze per taak

### Stap 1: Begrijp de taak volledig
Lees de taakomschrijving in `TASKS.md`. Als iets onduidelijk is → vraag eerst, bouw daarna.

### Stap 2: Check bestaande code
Bekijk relevante bestaande bestanden voordat je iets nieuws schrijft. Hergebruik wat er al is.

### Stap 3: Bouw
Schrijf productie-kwaliteit code. Geen TODO's achterlaten tenzij expliciet gevraagd.

### Stap 4: Test
Na elke afgeronde taak: voer de beschreven tests uit. Los gevonden issues direct op.

### Stap 5: Rapporteer
Geef een beknopt overzicht van:
- Wat gebouwd is
- Welke tests zijn uitgevoerd en wat het resultaat was
- Welke handmatige acties Johnny nog moet uitvoeren (bijv. environment variable toevoegen)
- Of `TASKS.md` bijgewerkt moet worden

### Stap 6: Update TASKS.md
Als de taak nieuwe inzichten oplevert die impact hebben op andere taken (nieuwe taken, wijzigingen, vervallen taken) → update `TASKS.md` direct.

---

## 5. Code kwaliteitsstandaarden

### TypeScript
- Strict mode altijd aan
- Geen `any` types — gebruik `unknown` en type guards
- Zod voor alle runtime validatie (API input, form data, environment variables)
- Genereer Supabase types via de CLI, gebruik nooit handgeschreven database types

### React / Next.js
- Server Components standaard — gebruik `"use client"` alleen als noodzakelijk
- Laad data zo dicht mogelijk bij de component die het gebruikt
- Gebruik `loading.tsx` en `error.tsx` per route segment
- Geen `useEffect` voor data fetching — gebruik server components of SWR/TanStack Query

### Supabase
- RLS altijd aan — test altijd met twee verschillende gebruikersaccounts
- Gebruik `supabase.auth.getUser()` voor server-side auth checks (niet `getSession()`)
- Alle database mutations gaan via typed Supabase client
- Nooit de `service_role` key aan de client-side blootstellen

### Beveiliging
- Alle API routes controleren op authenticatie
- Input validatie op alle API endpoints (Zod schema)
- Nooit secrets in client-side code
- Webhook endpoints verifiëren altijd de signature (Stripe, Mollie)
- Mollie API keys van gebruikers versleuteld opslaan

### Styling
- Gebruik de Invora design tokens uit `tailwind.config.ts`
- Geen hardgecodeerde kleuren — altijd via CSS variabelen of Tailwind tokens
- Componenten zijn responsive: mobile-first
- Dark mode volgt systeeminstelling (al geconfigureerd in tailwind.config.ts)

---

## 6. Mapstructuur web app

```
invora-web/
├── app/
│   ├── (auth)/              # Publieke auth pagina's (login, register, etc.)
│   ├── (app)/               # Beveiligde app pagina's
│   │   ├── dashboard/
│   │   ├── facturen/
│   │   ├── clienten/
│   │   ├── uren/
│   │   ├── diensten/
│   │   ├── rapporten/
│   │   └── instellingen/
│   ├── (marketing)/         # Publieke marketingpagina's
│   │   ├── page.tsx         # Homepage
│   │   └── blog/
│   └── api/                 # API routes
│       ├── kvk/
│       ├── postcode/
│       ├── invoice/
│       ├── payments/
│       ├── stripe/
│       └── webhooks/
├── components/
│   ├── ui/                  # shadcn/ui componenten
│   ├── app/                 # App-specifieke componenten
│   └── marketing/           # Marketing-specifieke componenten
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   └── middleware.ts    # Auth middleware helper
│   ├── validations/         # Zod schemas
│   ├── utils.ts             # Algemene utilities
│   └── constants.ts         # App-brede constanten
├── hooks/                   # Custom React hooks
├── types/
│   ├── database.ts          # Gegenereerde Supabase types
│   └── index.ts             # Overige TypeScript types
├── supabase/
│   └── migrations/          # SQL migratie bestanden
├── public/
├── .env.local               # Lokale secrets (nooit committen)
├── .env.example             # Template zonder waarden
├── tailwind.config.ts
├── middleware.ts
└── CLAUDE.md                # Dit bestand
```

---

## 7. Responsive design aanpak

De web app is de enige interface tot 10 betalende klanten. Responsive bouwen is daarom kritiek.

**Breakpoints (Tailwind standaard):**
- Mobiel: `< 768px` — volledige schermbreedte, bottomnavigatie zichtbaar, sidebar verborgen
- Tablet: `768px–1024px` — sidebar ingeklapt (alleen iconen), bottomnavigatie verborgen
- Desktop: `> 1024px` — sidebar uitgeklapt

**Navigatie per schermgrootte:**
- Mobiel/tablet: bottomnavigatie (5 items, centrale Nieuw knop)
- Desktop: sidebar links

**Componenten die extra aandacht vragen op mobiel:**
- Factuur aanmaken: lange formulieren goed scrollbaar
- Slide-over panelen: volledige breedte op mobiel
- Tabellen: horizontaal scrollbaar op smal scherm (nooit afkappen)
- Modals: volledige hoogte op mobiel (bottom sheet patroon)

---

## 8. Naamgevingsconventies

- **Bestanden:** kebab-case (`invoice-list.tsx`)
- **Componenten:** PascalCase (`InvoiceList`)
- **Functies/variabelen:** camelCase (`createInvoice`)
- **Database tabellen:** snake_case (`invoice_lines`)
- **Constanten:** UPPER_SNAKE_CASE (`MAX_INVOICE_LINES`)
- **API routes:** kebab-case (`/api/invoice/send`)
- **Supabase functies:** snake_case (`get_user_invoices`)

---

## 9. Environment variables

Alle benodigde environment variables staan in `.env.example`. Nooit waarden committen naar git. Zie `TASKS.md` taak 0.11 voor het aanmaken van alle accounts.

**Let op:** KvK API en Postcode API keys hoef je pas in te vullen bij mijlpaal 3 betalende klanten. De velden staan wel in `.env.example` zodat je ze dan direct kunt toevoegen.

---

## 10. Taken en voortgang

De actuele takenlijst staat in `TASKS.md`. Dit bestand wordt bijgehouden gedurende het gehele project. Na elke sessie controleren of de takenlijst actueel is.

**Status symbolen in TASKS.md:**
- `[ ]` — Nog niet gestart
- `[~]` — In uitvoering
- `[x]` — Afgerond
- `[!]` — Geblokkeerd of vereist beslissing

---

## 11. Communicatiestijl

- Antwoord in het **Nederlands**
- Wees direct en beknopt — geen onnodige uitleg
- Bij rapportage na een taak: gebruik bullet points voor overzicht
- Bij vragen: geef altijd 3 opties + aanbeveling (zie sectie 2)
- Nooit meerdere vragen tegelijk stellen
