import { HttpError } from "../utils/http.js";

export async function createShopifyDraftOrder(): Promise<never> {
  throw new HttpError(501, "Shopify Draft Orders werden in Phase 1 noch manuell erstellt.");
}

export async function sendShopifyDraftInvoice(): Promise<never> {
  throw new HttpError(501, "Der Shopify-Rechnungsversand folgt erst in Phase 2.");
}
