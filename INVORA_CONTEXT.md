# INVORA_CONTEXT.md — Volledige Productcontext

> Dit bestand beschrijft wat Invora is, voor wie het gebouwd wordt, en hoe elke feature precies werkt. Claude Code gebruikt dit als de enige bron van waarheid voor productbeslissingen.

---

## 1. Wat is Invora?

Invora is een Nederlandse facturatie- en urenregistratietool gebouwd specifiek voor **therapeuten en zorgprofessionals met BTW-vrijstelling** in Nederland. Het product is opzettelijk simpel gehouden: geen boekhoudfuncties, geen BTW-aangifte, geen agenda. Alleen wat een zorgprofessional dagelijks nodig heeft.

**Positionering:** "De simpelste factuurapp voor zorgprofessionals in Nederland."

**Doelgroep primair:**
- Psychologen, GZ-psychologen, psychotherapeuten
- Fysiotherapeuten met eigen praktijk
- Coaches met zorgfocus (BIG-geregistreerd of vergelijkbaar)
- Therapeuten die BTW-vrijgesteld factureren op basis van artikel 11, lid 1, onderdeel g Wet OB 1968

**Uitdrukkelijk NIET voor:**
- Coaches/trainers met BTW-plicht (v2)
- Belgische markt (v2)
- Accountants, consultants, agencies
- Bedrijven met meerdere medewerkers (v1 = solo gebruik)

---

## 2. Gebruikersstroom van begin tot eind

### Nieuwe gebruiker
1. Landt op invora.nl (marketingsite)
2. Klikt "Start je gratis proefperiode"
3. Registratiepagina: kiest Google login OF e-mail + wachtwoord
4. Vult **voornaam** in (verplicht bij e-mail registratie; bij Google automatisch overgenomen uit Google account)
5. Accepteert algemene voorwaarden + verwerkersovereenkomst (verplicht)
6. Accepteert privacybeleid (verplicht)
7. Ontvangt bevestigingsmail → klikt op link → e-mail bevestigd
8. **Welkomstscherm:** "Welkom bij Invora, [voornaam]!" + 2 zinnen uitleg + knop "Account instellen"
9. **Onboarding Stap 1:** KvK-nummer invoeren → automatisch laden van bedrijfsnaam + adres → IBAN invullen → opslaan
10. **Onboarding Stap 2:** BTW-status instellen (vrijgesteld / plichtig) → opslaan
11. Landt op dashboard met coach mark op de "Nieuw" knop
12. Maakt eerste factuur aan → verstuurt → cliënt betaalt → factuur gemarkeerd als betaald

### Terugkerende gebruiker
1. Login (Google of e-mail/wachtwoord)
2. 2FA via SMS als ingeschakeld
3. Rechtstreeks naar dashboard

---

## 3. Authenticatie en gebruikersgegevens

### Registratieformulier (e-mail/wachtwoord)
Velden:
- **Voornaam** (verplicht) — wordt gebruikt voor persoonlijke begroeting in de app
- **E-mailadres** (verplicht)
- **Wachtwoord** (verplicht, min 8 tekens)
- **Wachtwoord bevestigen** (verplicht)
- **Checkbox:** Akkoord met algemene voorwaarden + verwerkersovereenkomst (verplicht, link naar /voorwaarden)
- **Checkbox:** Akkoord met privacybeleid (verplicht, link naar /privacy)

### Google login
- Voornaam wordt automatisch overgenomen uit Google account
- Checkboxes voor voorwaarden en privacy nog steeds verplicht (aparte stap na Google OAuth callback)

### Gebruikersprofiel opslaan
Na registratie wordt direct een rij aangemaakt in de `users` tabel met:
- `id` = auth.users UUID
- `email` = e-mailadres
- `first_name` = voornaam (ingevuld bij registratie of uit Google account)
- Alle andere velden nog leeg (worden ingevuld tijdens onboarding)

### 2FA via SMS
- Optioneel, instelbaar in beveiligingsinstellingen
- Gebruik Supabase Phone Auth (Twilio)
- Telefoonnummer invoeren → verificatiecode → bevestigen
- Na inschakelen: bij elke login SMS-code vereist

---

## 4. Onboarding

### Stap 1: Bedrijfsgegevens + IBAN
**KvK lookup:**
- Gebruiker vult KvK-nummer in (8 cijfers)
- App roept `/api/kvk/lookup` aan → KvK Basisprofielen API
- Automatisch ingevuld: bedrijfsnaam, straat, postcode, stad
- Gebruiker kan alles handmatig aanpassen na auto-invul
- Als KvK API faalt: vriendelijke foutmelding + alle velden handmatig invullen

**IBAN:**
- Veld voor IBAN-nummer
- Validatie: IBAN formaat NL check (begint met NL, 18 karakters)
- IBAN staat later op elke factuur als betaalgegevens

**Opgeslagen in `users` tabel:** kvk_number, company_name, address_street, address_city, address_postal_code, iban

### Stap 2: BTW-status
- Twee grote kaarten:
  - **"Ja, ik ben BTW-vrijgesteld"** — voor BIG-geregistreerden en vergelijkbare zorgprofessionals
  - **"Nee, ik reken BTW"** — voor coaches/trainers zonder vrijstelling
