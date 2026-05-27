# TESTPLAN — Fase 2 (Authenticatie + onboarding)

> Doorloop dit van boven naar beneden. Vink items af terwijl je test. Aanloopkost: ~5 min voorbereiding, het testen zelf duurt ~30–45 min.

---

## 0. Voorbereiding

- [ ] Dev server starten in PowerShell: `npm run dev`
- [ ] Noteer de poort die Next.js logt (vaak `3000` of `3003` als 3000 bezet is). Gebruik die overal hieronder als `<PORT>`.
- [ ] Open Supabase dashboard naast je browser: https://supabase.com/dashboard/project/obxvotpcrcdmrsxoxcjz
- [ ] Zorg dat je **twee e-mailadressen** beschikbaar hebt — dezelfde Gmail met een `+` truc werkt prima:
  - **Account A:** `jouwadres+invora-a@gmail.com`
  - **Account B:** `jouwadres+invora-b@gmail.com`
- [ ] Open Chrome DevTools (F12) en zorg dat je de **Application → Cookies** sectie kunt vinden — die heb je nodig om tussendoor uit te loggen (er is in deze fase nog geen logout-knop)
- [ ] **Eerste keer uitloggen-tip:** F12 → Application → Cookies → `localhost:<PORT>` → klik op "Clear all cookies"

---

## 1. Registratiepagina — happy path

URL: `http://localhost:<PORT>/register`

- [ ] **1.1** Pagina laadt. Verwacht:
  - Links: formulier met "Account aanmaken", "Aanmelden met Google" knop, "of" divider, velden voornaam/e-mail/wachtwoord/bevestigen, twee checkboxes (voorwaarden + privacy)
  - Rechts (alleen op desktop ≥1024px): sage green gradient paneel met "Factureren zonder gedoe." en "© Invora — Work Remote"
  - Bovenaan klein "Invora" logo
- [ ] **1.2** Vul in:
  - Voornaam: `Anna`
  - E-mail: `<account-A>`
  - Wachtwoord: `TestWachtwoord123!`
  - Bevestigen: `TestWachtwoord123!`
- [ ] **1.3** Tijdens het typen van het wachtwoord: balk verschijnt onder het veld. Verwacht progressie:
  - 1–7 tekens: rood "Te kort"
  - 8+ alleen letters: oranje "Zwak"
  - 8+ met letters en cijfers: geel "Gemiddeld"
  - 12+ met mix van letters/cijfers/symbolen: groen "Sterk"
- [ ] **1.4** Klik op het oog-icoon rechts in het wachtwoord-veld → wachtwoord wordt zichtbaar als tekst. Klik nogmaals → weer verborgen.
- [ ] **1.5** Vink de twee checkboxes aan. Klik **Account aanmaken**.
- [ ] **1.6** Je wordt geredirect naar `http://localhost:<PORT>/register/verify`.
- [ ] **1.7** Controleer in Supabase dashboard:
  - **Authentication → Users:** rij met `<account-A>` aangemaakt, kolom "Last sign in" leeg, "Created at" zojuist
  - **Table Editor → users:** rij met `first_name = Anna`, `onboarding_completed = false`, `terms_accepted_at = null`

---

## 2. Registratie — validatiefouten

URL: `http://localhost:<PORT>/register`

Verwacht: bij elk hieronder verschijnt een **rode foutmelding onder het betreffende veld** en het formulier wordt NIET verzonden.

