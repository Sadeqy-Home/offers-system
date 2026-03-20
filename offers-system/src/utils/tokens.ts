import crypto from "node:crypto";
import { config } from "../config.js";
import type { LinkTokenPayload, OfferLinkRole } from "../types.js";
import { HttpError } from "./http.js";

function encodeBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function decodeBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signValue(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function getRoleSecret(role: OfferLinkRole): string {
  return role === "admin" ? config.adminLinkSecret : config.customerLinkSecret;
}

export function createSignedToken(payload: LinkTokenPayload): string {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signValue(encodedPayload, getRoleSecret(payload.role));
  return `${encodedPayload}.${signature}`;
}

export function verifySignedToken(token: string, expectedOfferId: string, expectedRole: OfferLinkRole): LinkTokenPayload {
  const [encodedPayload, signature] = String(token || "").split(".");
  if (!encodedPayload || !signature) {
    throw new HttpError(401, "Ungültiger Link-Token.");
  }

  const expectedSignature = signValue(encodedPayload, getRoleSecret(expectedRole));
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new HttpError(401, "Signatur des Link-Tokens ist ungültig.");
  }

  const parsed = JSON.parse(decodeBase64Url(encodedPayload)) as LinkTokenPayload;
  if (parsed.offerId !== expectedOfferId || parsed.role !== expectedRole) {
    throw new HttpError(403, "Dieser Link ist für diese Anfrage nicht gültig.");
  }

  if (parsed.exp < Date.now()) {
    throw new HttpError(410, "Dieser Link ist abgelaufen.");
  }

  return parsed;
}

export function buildOfferLinks(offerId: string): { adminUrl: string; customerUrl: string } {
  const adminToken = createSignedToken({
    offerId,
    role: "admin",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30
  });
  const customerToken = createSignedToken({
    offerId,
    role: "customer",
    exp: Date.now() + 1000 * 60 * 60 * 24 * 90
  });

  return {
    adminUrl: `${config.appBaseUrl}/admin/offers/${encodeURIComponent(offerId)}?token=${encodeURIComponent(adminToken)}`,
    customerUrl: `${config.appBaseUrl}/offer/${encodeURIComponent(offerId)}?token=${encodeURIComponent(customerToken)}`
  };
}