- Klein ℹ️ icoon met tooltip: "Twijfel je? Controleer met je boekhouder of de BTW-vrijstelling op jou van toepassing is."
- Opgeslagen in `users` tabel: `btw_vrijgesteld` (boolean)

**Na stap 2:**
- `onboarding_completed = true` opslaan
- Redirect naar /dashboard

---

## 5. Dashboard

### Persoonlijke begroeting
- Toont voornaam uit `users.first_name`
- Tijdgebaseerd: Goedemorgen (00:00–11:59), Goedemiddag (12:00–17:59), Goedenavond (18:00–23:59)
- Formaat: "Goedemorgen, [voornaam]!"

### KPI-kaarten (3 stuks)
1. **Omzet deze maand** — som van alle betaalde facturen in huidige kalendermaand
2. **Openstaand bedrag** — som van alle facturen met status "verstuurd" + "te_laat"
3. **Laatste 3 facturen** — de 3 meest recent aangemaakte facturen met: naam cliënt + bedrag + status badge

### Staafdiagram
- Omzet per maand, laatste 6 kalendermaanden
- Als een maand geen omzet heeft: staaf toont 0 (geen lege maanden)
- Data: som van `total` van alle betaalde facturen per maand

### Lege staat (geen facturen)
- Abstracte figuur SVG die wijst naar de "Nieuw" knop
- Tekst: "Stuur je eerste factuur in minder dan 2 minuten"
- Primaire knop: "Maak eerste factuur aan →" → navigeert naar /facturen/nieuw

### Coach mark (eenmalig na onboarding)
- Verschijnt alleen direct na afronding onboarding (één keer)
- Sage green pulse-animatie rondom de "Nieuw" knop
- Tooltip: "Klik hier om je eerste factuur aan te maken"
- Verdwijnt als de gebruiker op de "Nieuw" knop klikt OF na 10 seconden
- Wordt bijgehouden via `users.onboarding_completed` + lokale state (niet opnieuw tonen)

---

## 6. Navigatie

### Web — Sidebar
- Links vast, breedte 240px uitgeklapt / 64px ingeklapt
- Inklapknop bovenaan de sidebar
- Ingeklapt: alleen iconen zichtbaar (geen labels)
- Uitgeklapt: icoon + label
- Items: Dashboard | Facturen | Cliënten | Uren | Diensten | Rapporten | (spacer) | Instellingen
- Instellingen staat altijd onderaan
- Actief item: sage green achtergrond + witte tekst
- Onderaan sidebar: voornaam gebruiker + uitlog knop
- Naam "Invora" bovenaan (geen logo in v1 — logo volgt na ontwerp door designer)

### Mobiel / iOS — Bottomnavigatie
- 5 items: Dashboard | Facturen | [Nieuw] | Uren | Instellingen
- "Nieuw" is een centrale verhoogde knop (vierkant, afgeronde hoeken, sage green gradient)
- Diensten en Rapporten zijn niet in bottomnav — wel bereikbaar via Instellingen of direct via URL
- Actief item: sage green icoon + label
- Inactief: grijs icoon + label

---

## 7. Cliënten

### Cliëntprofiel — velden
**Altijd (particulier én zakelijk):**
- `type`: "particulier" of "zakelijk"
- `name`: volledige naam (verplicht)
- `email`: e-mailadres (verplicht)
- `phone`: telefoonnummer (optioneel)
- `address_street`: straat + huisnummer
- `address_postal_code`: postcode
- `address_city`: stad
- `address_country`: standaard "NL"
- `billing_email`: apart factuuradres (optioneel) — als ingevuld, gaan facturen hierheen
- `category`: "actief" | "inactief" | "vip" (standaard: actief)
- `default_service_id`: standaard dienst (FK naar services)
- `discount_type`: "percentage" | "fixed" | null
- `discount_value`: kortingsbedrag of percentage
- `administrative_note`: administratieve notitie (max 500 tekens) — label "Administratieve notitie", placeholder "bijv. factureert altijd aan het einde van de maand"
- `archived`: boolean (standaard false)

**Alleen bij zakelijke cliënten:**
- `billing_address_street`, `billing_address_city`, `billing_address_postal_code`: apart factuuradres
- `kvk_number`: KvK-nummer
- `btw_number`: BTW-nummer
- `payment_term_days`: afwijkende betalingstermijn (overschrijft standaard)
- Extra contactpersoon: `contact_name`, `contact_email` (aparte tabel of JSONB kolom)

### Postcode lookup
- Veld: postcode (4 cijfers + 2 letters, bijv. "1234AB")
- Veld: huisnummer
- Bij invullen beide: automatische call naar `/api/postcode/lookup`
- Straat en stad worden automatisch ingevuld
- Gebruiker kan het resultaat aanpassen
- Fallback: als API niet beschikbaar → velden handmatig invullen zonder foutmelding

