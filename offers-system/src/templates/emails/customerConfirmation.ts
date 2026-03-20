import type { OfferRecord } from "../../types.js";
import { escapeHtml } from "../../utils/format.js";

export function renderCustomerConfirmationEmail(offer: OfferRecord): { subject: string; html: string } {
  return {
    subject: `Ihre Anfrage bei Sadeqy Home – ${offer.offerId}`,
    html: `
      <h1>Vielen Dank für Ihre Anfrage</h1>
      <p>Ihre Sedari-Anfrage ist bei uns eingegangen.</p>
      <p><strong>Referenznummer:</strong> ${escapeHtml(offer.offerId)}</p>
      <p>Wir prüfen Ihre Angaben manuell und erstellen anschließend Ihr individuelles Angebot.</p>
      <p>Sie können den Status Ihrer Anfrage hier einsehen:</p>
      <p><a href="${offer.customerUrl}">${offer.customerUrl}</a></p>
      <p>Mit freundlichen Grüßen<br>Sadeqy Home</p>
    `
  };
}
