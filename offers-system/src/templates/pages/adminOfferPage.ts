import type { OfferRecord } from "../../types.js";
import { escapeHtml, formatCurrency, formatDateTime } from "../../utils/format.js";

export function renderAdminOfferPage(offer: OfferRecord, token: string, notice = ""): string {
  const extras = JSON.stringify(offer.extrasJson, null, 2);
  const configurationJson = JSON.stringify(offer.configurationJson, null, 2);

  return `
    <!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(offer.offerId)} – Admin</title>
        <style>
          body { font-family: Arial, sans-serif; background:#f6f2ee; color:#1f1f1f; margin:0; padding:24px; }
          .wrap { max-width:1100px; margin:0 auto; }
          .card { background:#fff; border-radius:14px; padding:24px; margin-bottom:18px; box-shadow:0 10px 30px rgba(0,0,0,.06); }
          .grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
          label { display:block; font-weight:600; margin-bottom:6px; }
          input, textarea, select { width:100%; padding:12px; border:1px solid #d4c5b7; border-radius:10px; font:inherit; box-sizing:border-box; }
          textarea { min-height:120px; }
          pre { white-space:pre-wrap; word-break:break-word; background:#f8f5f1; padding:14px; border-radius:10px; border:1px solid #e3d5c6; }
          .actions { display:flex; gap:12px; flex-wrap:wrap; margin-top:18px; }
          button { background:#9b1d1d; color:#fff; border:none; border-radius:10px; padding:12px 18px; font:inherit; cursor:pointer; }
          .secondary { background:#4f4f4f; }
          .notice { background:#eaf6ec; border:1px solid #8fcb9b; padding:14px; border-radius:10px; margin-bottom:18px; }
          .meta { color:#666; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>${escapeHtml(offer.offerId)} – Interne Angebotsansicht</h1>
          ${notice ? `<div class="notice">${escapeHtml(notice)}</div>` : ""}
          <div class="card">
            <p class="meta">Status: <strong>${escapeHtml(offer.status)}</strong> · Erstellt: ${escapeHtml(formatDateTime(offer.createdAt))}</p>
            <p class="meta">Kunden-Link: <a href="${offer.customerUrl}">${offer.customerUrl}</a></p>
            <p class="meta">Admin-Link: <a href="${offer.adminUrl}">${offer.adminUrl}</a></p>
          </div>

          <form class="card" method="post" action="/admin/offers/${encodeURIComponent(offer.offerId)}/update">
            <input type="hidden" name="token" value="${escapeHtml(token)}" />
            <div class="grid">
              <div>
                <label>Kundenname</label>
                <input value="${escapeHtml(offer.customerName)}" disabled />
              </div>
              <div>
                <label>E-Mail</label>
                <input value="${escapeHtml(offer.customerEmail)}" disabled />
              </div>
              <div>
                <label>Telefon</label>
                <input value="${escapeHtml(offer.customerPhone)}" disabled />
              </div>
              <div>
                <label>Adresse</label>
                <input value="${escapeHtml(offer.customerAddress)}" disabled />
              </div>
              <div>
                <label>PLZ / Stadt</label>
                <input value="${escapeHtml(`${offer.postalCode} ${offer.city}`.trim())}" disabled />
              </div>
              <div>
                <label>Produkttyp</label>
                <input value="${escapeHtml(offer.productType)}" disabled />
              </div>
              <div>
                <label>Modell</label>
                <input value="${escapeHtml(offer.model)}" disabled />
              </div>
              <div>
                <label>Maße</label>
                <textarea name="dimensions">${escapeHtml(offer.dimensions)}</textarea>
              </div>
              <div>
                <label>Stoff</label>
                <input name="fabric" value="${escapeHtml(offer.fabric)}" />
              </div>
              <div>
                <label>Schaumstoff</label>
                <input name="foam" value="${escapeHtml(offer.foam)}" />
              </div>
              <div>
                <label>Status</label>
                <select name="status">
                  ${["neu","geprüft","angebot_erstellt","angebot_gesendet","draft_order_erstellt","rechnung_gesendet","bestellt"].map((status) => `<option value="${status}"${offer.status === status ? " selected" : ""}>${status}</option>`).join("")}
                </select>
              </div>
              <div>
                <label>Lieferkosten</label>
                <input name="deliveryPrice" value="${escapeHtml(String(offer.deliveryPrice))}" />
              </div>
              <div>
                <label>Gesamtpreis</label>
                <input name="totalPrice" value="${escapeHtml(String(offer.totalPrice))}" />
              </div>
              <div>
                <label>Extras (JSON)</label>
                <textarea name="extrasJson">${escapeHtml(extras)}</textarea>
              </div>
              <div>
                <label>Interne Notizen</label>
                <textarea name="internalNotes">${escapeHtml(offer.internalNotes)}</textarea>
              </div>
            </div>
            <div style="margin-top:18px;">
              <label>Kundenhinweise</label>
              <textarea name="notes">${escapeHtml(offer.notes)}</textarea>
            </div>
            <div class="actions">
              <button type="submit">Bearbeiten</button>
            </div>
          </form>

          <div class="card">
            <h2>Preisblock</h2>
            <p><strong>Lieferkosten:</strong> ${formatCurrency(offer.deliveryPrice)}</p>
            <p><strong>Gesamtpreis:</strong> ${formatCurrency(offer.totalPrice)}</p>
            <p><strong>PDF:</strong> ${offer.pdfUrl ? `<a href="${offer.pdfUrl}" target="_blank" rel="noreferrer">${offer.pdfUrl}</a>` : "Noch nicht erzeugt"}</p>
            <div class="actions">
              <form method="post" action="/api/offers/${encodeURIComponent(offer.offerId)}/generate-pdf">
                <input type="hidden" name="token" value="${escapeHtml(token)}" />
                <input type="hidden" name="redirect" value="1" />
                <button type="submit" class="secondary">PDF erzeugen</button>
              </form>
              <form method="post" action="/api/offers/${encodeURIComponent(offer.offerId)}/send-offer">
                <input type="hidden" name="token" value="${escapeHtml(token)}" />
                <input type="hidden" name="redirect" value="1" />
                <button type="submit">Angebot senden</button>
              </form>
            </div>
          </div>

          <div class="card">
            <h2>Komplette Konfiguration</h2>
            <p><strong>Schaumstoff:</strong> ${escapeHtml(offer.foam || "-")}</p>
            <p><strong>Extras:</strong></p>
            <pre>${escapeHtml(extras)}</pre>
            <p><strong>Konfigurations-JSON:</strong></p>
            <pre>${escapeHtml(configurationJson)}</pre>
          </div>
        </div>
      </body>
    </html>
  `;
}