### Duplicaat detectie
- Bij opslaan: check of `email` al bestaat in `clients` tabel voor deze gebruiker
- Als duplicaat: waarschuwingsbanner "Er bestaat al een cliënt met dit e-mailadres: [naam]. Wil je toch doorgaan?"
- Gebruiker kan kiezen: Annuleren of Toch opslaan

### Cliëntstatistieken (zichtbaar in slide-over)
- Totale omzet (som van alle betaalde facturen)
- Gemiddeld factuurbedrag (totale omzet / aantal facturen)
- Aantal facturen totaal
- Activiteitslog: chronologische tijdlijn van events voor deze cliënt

### Activiteitslog per cliënt
Gebaseerd op `activity_log` tabel, gefilterd op `client_id`. Events:
- `factuur_verstuurd` → "Factuur #[nummer] verstuurd"
- `betaling_ontvangen` → "Betaling ontvangen — € [bedrag]"
- `herinnering_verstuurd` → "Betalingsherinnering verstuurd"
- `creditnota_aangemaakt` → "Creditnota [nummer] aangemaakt"
- `factuur_te_laat` → "Factuur #[nummer] is te laat"
- `stornering_ontvangen` → "Betaling gestorneerd"

---

## 8. Diensten bibliotheek

### Dienst — velden
- `name`: naam (verplicht, bijv. "Intakegesprek", "Vervolgsessie")
- `description`: omschrijving (optioneel) — wordt gebruikt als factuurregel tekst
- `price`: bedrag (verplicht)
- `price_type`: "fixed" (vaste prijs) | "hourly" (uurtarief)
- `category`: categorie (vrij tekst, gebruiker maakt eigen categorieën, bijv. "Intake", "Behandeling")
- `usage_count`: automatisch bijgehouden — hoeveel keer is deze dienst op een factuur gezet
- `archived`: boolean

### Automatische sortering
Diensten worden gesorteerd op `usage_count DESC` — meest gebruikte dienst altijd bovenaan in suggesties.

### Koppeling aan cliënt
Als een cliënt een `default_service_id` heeft ingesteld, wordt deze dienst automatisch gesuggereerd bij het aanmaken van een factuur voor die cliënt (boven de algemene meest-gebruikte).

### Koppeling aan urenregistratie
Als een dienst van type "hourly" is gekoppeld aan een urenregistratie, wordt het uurtarief (`price`) automatisch gebruikt voor de berekening van het totaalbedrag (uren × uurtarief).

### Verwijderen
- Dienst wordt verwijderd uit bibliotheek en verdwijnt uit alle dropdown suggesties
- Historische factuurregels die naar deze dienst verwijzen (`service_id`) behouden hun omschrijving en prijs — de FK wordt NULL maar de tekst blijft
- Geen cascade delete op invoice_lines

---

## 9. Facturen

### Factuurstatus lifecycle
```
concept → verstuurd → betaald
                    ↘ te_laat → betaald
         ↘ gecrediteerd (via creditnota)
```

### Factuurnummering
- Formaat: `[prefix]-[jaar]-[volgnummer]`
- Standaard prefix: "INV" (instelbaar door gebruiker)
- Standaard startnummer: 1
- Voorbeeld: INV-2024-001, INV-2024-002, etc.
- `invoice_current_number` in `users` tabel wordt bij elke nieuwe factuur opgehoogd
- Factuurnummer is aanpasbaar bij het aanmaken (maar moet uniek zijn per gebruiker)

### Factuur aanmaken — stap voor stap
1. **Cliënt selecteren:** autocomplete veld — typt naam → ziet live suggesties → selecteert. Als cliënt niet bestaat: "Nieuwe cliënt aanmaken" optie in dropdown → opent mini-modal met: naam (verplicht), e-mail (verplicht) → opslaan → direct geselecteerd in factuur
2. **Factuurnummer:** automatisch gegenereerd, aanpasbaar
3. **Factuurdatum:** standaard vandaag, aanpasbaar via datumkiezer
4. **Vervaldatum:** automatisch berekend (factuurdatum + betalingstermijn gebruiker), aanpasbaar
5. **Betalingstermijn:** overgenomen uit `users.payment_term_days`, aanpasbaar per factuur. Als cliënt een zakelijk afwijkend tarief heeft: dat wordt gebruikt.
6. **PO-nummer:** alleen zichtbaar als ingeschakeld in instellingen
7. **Factuurregels:** zie hieronder
8. **Korting:** optioneel, zie hieronder
9. **Totalen:** automatisch berekend
10. **Persoonlijke noot:** optioneel vrij tekstveld (zichtbaar op factuur voor cliënt), standaard ingevuld vanuit `users.standard_invoice_note`

### Factuurregels
- Minimaal 1 regel verplicht voor versturen
- Per regel:
  - **Omschrijving** (verplicht) — label "Omschrijving dienst", placeholder "bijv. Coachsessie, Intakegesprek, Trainingssessie" (AVG-bewuste placeholder)
  - **Aantal** (verplicht, numeriek, standaard 1)
  - **Prijs** (verplicht, numeriek)
  - **Totaal** (automatisch berekend: aantal × prijs, niet bewerkbaar)
