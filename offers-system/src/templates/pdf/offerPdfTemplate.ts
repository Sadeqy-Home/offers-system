import { config } from "../../config.js";
import type { OfferRecord } from "../../types.js";
import { escapeHtml, formatCurrency, formatDateTime } from "../../utils/format.js";

export function renderOfferPdfHtml(offer: OfferRecord): string {
  const extras = offer.extrasJson.length
    ? `<ul>${offer.extrasJson.map((item) => `<li>${escapeHtml(item.label)}${item.value ? `: ${escapeHtml(item.value)}` : ""}</li>`).join("")}</ul>`
    : "<p>Keine Zusatzoptionen hinterlegt.</p>";

  return `
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <title>Angebot ${escapeHtml(offer.offerId)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1b1b1b; margin: 40px; }
          .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:32px; }
          .brand { color:#9b1d1d; font-size:28px; font-weight:700; }
          .muted { color:#666; }
          h1,h2 { margin:0 0 12px; }
          section { margin-bottom:24px; }
          table { width:100%; border-collapse: collapse; }
          th,td { border:1px solid #ddd; padding:10px; text-align:left; vertical-align:top; }
          th { background:#f6f1eb; width:34%; }
          .price-box { background:#f9f5f1; padding:18px; border:1px solid #e3d6c9; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">${escapeHtml(config.companyName)}</div>
            <div class="muted">${escapeHtml(config.companyAddress)}</div>
            <div class="muted">${escapeHtml(config.companyEmail)} · ${escapeHtml(config.companyPhone)}</div>
          </div>
          <div>
            <div><strong>Angebotsnummer:</strong> ${escapeHtml(offer.offerId)}</div>
            <div><strong>Datum:</strong> ${escapeHtml(formatDateTime(offer.createdAt))}</div>
          </div>
        </div>

        <section>
          <h2>Kundendaten</h2>
          <table>
            <tr><th>Name</th><td>${escapeHtml(offer.customerName)}</td></tr>
            <tr><th>E-Mail</th><td>${escapeHtml(offer.customerEmail)}</td></tr>
            <tr><th>Telefon</th><td>${escapeHtml(offer.customerPhone || "–")}</td></tr>
            <tr><th>Adresse</th><td>${escapeHtml(offer.customerAddress || "–")}</td></tr>
            <tr><th>PLZ / Stadt</th><td>${escapeHtml([offer.postalCode, offer.city].filter(Boolean).join(" "))}</td></tr>
          </table>
        </section>

        <section>
          <h2>Konfiguration</h2>
          <table>
            <tr><th>Produkt</th><td>${escapeHtml(offer.productType)}</td></tr>
            <tr><th>Modell</th><td>${escapeHtml(offer.model)}</td></tr>
            <tr><th>Maße</th><td>${escapeHtml(offer.dimensions)}</td></tr>
            <tr><th>Stoff</th><td>${escapeHtml(offer.fabric || "Nach Absprache")}</td></tr>
            <tr><th>Schaumstoff</th><td>${escapeHtml(offer.foam || "Nach Absprache")}</td></tr>
            <tr><th>Extras</th><td>${extras}</td></tr>
            <tr><th>Hinweise</th><td>${escapeHtml(offer.notes || "–")}</td></tr>
          </table>
        </section>

        <section>
          <h2>Preisübersicht</h2>
          <div class="price-box">
            <p><strong>Lieferkosten:</strong> ${formatCurrency(offer.deliveryPrice)}</p>
            <p><strong>Gesamtpreis:</strong> ${formatCurrency(offer.totalPrice)}</p>
          </div>
        </section>

        <section>
          <h2>Hinweise</h2>
          <p>Dieses Angebot basiert auf Ihren Angaben und wird individuell für Ihre Maßanfertigung erstellt.</p>
          <p>Maßabweichungen im üblichen handwerklichen Toleranzbereich bleiben vorbehalten. Lieferzeit und finale Freigabe erfolgen nach Prüfung.</p>
        </section>
      </body>
    </html>
  `;
}