- [ ] **2.1** Klik direct op **Account aanmaken** met lege velden → fouten onder voornaam, e-mail, wachtwoord, bevestigen, voorwaarden, privacy
- [ ] **2.2** Vul e-mail `geen-geldig-email` in → "Voer een geldig e-mailadres in"
- [ ] **2.3** Vul wachtwoord `abc` (3 tekens) in → "Wachtwoord moet minimaal 8 tekens bevatten"
- [ ] **2.4** Wachtwoord `abc12345` + bevestigen `abc99999` → "Wachtwoorden komen niet overeen"
- [ ] **2.5** Alles ingevuld, alleen voorwaarden NIET aangevinkt → "Je moet akkoord gaan met de voorwaarden"
- [ ] **2.6** Alles ingevuld, alleen privacy NIET aangevinkt → "Je moet akkoord gaan met het privacybeleid"
- [ ] **2.7** Probeer opnieuw met account A te registreren (zelfde e-mail) → foutbanner bovenaan: "Er bestaat al een account met dit e-mailadres. **Inloggen →**"
- [ ] **2.8** Klik op die "Inloggen →" link → je belandt op `/login`

---

## 3. Voorwaarden + privacy links

Tijdens registratie (open een **nieuw tabblad**, niet vervangen):

- [ ] **3.1** Klik op "algemene voorwaarden" in checkbox 1 → opent `/voorwaarden` in nieuw tabblad. Verwacht: placeholder pagina met sage green "Wordt vóór productlancering toegevoegd" banner
- [ ] **3.2** Klik op "privacybeleid" in checkbox 2 → opent `/privacy` in nieuw tabblad. Verwacht: placeholder pagina

---

## 4. E-mail bevestigingspagina (`/register/verify`)

URL: `http://localhost:<PORT>/register/verify` (je bent hier vanaf 1.6)

- [ ] **4.1** Pagina toont:
  - SVG illustratie van persoon met envelop (sage green / warm zand kleuren)
  - Titel "Controleer je e-mail"
  - Knop "Bevestigingsmail opnieuw sturen"
  - Link "Terug naar inloggen"
- [ ] **4.2** Open je inbox van `<account-A>`. Verwacht: e-mail met:
  - Afzender Supabase (later wordt dit `noreply@invora.nl` na Resend-koppeling in fase 13)
  - Onderwerp: **"Bevestig je e-mailadres voor Invora"**
  - Inhoud: Nederlandse template met sage green Invora-logo, knop "E-mailadres bevestigen", fallback-link
- [ ] **4.3** Klik op "Bevestigingsmail opnieuw sturen" → knop wordt 60 seconden disabled met aftellende tekst "Opnieuw versturen in 59s … 58s …". Onder de knop verschijnt groen "E-mail verstuurd. Controleer je inbox."
- [ ] **4.4** Tweede e-mail komt binnen.
- [ ] **4.5** Vernieuw nu de pagina (`F5`) → het e-mailadres uit sessionStorage is weg. Verwacht: invoerveld voor e-mail verschijnt boven de knop. Knop is disabled tot je een e-mail intypt.

---

## 5. E-mailbevestiging volgen

- [ ] **5.1** Klik in de bevestigingsmail op **"E-mailadres bevestigen"**.
- [ ] **5.2** Je wordt naar `/auth/callback?code=…` gestuurd, die direct doorstuurt naar `/welcome` (omdat onboarding nog niet voltooid is).
- [ ] **5.3** Controleer in Supabase dashboard → Authentication → Users → `<account-A>`: kolom "Last sign in" is nu ingevuld.

---

## 6. Welkomstscherm

URL: `http://localhost:<PORT>/welcome` (je bent hier vanaf 5.2)

- [ ] **6.1** Pagina toont:
  - Gecentreerd op warm-wit achtergrond
  - SVG: stylized persoon (sage green/warm zand) wijst naar een knop
  - Grote sage green titel: **"Welkom bij Invora, Anna!"**
  - Twee zinnen uitleg
  - Sage green gradient knop "Account instellen →"
- [ ] **6.2** Klik op de knop → je gaat naar `/onboarding`

---

## 7. Onboarding stap 1 — bedrijfsgegevens + IBAN

URL: `http://localhost:<PORT>/onboarding`