- Dienst selecteren vult omschrijving + prijs automatisch in
- Gebruiker kan na dienst-selectie de omschrijving en prijs aanpassen (dienst in bibliotheek wordt NIET gewijzigd)
- Meerdere regels mogelijk
- Regel toevoegen: knop "Voeg factuurregel toe"
- Regel verwijderen: prullenbak icoon per regel

### Kortingen
- Toggle "Korting toepassen" (standaard uit, tenzij cliënt een standaard korting heeft)
- Type: "percentage" of "vast bedrag" (radio buttons)
- Waarde: numeriek invoerveld
- Kortingsbedrag automatisch berekend en getoond als aftrekpost in totaaloverzicht
- Als cliënt een standaard korting heeft: automatisch ingevuld, aanpasbaar

### Totaaloverzicht op factuur
```
Subtotaal:        € [som alle regeltotalen]
Korting [x%]:    -€ [kortingsbedrag]  (alleen als van toepassing)
─────────────────────────────────────
Totaal:           € [eindtotaal]

BTW-vrijstelling: [vrijstellingstekst]
IBAN: [iban gebruiker]
```

### Versturen flow
1. Gebruiker klikt "Versturen"
2. **E-mail preview modal** verschijnt:
   - Toont hoe de e-mail eruitziet die de cliënt ontvangt
   - Van: "[Naam therapeut] <facturen@invora.nl>" (reply-to = e-mailadres therapeut)
   - Aan: cliënt e-mailadres (of billing_email als ingesteld)
   - Onderwerp: aanpasbaar (standaard vanuit `users.email_subject_template` met variabelen ingevuld)
   - Berichttekst: aanpasbaar
   - Preview van factuur PDF (thumbnail of tekst-preview)
3. Gebruiker klikt "Versturen" in de modal
4. Factuur wordt verstuurd:
   - PDF gegenereerd via Puppeteer
   - E-mail verstuurd via Resend
   - Status update: "concept" → "verstuurd"
   - Als Mollie gekoppeld: betaallink gegenereerd en opgeslagen
   - Log entry in `activity_log`
5. **Bevestigingsscherm:**
   - Groen vinkje animatie
   - Tekst: "Factuur verstuurd naar [naam cliënt]!"
   - Drie opties: "Bekijk factuur" | "Nieuwe factuur" | "Terug naar dashboard"

### Automatisch opslaan als concept
- Elke 30 seconden automatisch opgeslagen als status = "concept"
- Bij verlaten pagina zonder versturen: concept bewaard → zichtbaar in factuuroverzicht met status "Concept"
- Concept kan later geopend, bewerkt en alsnog verstuurd worden

### Factuur PDF layout
```
┌─────────────────────────────────────────────────┐
│ [SAGE GREEN HEADER]                              │
│ [Logo therapeut]    Bedrijfsnaam                 │
│                     Adres, postcode, stad        │
│                     KvK: [nummer]                │
├─────────────────────────────────────────────────┤
│ FACTUUR                     Factuurnummer:       │
│                             Factuurdatum:        │
│ Aan:                        Vervaldatum:         │
│ [Naam cliënt]               PO: [als ingesteld]  │
│ [Adres cliënt]                                   │
├─────────────────────────────────────────────────┤
│ Omschrijving        Aantal    Prijs    Totaal    │
│ [regelomschrijving]   [n]    [€]      [€]        │
├─────────────────────────────────────────────────┤
│                              Subtotaal: €        │
│                              Korting:  -€        │
│                              Totaal:   €         │
├─────────────────────────────────────────────────┤
│ [Persoonlijke noot als aanwezig]                 │
│                                                  │
│ [BTW-vrijstellingstekst]                         │
│                                                  │
│ Betaling: IBAN [nummer]                          │
│ t.n.v. [bedrijfsnaam]                            │
├─────────────────────────────────────────────────┤
│ Gemaakt met Invora  (als instelling aan)         │
└─────────────────────────────────────────────────┘
```

### Creditnota
- Aangemaakt vanuit een bestaande factuur (knop in contextmenu of slide-over)
- Credit nota nummer formaat: `CN-[jaar]-[volgnummer]`
- Bevat negatief totaalbedrag van de originele factuur
- Vermeldt origineel factuurnummer
- Zelfde verstuur-flow als gewone factuur
- Originele factuur status wordt "gecrediteerd"

### Factuur aanpassen na versturen
- **Niet mogelijk** — een verstuurde factuur is een juridisch document
- Correctie altijd via creditnota + nieuwe factuur
- Als gebruiker probeert te bewerken: melding "Verstuurde facturen kunnen niet worden gewijzigd. Maak een creditnota aan om te corrigeren."

---

## 10. Publieke betaalpagina

### URL structuur
- `/pay/[secure-token]`
- Token = cryptografisch veilig uniek token per factuur (UUID v4 of crypto.randomBytes)
- Token wordt opgeslagen in `invoices.payment_token`
- Geen authenticatie vereist — publiek toegankelijk

### Inhoud
- Sage green header met naam therapeut + logo
- Volledige factuurinhoud zichtbaar (zelfde als PDF)
- **Betaalknop** (iDEAL via Mollie) — alleen zichtbaar als Mollie gekoppeld bij therapeut
- **Download PDF** link
- **IBAN altijd zichtbaar** als alternatief voor betaling

