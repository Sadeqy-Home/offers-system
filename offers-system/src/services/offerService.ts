import crypto from "node:crypto";
import type { CreateOfferResult, OfferPayloadInput, OfferRecord, UpdateOfferInput } from "../types.js";
import { getOfferRepository } from "../db/index.js";
import { formatOfferId } from "./offerIdService.js";
import { validateOfferPayload } from "./validationService.js";
import { buildOfferLinks } from "../utils/tokens.js";
import { sendCustomerConfirmation, sendFinalOfferEmail, sendInternalNotification } from "./mailService.js";
import { renderOfferPdf } from "./pdfService.js";
import { HttpError } from "../utils/http.js";

const repository = getOfferRepository();

export async function createOffer(rawPayload: OfferPayloadInput): Promise<CreateOfferResult> {
  const normalized = validateOfferPayload(rawPayload as Record<string, unknown>);
  const year = new Date().getFullYear();
  const sequence = await repository.reserveNextOfferNumber(year);
  const offerId = formatOfferId(year, sequence);
  const links = buildOfferLinks(offerId);
  const now = new Date().toISOString();

  const offer: OfferRecord = {
    id: crypto.randomUUID(),
    offerId,
    status: "neu",
    customerName: normalized.customerName,
    customerEmail: normalized.customerEmail,
    customerPhone: normalized.customerPhone,
    customerAddress: normalized.customerAddress,
    postalCode: normalized.postalCode,
    city: normalized.city,
    productType: normalized.productType,
    model: normalized.model,
    dimensions: normalized.dimensions,
    fabric: normalized.fabric,
    foam: normalized.foam,
    extrasJson: normalized.extras,
    deliveryPrice: normalized.deliveryPrice,
    totalPrice: normalized.totalPrice,
    notes: normalized.notes,
    internalNotes: "",
    configurationJson: normalized.configurationJson,
    payloadJson: normalized.payloadJson,
    adminUrl: links.adminUrl,
    customerUrl: links.customerUrl,
    pdfUrl: null,
    pdfGeneratedAt: null,
    draftOrderId: null,
    draftOrderInvoiceSentAt: null,
    createdAt: now,
    updatedAt: now
  };

  await repository.create(offer);

  const warnings: string[] = [];

  for (const sender of [sendInternalNotification, sendCustomerConfirmation]) {
    try {
      await sender(offer);
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "E-Mail-Versand fehlgeschlagen.");
    }
  }

  return { offer, warnings };
}

export async function getOfferById(offerId: string): Promise<OfferRecord> {
  const offer = await repository.getByOfferId(offerId);
  if (!offer) {
    throw new HttpError(404, "Angebot nicht gefunden.");
  }
  return offer;
}

export async function updateOffer(offerId: string, input: UpdateOfferInput): Promise<OfferRecord> {
  return repository.updateByOfferId(offerId, input);
}

export async function generateOfferPdf(offerId: string): Promise<OfferRecord> {
  const offer = await getOfferById(offerId);
  const pdf = await renderOfferPdf(offer);

  return repository.updateByOfferId(offerId, {
    status: "angebot_erstellt",
    pdfUrl: pdf.publicUrl,
    pdfGeneratedAt: new Date().toISOString()
  });
}

export async function sendOffer(offerId: string): Promise<OfferRecord> {
  let offer = await getOfferById(offerId);

  if (!offer.pdfUrl) {
    offer = await generateOfferPdf(offerId);
  }

  const pdf = await renderOfferPdf(offer);
  await sendFinalOfferEmail(offer, pdf.buffer, `offer-${offer.offerId}.pdf`);

  return repository.updateByOfferId(offerId, {
    status: "angebot_gesendet"
  });
}
