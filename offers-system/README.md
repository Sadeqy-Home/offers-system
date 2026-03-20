# Sadeqy Offers System

Phase-1 Angebots-System fuer den Sedari-Konfigurator.

## Was Phase 1 abdeckt

- Anfrage aus dem Shopify-Theme empfangen
- Anfrage validieren und speichern
- Angebots-ID im Format `SDQ-YYYY-XXXX` erzeugen
- interne Admin-URL und Kunden-URL generieren
- interne Benachrichtigung und Kunden-Bestaetigung per E-Mail senden
- interne Admin-Seite bereitstellen
- PDF serverseitig erzeugen
- PDF-Angebot manuell per Button senden
- Shopify Draft Orders nur vorbereiten, noch nicht automatisieren

## Stack

- Node.js + TypeScript
- Express
- PostgreSQL/Supabase oder Datei-Fallback fuer lokale Entwicklung
- Playwright fuer PDF-Erzeugung
- Resend fuer E-Mail-Versand

## Ordnerstruktur

```text
offers-system/
  sql/
    schema.sql
  src/
    db/
    routes/
    services/
    templates/
    utils/
    config.ts
    server.ts
  storage/
    mail-previews/
    pdfs/
```

## Schnellstart

1. Abhaengigkeiten installieren

```bash
npm install
```

2. `.env.example` nach `.env` kopieren und Werte setzen

3. PostgreSQL-Schema einspielen

```sql
\i sql/schema.sql
```

4. Falls PDF per Playwright erzeugt werden soll:

```bash
npx playwright install chromium
```

5. Development-Server starten

```bash
npm run dev
```

## Railway Deployment

Empfohlene Produktionskombi:

- Railway fuer das Node.js-Backend
- Supabase Postgres fuer persistente Angebotsdaten
- optional Railway Volume fuer lokale PDF-/Preview-Dateien in Phase 1

### 1. Service in Railway anlegen

1. Neues Railway-Projekt anlegen
2. Dieses Repository verbinden
3. Als **Root Directory** `offers-system` setzen
4. Railway erkennt danach den `Dockerfile` im Ordner `offers-system`
5. Oeffentliche Domain fuer den Service aktivieren

### 2. Wichtige Railway Variablen setzen

Pflicht:

```text
NODE_ENV=production
OFFER_STORAGE_MODE=postgres
DATABASE_URL=<supabase-postgres-url>
ADMIN_EMAIL=shop@sadeqy.com
ADMIN_LINK_SECRET=<langes-geheimes-token>
CUSTOMER_LINK_SECRET=<langes-geheimes-token>
RESEND_API_KEY=<resend-api-key>
RESEND_FROM_EMAIL=shop@sadeqy.com
COMPANY_NAME=Sadeqy Home
COMPANY_ADDRESS=Sandheiderstr. 64, 40699 Erkrath
COMPANY_EMAIL=shop@sadeqy.com
COMPANY_PHONE=+49 2104 2005002
SHOPIFY_APP_PROXY_BASE_URL=https://sadeqy.com/apps/offers
```

Optional, aber fuer Phase 1 sinnvoll:

```text
STORAGE_ROOT=/data/storage
FILE_DB_PATH=/data/storage/offers.json
```

Hinweis:

- `APP_BASE_URL` muss auf Railway nicht zwingend gesetzt werden.
- Wenn `APP_BASE_URL` leer bleibt, verwendet das Backend automatisch `https://<RAILWAY_PUBLIC_DOMAIN>`.
- Fuer Produktion wird trotzdem empfohlen, `APP_BASE_URL` explizit auf die Railway-Domain oder spaeter auf eure eigene API-Domain zu setzen.

### 3. Railway Volume (empfohlen fuer PDFs)

Phase 1 speichert PDFs lokal im Dateisystem. Ohne Volume sind diese Dateien nach Redeployments nicht dauerhaft sicher.

Empfohlene Volume-Konfiguration:

- Volume in Railway anlegen
- Mount Path: `/data`
- Danach `STORAGE_ROOT=/data/storage`

Dann landen:

- PDFs unter `/data/storage/pdfs`
- Mail-Previews unter `/data/storage/mail-previews`

### 4. Healthcheck

Als Healthcheck-Pfad in Railway setzen:

```text
/healthz
```

### 5. Shopify anbinden

Im Shopify-Theme bleibt der Sedari-Konfigurator auf:

```text
/apps/offers/create
```

Fuer die erste Live-Phase gibt es zwei Wege:

1. Direkt die Railway-URL im Theme verwenden
2. sauberer: Shopify App Proxy auf das Railway-Backend zeigen lassen

