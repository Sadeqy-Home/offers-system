import express from "express";
import type { Request, Response } from "express";
import { createOffer, generateOfferPdf, getOfferById, sendOffer } from "../services/offerService.js";
import { createShopifyDraftOrder, sendShopifyDraftInvoice } from "../services/shopifyService.js";
import { isHttpError } from "../utils/http.js";
import { verifySignedToken } from "../utils/tokens.js";

function getToken(req: Request): string {
  const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  const queryToken = typeof req.query.token === "string" ? req.query.token : "";
  const bodyToken = typeof body.token === "string" ? body.token : "";
  return bodyToken || queryToken;
}

function assertRole(req: Request, role: "admin" | "customer"): void {
  verifySignedToken(getToken(req), String(req.params.offerId || ""), role);
}

function wantsRedirect(req: Request): boolean {
  const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  return String(req.query.redirect || body.redirect || "") === "1";
}

function handleRouteError(error: unknown, res: Response): void {
  if (isHttpError(error)) {
    res.status(error.statusCode).json({
      ok: false,
      error: error.message,
      details: error.details ?? null
    });
    return;
  }

  res.status(500).json({
    ok: false,
    error: error instanceof Error ? error.message : "Unbekannter Serverfehler."
  });
}

export function createApiRouter() {
  const router = express.Router();

  async function handleCreateOffer(req: Request, res: Response) {
    try {
      const result = await createOffer(req.body || {});
      res.status(201).json({
        ok: true,
        offer_id: result.offer.offerId,
        status: result.offer.status,
        customer_url: result.offer.customerUrl,
        warnings: result.warnings
      });
    } catch (error) {
      handleRouteError(error, res);
    }
  }

  router.post("/offers", handleCreateOffer);
  router.post("/create", handleCreateOffer);

  router.post("/offers/:offerId/generate-pdf", async (req, res) => {
    try {
      assertRole(req, "admin");
      const offer = await generateOfferPdf(String(req.params.offerId));

      if (wantsRedirect(req)) {
        const token = encodeURIComponent(getToken(req));
        res.redirect(`/admin/offers/${encodeURIComponent(offer.offerId)}?token=${token}&notice=${encodeURIComponent("PDF wurde erzeugt.")}`);
        return;
      }

      res.json({ ok: true, offer_id: offer.offerId, pdf_url: offer.pdfUrl, status: offer.status });
    } catch (error) {
      handleRouteError(error, res);
    }
  });

  router.post("/offers/:offerId/send-offer", async (req, res) => {
    try {
      assertRole(req, "admin");
      const offer = await sendOffer(String(req.params.offerId));

      if (wantsRedirect(req)) {
        const token = encodeURIComponent(getToken(req));
        res.redirect(`/admin/offers/${encodeURIComponent(offer.offerId)}?token=${token}&notice=${encodeURIComponent("Angebot wurde an Kunde und intern versendet.")}`);
        return;
      }

      res.json({ ok: true, offer_id: offer.offerId, status: offer.status });
    } catch (error) {
      handleRouteError(error, res);
    }
  });

  router.get("/offers/:offerId", async (req, res) => {
    try {
      assertRole(req, "admin");
      const offer = await getOfferById(String(req.params.offerId));
      res.json({ ok: true, offer });
    } catch (error) {
      handleRouteError(error, res);
    }
  });

  router.post("/offers/:offerId/create-draft-order", async (req, res) => {
    try {
      assertRole(req, "admin");
      await createShopifyDraftOrder();
      res.json({ ok: true });
    } catch (error) {
      handleRouteError(error, res);
    }
  });

  router.post("/offers/:offerId/send-shopify-invoice", async (req, res) => {
    try {
      assertRole(req, "admin");
      await sendShopifyDraftInvoice();
      res.json({ ok: true });
    } catch (error) {
      handleRouteError(error, res);
    }
  });

  return router;
}