### Na succesvolle iDEAL betaling
- Mollie webhook: `/api/webhooks/mollie` ontvangt `payment.paid`
- Factuurstatus update: "verstuurd" → "betaald"
- `paid_at` ingevuld
- Log entry in `activity_log`
- Push notificatie naar therapeut
- Cliënt wordt doorgestuurd naar: `/pay/[token]/bedankt`
  - Tekst: "Betaling ontvangen! Bedankt."

### Bij mislukte betaling
- Cliënt wordt terugestuurd naar betaalpagina
- Foutmelding: "De betaling is mislukt. Probeer het opnieuw of maak het bedrag over via IBAN."
- Beide opties zichtbaar: opnieuw proberen + IBAN

### Als Mollie niet beschikbaar
- Betaalknop niet getoond of gedeactiveerd
- IBAN altijd als fallback

---

## 11. Betalingsherinneringen

### Automatische herinneringen (via Vercel Cron)
- Dagelijkse cron job om 09:00 NL tijd
- Logica per factuur met status "verstuurd":
  1. Is `due_date` verstreken? → Update status naar "te_laat"
  2. Is `auto_reminder_enabled = true`?
  3. Is er al eerder een herinnering gestuurd?
     - Nee: stuur herinnering als `due_date + reminder_days` ≤ vandaag
     - Ja: stuur opnieuw als laatste herinnering `reminder_days` geleden was (of nooit meer, afhankelijk van instelling)
  4. Update `reminder_count` en `last_reminder_sent_at`

### Herinneringsmail
- Verstuurd via Resend
- Van: zelfde afzenderconfiguratie als factuurmails
- Variabelen in template: `{naam_client}`, `{factuurnummer}`, `{bedrag}`, `{vervaldatum}`, `{betaallink}`, `{naam_therapeut}`
- Template: de standaard of geselecteerde reminder template van de gebruiker
- Log entry in `activity_log` (event: `herinnering_verstuurd`)

### Handmatige herinnering
- Knop in factuur slide-over (contextafhankelijk: alleen bij status "verstuurd" of "te_laat")
- Modal: selecteer welke template te gebruiken + optie om tekst eenmalig aan te passen
- Versturen → log entry

### Reminder templates beheer
- Beheerd via /instellingen — onderdeel "Facturen"
- Gebruiker kan meerdere templates aanmaken
- Één template als standaard markeren
- Velden per template: naam (intern), onderwerp, berichttekst
- Variabelen worden als klikbare chips getoond naast het tekstveld

---

## 12. Urenregistratie

### Urenregistratie — velden
- `date`: datum (verplicht, kan in verleden of toekomst)
- `client_id`: cliënt (optioneel — NULL voor indirecte uren)
- `service_id`: gekoppelde dienst (optioneel)
- `hours`: aantal uren (verplicht, decimaal, automatisch afgerond op 0.25)
- `description`: omschrijving (verplicht) — label "Omschrijving", placeholder "bijv. Coachgesprek, Intake, Voorbereiding"
- `internal_note`: interne notitie (optioneel) — nooit zichtbaar op factuur
- `status`: "niet_gefactureerd" | "gefactureerd"
- `hourly_rate`: uurtarief op moment van registratie (gekopieerd van dienst als gekoppeld, anders null)

### Afronden op kwartieren
- Ingevoerde waarde wordt afgerond naar dichtstbijzijnde 0.25
- 1.3 → 1.25, 1.4 → 1.5, 1.6 → 1.75
- Dit gebeurt bij opslaan, niet terwijl de gebruiker typt

### Datum waarschuwing
- Als datum meer dan 90 dagen geleden: gele waarschuwingsbanner onder het datumveld
- Tekst: "Let op: je registreert uren voor meer dan 90 dagen geleden. Klopt dit?"
- Gebruiker kan gewoon doorgaan

### Totaalbedrag tonen
- Alleen als een dienst met `price_type = "hourly"` is geselecteerd
- Berekening: `hours × hourly_rate`
- Wordt live bijgewerkt bij het invullen van het aantal uren
- Dient als indicatie — niet als definitieve factuurbedrag

### Omzetten naar factuur
- Selecteer één of meerdere niet-gefactureerde registraties (via checkboxes in de lijst)
- Knop "Maak factuur" verschijnt
- Modal: keuze tussen "Per registratie (aparte factuurregels)" of "Samengevoegd (één factuurregel met totaal)"
- Doorsturen naar factuur aanmaken met vooringevulde regels:
  - Cliënt automatisch geselecteerd (als alle geselecteerde uren van dezelfde cliënt zijn)
  - Als meerdere cliënten: foutmelding "Je kunt alleen uren van één cliënt tegelijk factureren"
- Na versturen factuur: `status` van alle betrokken uren → "gefactureerd"

### Urenoverzicht weergave
- Gegroepeerd per dag (nieuwste dag bovenaan)
- Per dag: datum als header + dagtotaal uren rechts
- Twee tabbladen: "Niet gefactureerd" | "Gefactureerd"
- Statistieken bovenaan pagina:
  - Kaart 1: Totaal uren deze maand + "X gefactureerd / Y niet gefactureerd"
  - Kaart 2: Uitsplitsing uren per cliënt (top 3, + "en X anderen")