- [ ] **7.1** Bovenaan: voortgangsbalk vult voor 50%. Tekst "Bedrijfsgegevens — Stap 1 van 2"
- [ ] **7.2** Velden in deze volgorde: KvK-nummer (optioneel, met subtext "We vullen binnenkort automatisch…"), Bedrijfsnaam, Straat + huisnummer, Postcode + Stad (naast elkaar op desktop), IBAN
- [ ] **7.3** Vul KvK-nummer `1234` in → geen vinkje verschijnt
- [ ] **7.4** Vul aan naar `12345678` (8 cijfers) → groen vinkje verschijnt rechts in het veld
- [ ] **7.5** Vul KvK `abc12345` → fout "KvK-nummer bestaat uit 8 cijfers" (alleen bij submit)
- [ ] **7.6** Maak KvK weer leeg (mag) en vul rest in:
  - Bedrijfsnaam: `Praktijk Anna`
  - Straat: `Kerkstraat 12`
  - Postcode: `1234 AB`
  - Stad: `Amsterdam`
- [ ] **7.7** Vul IBAN `NL` → veld toont `NL` (alles uppercase wordt automatisch)
- [ ] **7.8** Type door: `NL91ABNA0417164300` → veld toont `NL91 ABNA 0417 1643 00` (automatisch spaties elke 4 tekens) + groen vinkje verschijnt
- [ ] **7.9** Vervang IBAN met `NL00FOUT123` → bij submit: fout "Voer een geldig Nederlands IBAN-nummer in"
- [ ] **7.10** Zet IBAN terug op `NL91 ABNA 0417 1643 00` en klik **Volgende stap →**
- [ ] **7.11** Pagina verschuift naar stap 2. Controleer in Supabase dashboard → users tabel → `<account-A>`:
  - `company_name = Praktijk Anna`
  - `address_street = Kerkstraat 12`
  - `address_city = Amsterdam`
  - `iban = NL91ABNA0417164300` (zonder spaties)
  - `onboarding_completed = false` (nog niet)

---

## 8. Onboarding stap 2 — BTW-status

- [ ] **8.1** Pagina toont:
  - Voortgangsbalk op 100%, "Stap 2 van 2"
  - Titel "Hoe factureer je?"
  - Twee grote kaarten naast elkaar (op mobiel onder elkaar): "Ja, ik ben BTW-vrijgesteld" (FileCheck icon) en "Nee, ik reken BTW" (Receipt icon)
  - ℹ tekst over boekhouder
  - Knoppen "← Vorige stap" + "Invora starten →"
- [ ] **8.2** Submit knop **Invora starten →** is disabled (grijs)
- [ ] **8.3** Klik op kaart "Ja, ik ben BTW-vrijgesteld" → kaart krijgt sage green border + lichtgroene achtergrond + icoon-cirkel wordt sage green met witte vinkje
- [ ] **8.4** Klik op andere kaart "Nee, ik reken BTW" → selectie verspringt, andere kaart wordt normaal
- [ ] **8.5** Klik **← Vorige stap** → terug naar stap 1, voortgangsbalk weer op 50%, velden hebben hun ingevulde waarden behouden
- [ ] **8.6** Klik **Volgende stap →** weer naar stap 2. Eerdere kaartselectie is **leeg** (state reset bij navigatie tussen stappen) — selecteer **opnieuw** "BTW-vrijgesteld"
- [ ] **8.7** Klik **Invora starten →** → je gaat naar `/dashboard` (placeholder met "Dashboard — Wordt gebouwd in Fase 3")
- [ ] **8.8** Controleer Supabase users tabel:
  - `btw_vrijgesteld = true`
  - `onboarding_completed = true`

---

## 9. Login flow

Eerst uitloggen: F12 → Application → Cookies → `localhost:<PORT>` → Clear all cookies → herlaad pagina.

URL: `http://localhost:<PORT>/login`

