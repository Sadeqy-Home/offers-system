import type { OfferRecord } from "../../types.js";
import { escapeHtml, formatCurrency, formatDateTime } from "../../utils/format.js";

export function renderCustomerOfferPage(offer: OfferRecord): string {
  return `
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(offer.offerId)} – Ihr Angebot</title>
        <style>
          body { font-family: Arial, sans-serif; background:#f8f5f1; color:#1f1f1f; margin:0; padding:24px; }
          .wrap { max-width:900px; margin:0 auto; }
          .card { background:#fff; border-radius:14px; padding:24px; margin-bottom:18px; box-shadow:0 10px 30px rgba(0,0,0,.06); }
          .status { display:inline-block; background:#9b1d1d; color:#fff; padding:8px 12px; border-radius:999px; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="card">
            <h1>Ihre Sedari-Anfrage</h1>
            <p><strong>Referenznummer:</strong> ${escapeHtml(offer.offerId)}</p>
            <p><span class="status">${escapeHtml(offer.status)}</span></p>
            <p>Erstellt am ${escapeHtml(formatDateTime(offer.createdAt))}</p>
          </div>
          <div class="card">
            <h2>Zusammenfassung</h2>
            <p><strong>Produkt:</strong> ${escapeHtml(offer.productType)}</p>
            <p><strong>Modell:</strong> ${escapeHtml(offer.model)}</p>
            <p><strong>Maße:</strong> ${escapeHtml(offer.dimensions)}</p>
            <p><strong>Stoff:</strong> ${escapeHtml(offer.fabric || "-")}</p>
            <p><strong>Schaumstoff:</strong> ${escapeHtml(offer.foam || "-")}</p>
            <p><strong>Lieferkosten:</strong> ${formatCurrency(offer.deliveryPrice)}</p>
            <p><strong>Gesamtpreis:</strong> ${formatCurrency(offer.totalPrice)}</p>
          </div>
          <div class="card">
            <h2>Dokumente</h2>
            ${offer.pdfUrl
              ? `<p><a href="${offer.pdfUrl}" target="_blank" rel="noreferrer">PDF-Angebot herunterladen</a></p>`
              : "<p>Ihr PDF-Angebot ist nach der internen Prüfung hier verfügbar.</p>"}
          </div>
        </div>
      </body>
    </html>
  `;
}
