import type { OfferRecord } from "../../types.js";
import { escapeHtml, formatCurrency } from "../../utils/format.js";

export function renderFinalOfferEmail(offer: OfferRecord): { subject: string; html: string } {
  return {
    subject: `Ihr Sedari-Angebot – ${offer.offerId}`,
    html: `
      <h1>Ihr individuelles Sedari-Angebot</h1>
      <p>anbei erhalten Sie Ihr geprüftes Angebot.</p>
      <p><strong>Referenznummer:</strong> ${escapeHtml(offer.offerId)}</p>
      <p><strong>Gesamtpreis:</strong> ${formatCurrency(offer.totalPrice)}</p>
      <p>Über Ihren Kunden-Link können Sie den aktuellen Stand jederzeit einsehen:</p>
      <p><a href="${offer.customerUrl}">${offer.customerUrl}</a></p>
      <p>Bei Rückfragen antworten Sie gerne direkt auf diese E-Mail.</p>
      <p>Mit freundlichen Grüßen<br>Sadeqy Home</p>
    `
  };
}