- [ ] **9.1** Layout: zelfde gesplitst paneel als register
- [ ] **9.2** Klik direct op **Inloggen** zonder velden → foutmelding "Wachtwoord is verplicht" + "Voer een geldig e-mailadres in"
- [ ] **9.3** Vul `<account-A>` + verkeerd wachtwoord `verkeerdpw123` → rode banner: "Onjuist e-mailadres of wachtwoord"
- [ ] **9.4** Vul nu juist wachtwoord `TestWachtwoord123!` → na klik op Inloggen wordt je doorgestuurd naar `/dashboard` (omdat onboarding voltooid is)
- [ ] **9.5** Test de "Wachtwoord vergeten?" link rechts naast het label → opent `/forgot-password` (test pas verder bij stap 11)
- [ ] **9.6** Test oog-icoon in wachtwoord-veld → toon/verberg werkt

---

## 10. Middleware-redirects

Voer dit met je huidige sessie uit (ingelogd als account A, onboarding voltooid).

- [ ] **10.1** Ga naar `http://localhost:<PORT>/login` → **automatisch geredirect naar `/dashboard`** (ingelogd kan niet op login)
- [ ] **10.2** Ga naar `http://localhost:<PORT>/register` → ook naar `/dashboard`
- [ ] **10.3** Ga naar `http://localhost:<PORT>/onboarding` → naar `/dashboard` (onboarding al voltooid)
- [ ] **10.4** Ga naar `http://localhost:<PORT>/welcome` → naar `/dashboard` (onboarding al voltooid)
- [ ] **10.5** Ga naar `http://localhost:<PORT>/facturen` → pagina laadt (placeholder "Wordt gebouwd in fase 5")

Wis nu cookies (logout):

- [ ] **10.6** Ga naar `http://localhost:<PORT>/dashboard` → geredirect naar `/login?redirectTo=%2Fdashboard`
- [ ] **10.7** Ga naar `http://localhost:<PORT>/facturen` → naar `/login?redirectTo=%2Ffacturen`
- [ ] **10.8** Log nu in via die `/login?redirectTo=…` pagina → na succes ga je naar `/facturen` (de URL uit `redirectTo` parameter)

---

## 11. Wachtwoord vergeten

Wis eerst cookies om uit te loggen.

URL: `http://localhost:<PORT>/forgot-password`

- [ ] **11.1** Pagina toont titel + tekst + e-mailveld + knop "Herstelmail sturen" + link "Terug naar inloggen"
- [ ] **11.2** Vul `<account-A>` in en klik **Herstelmail sturen**
- [ ] **11.3** Het formulier verdwijnt; sage green melding verschijnt: "Als dit e-mailadres bij ons bekend is, ontvang je een herstelmail." + link terug naar login
- [ ] **11.4** Vul nu een niet-bestaand adres in (open eerst de URL opnieuw) — bv `bestaatzeker.niet@invora.test` — zelfde melding verschijnt (geen onthulling of e-mail bestaat). Goed.
- [ ] **11.5** Check je inbox `<account-A>`:
  - Onderwerp: **"Stel je Invora-wachtwoord opnieuw in"**
  - Nederlandse template met sage green logo en knop "Wachtwoord resetten"

---

## 12. Wachtwoord resetten