---

## 13. Instellingen

### Sectie: Mijn bedrijf
- Voornaam
- KvK-nummer (met vernieuwen-knop die KvK API opnieuw aanroept)
- Bedrijfsnaam
- Adres: straat, postcode, stad
- IBAN (met validatie)
- Logo uploaden: max 2MB, PNG/JPG/SVG, upload naar Supabase Storage (`logos` bucket, path: `user_id/logo.[ext]`)
- Logo preview tonen na upload
- Knop "Stuur testfactuur naar mezelf" → genereert een proeffactuur en stuurt die naar het e-mailadres van de gebruiker

### Sectie: Facturen
- Factuurnummer prefix (tekst, bijv. "INV", "FAC")
- Factuurnummer startnummer (geheel getal)
- **Let op:** het huidige factuurnummer (`invoice_current_number`) wordt niet teruggezet bij wijziging van het startnummer — dat zou historische nummers kunnen dupliceren. Als startnummer wordt verlaagd: waarschuwing tonen.
- Standaard betalingstermijn (dropdown: 7 | 14 | 21 | 30 dagen)
- BTW-status toggle: BTW-vrijgesteld / BTW-plichtig
  - Bij toggle: bevestigingsdialoog "Weet je zeker dat je de BTW-status wilt wijzigen? Dit heeft invloed op alle toekomstige facturen."
- Standaard factuurnotitie (textarea) — wordt automatisch ingevuld bij nieuwe facturen
- BCC e-mailadres (optioneel) — ontvangt altijd een kopie van elke verstuurde factuurmail
- E-mail onderwerpregel template (tekstveld met variabelen) — standaard: "Factuur {factuurnummer} van {naam_therapeut}"
- Beschikbare variabelen als klikbare chips: `{naam_client}`, `{factuurnummer}`, `{naam_therapeut}`, `{bedrag}`, `{vervaldatum}`

**Optionele toggles (aan/uit):**
- Automatische betalingsherinnering (standaard aan)
- Persoonlijke noot op factuur tonen (standaard aan)
- Korting op factuur tonen (standaard aan)
- PO/referentienummer veld op facturen (standaard uit)
- "Gemaakt met Invora" vermelding onderaan factuur (standaard aan)
- Logo op PDF timesheet tonen (standaard aan)
- Interne notitie bij urenregistratie (standaard aan)
- Automatisch opslaan als concept (standaard aan)
- Afronden op kwartieren (standaard aan)
- Totaalbedrag tonen bij urenregistratie (standaard aan)
- Toekomstige datums toestaan bij uren (standaard aan)
- Waarschuwing bij uren ouder dan 90 dagen (standaard aan)

**Reminder templates** — zie sectie 11

### Sectie: Betaallink
- Toggle: Mollie betaallink inschakelen (standaard UIT)
- Als UIT: uitlegblok met voordelen + stap-voor-stap instructie
- Als AAN: API key invoerveld + validatieknop
- Na validatie: groen "Mollie succesvol gekoppeld" label
- Betaalmethoden checkboxes (iDEAL standaard aan, rest optioneel)

### Sectie: Notificaties
Elke rij: naam event | push toggle | e-mail toggle
- Factuur betaald (standaard: push AAN, e-mail AAN)
- Factuur te laat (standaard: push AAN, e-mail AAN)
- Herinnering verstuurd (standaard: push UIT, e-mail AAN)
- Stornering ontvangen (standaard: push AAN, e-mail AAN)

### Sectie: Beveiliging
- Wachtwoord wijzigen (velden: huidig wachtwoord, nieuw, bevestigen)
- E-mailadres wijzigen (nieuw e-mail → bevestigingslink gestuurd)
- 2FA via SMS: telefoonummer + verificatieflow

### Sectie: Abonnement
- Huidig plan + status (proefperiode / actief / verlopen)
- Proefperiode: "Verloopt op [datum] — [X] dagen resterend"
- Actief: "Actief — €14,52/mnd (incl. BTW)"
- Volgende betaaldatum
- Betaalhistorie: tabel datum | bedrag | status | download
- Knop "Abonnement beheren" → Stripe Customer Portal
- Als proefperiode: knop "Activeer abonnement" → Stripe Checkout
- Knop "Account verwijderen" → meerstaps flow:
  - Stap 1: bevestigingsdialoog "Weet je zeker dat je je account wilt verwijderen? Alle data wordt verwijderd."
  - Stap 2: verplicht exporteren — knop "Exporteer al mijn data (ZIP)" — pas na download enabled
  - Stap 3: typ "VERWIJDEREN" in tekstveld → rode verwijderknop
  - Uitvoering: account verwijderd, uitgelogd, redirect naar homepage

---

## 14. Notificaties

### Push notificaties (iOS)
- Via Expo Notifications + Expo Push API
- Token opgeslagen in `users.expo_push_token`
- Deeplink: tik op notificatie → opent betreffende factuur in de app

