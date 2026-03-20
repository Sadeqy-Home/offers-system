import type { NormalizedOfferInput, OfferExtrasItem, OfferPayloadInput, ValidationIssue } from "../types.js";
import { HttpError } from "../utils/http.js";

function trimText(value: unknown): string {
  return String(value ?? "").trim();
}

function parseMoney(value: unknown, field: string, allowZero = true): number {
  if (value == null || value === "") {
    if (allowZero) return 0;
    throw new HttpError(400, `${field} ist erforderlich.`);
  }

  const raw = String(value).trim();
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) {
    throw new HttpError(400, `${field} ist keine gültige Zahl.`);
  }
  return parsed;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeExtras(raw: unknown): OfferExtrasItem[] {
  if (Array.isArray(raw)) {
    return raw.map((entry) => {
      if (typeof entry === "string") {
        return { label: entry.trim() };
      }

      if (entry && typeof entry === "object") {
        const item = entry as Record<string, unknown>;
        return {
          label: trimText(item.label || item.name || item.value),
          value: trimText(item.value),
          quantity: item.quantity == null ? undefined : Number(item.quantity),
          price: item.price == null ? undefined : Number(item.price)
        };
      }

      return { label: "" };
    }).filter((item) => item.label);
  }

  if (typeof raw === "string" && raw.trim()) {
    try {
      return normalizeExtras(JSON.parse(raw));
    } catch (error) {
      return raw.split(",").map((entry) => ({ label: entry.trim() })).filter((item) => item.label);
    }
  }

  return [];
}

export function validateOfferPayload(raw: Record<string, unknown>): NormalizedOfferInput {
  const customerName = trimText(raw.customer_name ?? raw.customerName);
  const customerEmail = trimText(raw.customer_email ?? raw.customerEmail);
  const customerPhone = trimText(raw.customer_phone ?? raw.customerPhone);
  const customerAddress = trimText(raw.customer_address ?? raw.customerAddress ?? raw.address);
  const postalCode = trimText(raw.postal_code ?? raw.postalCode);
  const city = trimText(raw.city);
  const productType = trimText(raw.product_type ?? raw.productType);
  const model = trimText(raw.model);
  const dimensions = typeof raw.dimensions === "object" && raw.dimensions !== null
    ? JSON.stringify(raw.dimensions)
    : trimText(raw.dimensions);
  const fabric = trimText(raw.fabric);
  const foam = trimText(raw.foam);
  const notes = trimText(raw.notes);
  const deliveryPrice = parseMoney(raw.delivery_price ?? raw.deliveryPrice ?? 0, "delivery_price", true);
  const totalPrice = parseMoney(raw.total_price ?? raw.totalPrice, "total_price", false);
  const extras = normalizeExtras(raw.extras ?? raw.extras_json);

  const issues: ValidationIssue[] = [];

  if (!customerName) issues.push({ field: "customer_name", message: "Bitte Kundennamen angeben." });
  if (!customerEmail) issues.push({ field: "customer_email", message: "Bitte E-Mail-Adresse angeben." });
  if (customerEmail && !isValidEmail(customerEmail)) issues.push({ field: "customer_email", message: "Bitte eine gültige E-Mail-Adresse angeben." });
  if (!customerPhone) issues.push({ field: "customer_phone", message: "Bitte Telefonnummer angeben." });
  if (!customerAddress) issues.push({ field: "customer_address", message: "Bitte Adresse angeben." });
  if (!postalCode) issues.push({ field: "postal_code", message: "Bitte Postleitzahl angeben." });
  if (postalCode && !/^\d{5}$/.test(postalCode)) issues.push({ field: "postal_code", message: "Bitte eine gültige 5-stellige Postleitzahl angeben." });
  if (!city) issues.push({ field: "city", message: "Bitte Stadt angeben." });
  if (!productType) issues.push({ field: "product_type", message: "Bitte Produkttyp angeben." });
  if (!model) issues.push({ field: "model", message: "Bitte Modell angeben." });
  if (!dimensions) issues.push({ field: "dimensions", message: "Bitte Maße angeben." });
  if (!fabric) issues.push({ field: "fabric", message: "Bitte Stoff oder Bezugswunsch angeben." });
  if (totalPrice <= 0) issues.push({ field: "total_price", message: "Der Gesamtpreis muss größer als 0 sein." });
  if (deliveryPrice < 0) issues.push({ field: "delivery_price", message: "Lieferkosten dürfen nicht negativ sein." });

  if (issues.length) {
    throw new HttpError(400, "Die Anfrage enthält ungültige oder fehlende Daten.", issues);
  }

  return {
    customerName,
    customerEmail,
    customerPhone,
    customerAddress,
    postalCode,
    city,
    productType,
    model,
    dimensions,
    fabric,
    foam,
    extras,
    deliveryPrice,
    totalPrice,
    notes,
    configurationJson: (raw.configuration_json as Record<string, unknown>) || {},
    payloadJson: (raw.payload_json as Record<string, unknown>) || {}
  };
}