- [ ] **12.1** Klik in de herstelmail op **"Wachtwoord resetten"**
- [ ] **12.2** Je belandt op `/reset-password` (Supabase logt je via de link automatisch tijdelijk in om de wijziging te kunnen doen). Pagina toont titel + twee wachtwoordvelden + sterkte-indicator
- [ ] **12.3** Vul wachtwoord `abc` → foutmelding na klik op opslaan "Wachtwoord moet minimaal 8 tekens bevatten"
- [ ] **12.4** Vul `NieuwWachtwoord456!` + bevestigen `andersanders` → "Wachtwoorden komen niet overeen"
- [ ] **12.5** Vul tweemaal `NieuwWachtwoord456!` → klik **Wachtwoord opslaan**
- [ ] **12.6** Je wordt uitgelogd en naar `/login?message=password_updated` gestuurd. Sage green melding: "Je wachtwoord is bijgewerkt. Log nu in met je nieuwe wachtwoord."
- [ ] **12.7** Probeer in te loggen met het **oude** wachtwoord (`TestWachtwoord123!`) → "Onjuist e-mailadres of wachtwoord"
- [ ] **12.8** Log nu in met het **nieuwe** wachtwoord → succes, doorgestuurd naar `/dashboard`
- [ ] **12.9** **Verlopen-link test:** ga in een nieuw incognito-venster direct naar `http://localhost:<PORT>/reset-password` (zonder via een mail-link te komen). Pagina laadt; wacht tot de sessie-check klaar is. Verwacht: rode foutmelding "Deze link is verlopen. Vraag een nieuwe herstelmail aan." + link naar `/forgot-password`

---

## 13. Tweede account: e-mail nog niet bevestigd

In een **incognito-venster** (of na cookies wissen):

- [ ] **13.1** Registreer account B (`<account-B>`, voornaam `Bob`, wachtwoord `Test123Test!`). Klik door naar verify pagina.
- [ ] **13.2** Klik **NIET** op de bevestigingsmail. Ga direct naar `http://localhost:<PORT>/login`.
- [ ] **13.3** Probeer in te loggen met `<account-B>` + wachtwoord → foutbanner: "Bevestig eerst je e-mailadres. **Opnieuw versturen →**"
- [ ] **13.4** Klik op die "Opnieuw versturen →" link → terug naar `/register/verify` met invoerveld (sessionStorage is leeg vanwege ander venster). Vul `<account-B>` in en stuur opnieuw.
- [ ] **13.5** Bevestig nu in je inbox. Daarna: log in via `/login` → doorgestuurd naar **`/welcome`** (NIET dashboard, omdat onboarding niet voltooid)

---

## 14. Middleware-redirect bij niet-voltooide onboarding

Je bent nu ingelogd als account B op `/welcome`.

- [ ] **14.1** Ga handmatig naar `http://localhost:<PORT>/dashboard` → **geredirect naar `/welcome`** (middleware ziet `onboarding_completed = false`)
- [ ] **14.2** Idem voor `/facturen`, `/clienten`, `/uren` → allemaal redirecten naar `/welcome`
- [ ] **14.3** `/onboarding` daarentegen laadt gewoon (is in de toegestane onboarding-routes)
- [ ] **14.4** Doorloop nu de onboarding voor account B (vul testgegevens in, andere KvK + IBAN dan account A, kies "Nee, ik reken BTW") en finish
- [ ] **14.5** Na "Invora starten →" land je op `/dashboard`. Ga nu opnieuw naar `/facturen` → laadt gewoon
- [ ] **14.6** Ga naar `/welcome` → geredirect naar `/dashboard` (onboarding voltooid)

---

## 15. Multi-user RLS (data-isolatie)

In je gewone (niet-incognito) venster: log in als **account A**.

- [ ] **15.1** F12 → Network → klik refresh op `/dashboard` → bekijk de Supabase API requests. Geen rij van account B mag verschijnen (in deze fase staat er niets in tabellen die je client-side ophaalt, dus alleen `users` GET op eigen ID).

Sanity check via Supabase dashboard:

- [ ] **15.2** Open Supabase → Authentication → Users — beide accounts staan er
- [ ] **15.3** Open Table editor → users — beide rijen zichtbaar (service role bypast RLS, normaal). Account A heeft `btw_vrijgesteld = true`, account B `false`. `onboarding_completed = true` bij beiden.

> De échte RLS-test tussen twee gebruikers heb ik al draaiend gedaan in `scripts/test-auth-flow.mjs` (16/16 ✓). Hier is het alleen sanity dat de data klopt.