### E-mail notificaties
- Via Resend
- Puur informatief — geen actieknoppen in de e-mail (om GDPR-gerelateerde tracking te vermijden)

### Notificatietriggers
| Event | Trigger | Push tekst |
|-------|---------|------------|
| Factuur betaald | Mollie webhook | "Factuur #[nummer] van [cliënt] is betaald — € [bedrag]" |
| Factuur te laat | Dagelijkse cron | "Factuur #[nummer] voor [cliënt] is te laat" |
| Herinnering verstuurd | Na versturen herinnering | "Herinnering verstuurd voor factuur #[nummer]" |
| Stornering | Mollie webhook | "Betaling gestorneerd voor factuur #[nummer]" |

### Proefperiode notificaties (e-mail only, naar therapeut)
- Dag 25: "Je proefperiode verloopt over 5 dagen"
- Dag 29: "Je proefperiode verloopt morgen"

### Wekelijkse samenvatting (e-mail, maandag 09:00)
- Alleen verstuurd als er openstaande facturen zijn
- Inhoud: "Je hebt [X] openstaande factuur(en) met een totaalbedrag van € [bedrag]"

### Inactiviteitsmelding (e-mail naar Johnny, niet naar gebruiker)
- Als een gebruiker in proefperiode 14 dagen niet heeft ingelogd
- Johnny ontvangt e-mail: "[naam gebruiker] heeft 14 dagen niet ingelogd"
- Doel: churn risico signaleren voor vroeg ingrijpen

### iOS badge
- Toont het aantal facturen met status "te_laat"
- Update via Expo Notifications badge API

---

## 15. Rapportages

### Periode-selectie
- Begin- en einddatum (vrij instelbaar via datumkiezer)
- Standaard: huidige kalendermaand

### Rapport 1: Omzet
- **Grafiek:** staafdiagram per maand in geselecteerde periode (Recharts BarChart)
- **KPI's:** totale omzet in geselecteerde periode (groot cijfer)
- **Tabel 1:** maand | omzet | aantal facturen (betaald)
- **Tabel 2:** cliënt | omzet | aantal facturen (gesorteerd op omzet DESC)
- **Tabel 3:** dienst | omzet | aantal keer gefactureerd (gesorteerd op omzet DESC)
- **Filter:** dropdown om te filteren op specifieke cliënt

### Rapport 2: Openstaande facturen
- **KPI:** totaal openstaand bedrag
- **Grafiek:** donut chart — openstaand vs te laat vs betaald (in geselecteerde periode)
- **Tabel:** factuurnummer | cliënt | bedrag | factuurdatum | vervaldatum | status
- **Sortering standaard:** oudste vervaldatum bovenaan (langst openstaand)
- **Filter:** status (openstaand / te_laat)

### Rapport 3: Uren
- **KPI's:** totaal uren + gefactureerd vs niet-gefactureerd
- **Grafiek:** staafdiagram uren per maand
- **Tabel 1:** maand | totaal uren | gefactureerd | niet-gefactureerd
- **Tabel 2:** cliënt | uren (gesorteerd op uren DESC)
- **Filter:** dropdown op cliënt

### Rapport 4: Cliënten
- **Grafiek:** horizontale staafdiagram top 5 cliënten op omzet
- **Tabel:** cliënt | totale omzet | aantal facturen
- **Sortering:** omzet DESC

### Export
- **PDF:** logo therapeut + naam + periode bovenaan, grafiek (Canvas snapshot), tabel. In Invora stijl.
- **CSV:** alle data van het rapport, Nederlandse kolomnamen, UTF-8, kommagescheiden
- **E-mail:** PDF als bijlage via Resend, naar door gebruiker opgegeven e-mailadres

---

## 16. Stripe abonnementen

### Configuratie
- Product: "Invora Abonnement"
- Prijs: €12,00 per maand exclusief BTW
- BTW: 21% NL via Stripe Tax (automatisch berekend)
- Totaal voor gebruiker: €14,52 per maand incl. BTW
- Trial: 30 dagen (geconfigureerd op Stripe product)
- Lanceringsaanbieding: eerste betaalde maand gratis (Stripe coupon, tijdelijk)

### Abonnementstatus in `users` tabel
- `subscription_status`: "trial" | "active" | "trial_expired" | "cancelled" | "past_due"
- `trial_ends_at`: timestamptz
- `stripe_customer_id`: Stripe customer ID

### Lees-only modus
Triggered als `subscription_status` = "trial_expired" of "cancelled":
- Oranje-donkere banner bovenaan elke pagina: "Je proefperiode is verlopen. Activeer je abonnement om door te gaan met factureren."
- Knop in banner: "Activeer abonnement" → Stripe Checkout
- **Geblokkeerde acties:** POST/PUT/DELETE op facturen, cliënten, uren, diensten
- **Toegestane acties:** inzien (GET), exporteren, instellingen beheren, uitloggen

---

## 17. AVG en privacy — product design beslissingen

### Artikel 9 — bijzondere persoonsgegevens
Invora slaat **geen** gezondheidsdata op. De volgende ontwerpbeslissingen zijn hieruit voortgekomen:

1. **Factuuromschrijving veld:**
   - Label: "Omschrijving dienst" (niet "behandeling")
   - Placeholder: "bijv. Coachsessie, Trainingssessie, Adviesgesprek"
   - Max 200 tekens
   - Kleine tooltip ℹ️: "Gebruik een generieke omschrijving. Voeg geen persoonlijke informatie over je cliënt toe."

2. **Urenomschrijving veld:**
   - Label: "Omschrijving"
   - Placeholder: "bijv. Coachgesprek, Intake, Voorbereiding"
   - Max 150 tekens

3. **Cliënt notitieveld:**
   - Label: "Administratieve notitie"
   - Placeholder: "bijv. factureert altijd aan het einde van de maand"
   - Max 500 tekens
   - Geen medische of gezondheidsnotities — gebruiker is hierop geïnformeerd via onboarding AVG-tip

4. **Geen notitieveld bij contacten** anders dan de administratieve notitie

### BTW-vrijstellingstekst (automatisch op elke factuur)
```
Op deze dienst is BTW-vrijstelling van toepassing op grond van artikel 11, 
lid 1, onderdeel g van de Wet op de omzetbelasting 1968.
```

### Verplichte velden op factuur (wettelijk)
- Naam en adres van de zorgverlener (therapeut)
- KvK-nummer therapeut
- Naam en adres van de cliënt
- Factuurdatum
- Uniek oplopend factuurnummer
- Omschrijving van de dienst
- Bedrag
- BTW-vrijstellingstekst

---

## 18. Marketingsite

### Hoofdpagina secties (in volgorde)
1. **Hero** — headline + subline + CTA + mockup afbeeldingen
2. **Features** — 6 features in grid
3. **Hoe het werkt** — 3 genummerde stappen
4. **Prijzen** — één plan, €14,52/mnd
5. **Testimonials** — carrousel (placeholders tot lancering)
6. **FAQ** — 7 vragen
7. **Afsluitende CTA** — sage green achtergrond
8. **Footer** — minimaal (copyright + voorwaarden + privacy)

### Copy toon
- Warm, menselijk, direct
- Geen boekhouderjargon
- Spreekt therapeuten aan als professional, niet als boekhoudkundige
- Korte zinnen, actieve taal

### Blog
- Doel: SEO op zoektermen die therapeuten gebruiken
- Elk artikel gericht op één zoekterm
- Onderwerpen: facturatie voor therapeuten, BTW-vrijstelling uitgelegd, urenregistratie voor zorgprofessionals, etc.

---

## 19. Technische integraties — details

### KvK API
- Endpoint: `https://api.kvk.nl/api/v1/basisprofielen/[kvk-nummer]`
- Authenticatie: API key in header
- Test omgeving: `https://developers.kvk.nl/test-omgeving`
- Rate limit: bewaar antwoorden niet in database (privacy), haal altijd live op
- Foutcodes: 404 (niet gevonden), 403 (ongeldige key), 500 (API down)

### Postcode API
- Endpoint: `https://api.postcode.nl/rest/addresses/[postcode]/[huisnummer]`
- Authenticatie: API key
- Foutcodes: 404 (niet gevonden), graceful fallback → handmatig invullen

### Mollie
- Elke gebruiker heeft zijn eigen Mollie account
- Opgeslagen in `users.mollie_api_key` (encrypted via Supabase vault of AES-256)
- Betaling aanmaken: gebruik Mollie Node.js SDK
- Webhook: `/api/webhooks/mollie` — verifieer via Mollie API key van specifieke gebruiker

### Resend
- Eén Resend account voor alle e-mails
- Afzenderdomein: invora.nl
- Van-naam: naam therapeut (dynamisch)
- Van-adres: facturen@invora.nl
- Reply-to: e-mailadres therapeut

### Stripe
- Eén Stripe account (van Johnny)
- Gebruikers betalen via Stripe Checkout
- Stripe Tax voor automatische BTW-berekening
- Customer Portal voor zelfbeheer abonnement

---

## 20. Design tokens

```typescript
// tailwind.config.ts — Invora design tokens
colors: {
  invora: {
    primary: '#7B9E87',        // Sage green
    'primary-dark': '#5E8A6E', // Donkerder sage green (gradient end)
    'primary-light': '#E8F2EC', // Licht sage green (achtergronden)
    background: '#F9F7F4',     // Warm wit
    surface: '#FFFFFF',        // Kaarten
    text: '#1A1A1A',           // Donkergrijs
    'text-muted': '#6B7280',   // Grijs (labels, placeholders)
    success: '#7B9E87',        // Zelfde als primary
    error: '#DC2626',          // Rood
    warning: '#D97706',        // Oranje (proefperiode banner)
    'status-paid': '#7B9E87',  // Betaald badge
    'status-open': '#6B7280',  // Openstaand badge
    'status-late': '#DC2626',  // Te laat badge
  }
}
fontFamily: {
  sans: ['Plus Jakarta Sans', 'sans-serif']
}
borderRadius: {
  DEFAULT: '0.5rem',
  card: '0.75rem',
  button: '0.5rem',
}
boxShadow: {
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
}
```
