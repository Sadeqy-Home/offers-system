import { config } from "../../config.js";
import type { OfferRecord } from "../../types.js";
import { escapeHtml, formatCurrency } from "../../utils/format.js";

export function renderInternalNotificationEmail(offer: OfferRecord): { subject: string; html: string } {
  return {
    subject: `Neue Sedari Anfrage – ${offer.offerId}`,
    html: `
      <h1>Neue Sedari Anfrage</h1>
      <p><strong>Referenz:</strong> ${escapeHtml(offer.offerId)}</p>
      <p><strong>Kunde:</strong> ${escapeHtml(offer.customerName)} (${escapeHtml(offer.customerEmail)})</p>
      <p><strong>Telefon:</strong> ${escapeHtml(offer.customerPhone || "–")}</p>
      <p><strong>Adresse:</strong> ${escapeHtml(offer.customerAddress || "–")}</p>
      <p><strong>Ort:</strong> ${escapeHtml([offer.postalCode, offer.city].filter(Boolean).join(" "))}</p>
      <p><strong>Produkt:</strong> ${escapeHtml(offer.productType)}</p>
      <p><strong>Modell:</strong> ${escapeHtml(offer.model)}</p>
      <p><strong>Maße:</strong> ${escapeHtml(offer.dimensions)}</p>
      <p><strong>Lieferkosten:</strong> ${formatCurrency(offer.deliveryPrice)}</p>
      <p><strong>Gesamtpreis:</strong> ${formatCurrency(offer.totalPrice)}</p>
      <p><strong>Admin-Link:</strong><br><a href="${offer.adminUrl}">${offer.adminUrl}</a></p>
      <hr>
      <p>${escapeHtml(config.companyName)} · ${escapeHtml(config.companyEmail)} · ${escapeHtml(config.companyPhone)}</p>
    `
  };
}