---

## 16. Google OAuth knop (UI-check, niet functioneel)

URL: `http://localhost:<PORT>/login` of `/register`

- [ ] **16.1** Bovenaan staat een witte "Aanmelden/Inloggen met Google" knop met Google-logo (4-kleurig G)
- [ ] **16.2** Klik op de knop → er verschijnt rood "Google login mislukt. Probeer het opnieuw." onder de knop (omdat Google OAuth nog niet in Supabase is geconfigureerd — staat in TASKS.md als handmatige stap voor jou)

---

## 17. Responsive design

Open Chrome DevTools (F12) → klik op het device-toolbar icoon (Ctrl+Shift+M).

- [ ] **17.1** Selecteer **iPhone SE (375px)**. Open `/register`:
  - Alleen het formulier zichtbaar (linker kant), het gradient paneel is verborgen
  - Velden zijn breed genoeg, geen horizontale scroll
- [ ] **17.2** Idem voor `/login`, `/forgot-password`, `/reset-password`
- [ ] **17.3** Open `/onboarding` op 375px → KvK/bedrijfsnaam/straat onder elkaar, postcode + stad ook onder elkaar (op desktop naast elkaar)
- [ ] **17.4** Onboarding stap 2 op 375px → BTW-kaarten onder elkaar (op desktop naast elkaar)
- [ ] **17.5** Welcome op 375px → SVG figuur en knop blijven gecentreerd
- [ ] **17.6** Selecteer **Desktop (>1024px)** of zet device-toolbar uit → gradient paneel rechts wordt zichtbaar op de auth-pagina's

---

## 18. Loading + error fallback

- [ ] **18.1** In Chrome DevTools → Network tab → throttle naar **"Slow 4G"**. Refresh `/register` → korte spinner (border-4 sage green roterend) zichtbaar
- [ ] **18.2** Zet throttle terug op "No throttling"

---

## 19. URL-parameter mappen

URL: `http://localhost:<PORT>/login?error=auth_callback_failed`

- [ ] **19.1** Login pagina toont rode banner "Inloggen mislukt. Probeer het opnieuw."

URL: `http://localhost:<PORT>/login?message=password_updated`

- [ ] **19.2** Login pagina toont sage green melding "Je wachtwoord is bijgewerkt. Log nu in met je nieuwe wachtwoord."

URL: `http://localhost:<PORT>/auth/callback` (zonder code)

- [ ] **19.3** Direct geredirect naar `/login?error=auth_callback_failed`

---

## 20. Opruimen

Na alle tests:

- [ ] **20.1** Supabase dashboard → Authentication → Users → verwijder beide testaccounts (`<account-A>` en `<account-B>`). Cascade-delete ruimt automatisch de `public.users` rijen op.
- [ ] **20.2** Stop de dev server in PowerShell (`Ctrl+C` in het terminalvenster waar `npm run dev` draait)
- [ ] **20.3** **Revoke de Supabase PAT** die je hebt aangemaakt voor de auth-config (`invora-claude-fase2` of vergelijkbaar) via https://supabase.com/dashboard/account/tokens

---

## ✅ Wanneer is fase 2 geaccepteerd?

Alle 20 secties moeten zonder onverwachte fouten doorlopen kunnen worden. Documenteer fouten als bug-rapport (welk testitem, wat zag je, wat verwachtte je). Stuur me die lijst terug en ik fix het in één run.

> Bekende beperkingen die GEEN bug zijn:
> - Google OAuth knop werkt nog niet (16.2) — wacht op handmatige credentials van jou in Google Cloud Console
> - E-mails komen vooralsnog van Supabase' eigen mailer, niet `noreply@invora.nl` — Resend-koppeling komt later in fase 13
> - Dashboard, sidebar en logout-knop bestaan nog niet — fase 3
> - Voorwaarden + privacy pagina's zijn placeholders — fase 12