Wenn ihr mit App Proxy arbeitet, sollte `SHOPIFY_APP_PROXY_BASE_URL` auf den oeffentlichen Shopify-Pfad zeigen:

```text
https://sadeqy.com/apps/offers
```

### 6. Supabase vorbereiten

1. Neues Supabase-Projekt anlegen
2. `sql/schema.sql` ausfuehren
3. Connection String in `DATABASE_URL` eintragen
4. `OFFER_STORAGE_MODE=postgres` setzen

### 7. Erster Live-Test

Nach dem Deploy pruefen:

```text
GET https://<railway-domain>/healthz
```

Erwartung:

```json
{
  "ok": true,
  "service": "sadeqy-offers-system",
  "storage_mode": "postgres"
}
```

Danach im Sedari-Frontend eine Testanfrage absenden und pruefen:

- Datensatz in DB vorhanden
- interne E-Mail wurde verschickt
- Kunden-Bestaetigung wurde verschickt
- Admin-Link funktioniert
- PDF-Erzeugung ueber Admin-Seite funktioniert

## Wichtige Umgebungsvariablen

- `APP_BASE_URL`
- `STORAGE_ROOT`
- `DATABASE_URL`
- `OFFER_STORAGE_MODE`
- `ADMIN_EMAIL`
- `ADMIN_LINK_SECRET`
- `CUSTOMER_LINK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## API-Endpunkte

### `POST /api/offers`

Erstellt eine neue Anfrage.

Beispiel-JSON:

```json
{
  "customer_name": "Max Mustermann",
  "customer_email": "max@example.com",
  "customer_phone": "+49 123 456789",
  "customer_address": "Sandheiderstr. 64",
  "postal_code": "40699",
  "city": "Erkrath",
  "product_type": "Sedari Casablanca",
  "model": "Premium",
  "dimensions": "U-Form: A 300 cm | B 435 cm | C 300 cm",
  "fabric": "Kundenstoff Beige",
  "foam": "T40 fest",
  "extras": [
    { "label": "Topper", "value": "Beige" },
    { "label": "Eckbox", "quantity": 1 }
  ],
  "delivery_price": 129,
  "total_price": 4439,
  "notes": "Bitte Rueckruf am Nachmittag"
}
```

### `GET /admin/offers/:offerId?token=...`

Interne Admin-Seite.

### `GET /offer/:offerId?token=...`

Read-only Kundenseite.

### `POST /api/offers/:offerId/generate-pdf`

Admin-geschuetzt. Erzeugt das PDF und aktualisiert den Status.

### `POST /api/offers/:offerId/send-offer`

Admin-geschuetzt. Erzeugt bei Bedarf zuerst das PDF und versendet danach das Angebot.

## Shopify-Anbindung

### Empfohlener Zielpfad im Theme

Fuer die Shopify-Storefront sollte der Sedari-Konfigurator an den App-Proxy senden:

```text
/apps/offers/create
```

Der Backend-Server stellt dafuer bereits den passenden Alias bereit.

### Frontend-Submit

Der bestehende Sedari-Wizard sollte strukturiertes JSON an `/apps/offers/create` senden und bei Erfolg die Referenznummer aus der JSON-Antwort anzeigen.

### Sedari-Theme-Setting

Im Shopify-Section-Schema des Sedari-Konfigurators ist dafuer ein Feld hinterlegt:

```text
Interner Angebots-Pfad = /apps/offers/create
```

Zusätzlich werden im Anfrageformular folgende Pflichtfelder erfasst:

- `customer_name`
- `customer_email`
- `customer_phone`
- `customer_address`
- `postal_code`
- `city`
- `fabric`

Produkt-, Modell-, Maß- und Preisdaten kommen direkt aus dem Konfigurator und werden serverseitig mitgespeichert.

## E-Mail-Verhalten

- Mit `RESEND_API_KEY`: echte E-Mails
- Ohne `RESEND_API_KEY`: HTML-Previews unter `storage/mail-previews/`

## PDF-Verhalten

- PDFs werden unter `storage/pdfs/` erzeugt
- oeffentliche URL ueber `/files/pdfs/<datei>`

## Statusmodell

- `neu`
- `geprueft`
- `angebot_erstellt`
- `angebot_gesendet`
- `draft_order_erstellt`
- `rechnung_gesendet`
- `bestellt`

## Phase 2

Vorbereitete Erweiterungspunkte:

- automatische Draft Orders per Shopify Admin API
- Rechnungsversand per `draftOrderInvoiceSend`
- weitergehende App-Proxy-Authentifizierung
- Storage/CDN fuer PDFs
