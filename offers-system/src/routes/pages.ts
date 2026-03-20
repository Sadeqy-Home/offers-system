import express from "express";
import type { Request, Response } from "express";
import { getOfferById, updateOffer } from "../services/offerService.js";
import { renderAdminOfferPage } from "../templates/pages/adminOfferPage.js";
import { renderCustomerOfferPage } from "../templates/pages/customerOfferPage.js";
import { isHttpError } from "../utils/http.js";
import { verifySignedToken } from "../utils/tokens.js";
import type { OfferExtrasItem, OfferStatus } from "../types.js";

function getToken(req: Request): string {
  const body = req.body && typeof req.body === "object" ? req.body as Record<string, unknown> : {};
  return String(body.token || req.query.token || "");
}

function requireRole(req: Request, role: "admin" | "customer"): string {
  const token = getToken(req);
  verifySignedToken(token, String(req.params.offerId || ""), role);
  return token;
}

function handlePageError(error: unknown, res: Response): void {
  const statusCode = isHttpError(error) ? error.statusCode : 500;
  const message = isHttpError(error) ? error.message : error instanceof Error ? error.message : "Unbekannter Fehler.";
  res.status(statusCode).send(`
    <!doctype html>
    <html lang="de"><body style="font-family:Arial,sans-serif;padding:32px;">
      <h1>Fehler</h1>
      <p>${message}</p>
    </body></html>
  `);
}

function parseExtrasJson(raw: unknown): OfferExtrasItem[] | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  try {
    return JSON.parse(raw) as OfferExtrasItem[];
  } catch (error) {
    return undefined;
  }
}

export function createPagesRouter() {
  const router = express.Router();

  router.get("/admin/offers/:offerId", async (req, res) => {
    try {
      const token = requireRole(req, "admin");
      const offer = await getOfferById(String(req.params.offerId));
      const notice = typeof req.query.notice === "string" ? req.query.notice : "";
      res.send(renderAdminOfferPage(offer, token, notice));
    } catch (error) {
      handlePageError(error, res);
    }
  });

  router.post("/admin/offers/:offerId/update", async (req, res) => {
    try {
      const token = requireRole(req, "admin");
      const offerId = String(req.params.offerId);
      await updateOffer(offerId, {
        status: String(req.body.status || "neu") as OfferStatus,
        dimensions: String(req.body.dimensions || ""),
        fabric: String(req.body.fabric || ""),
        foam: String(req.body.foam || ""),
        notes: String(req.body.notes || ""),
        internalNotes: String(req.body.internalNotes || ""),
        deliveryPrice: Number(req.body.deliveryPrice || 0),
        totalPrice: Number(req.body.totalPrice || 0),
        extrasJson: parseExtrasJson(req.body.extrasJson)
      });
      res.redirect(`/admin/offers/${encodeURIComponent(offerId)}?token=${encodeURIComponent(token)}&notice=${encodeURIComponent("Angebot wurde aktualisiert.")}`);
    } catch (error) {
      handlePageError(error, res);
    }
  });

  router.get("/offer/:offerId", async (req, res) => {
    try {
      requireRole(req, "customer");
      const offer = await getOfferById(String(req.params.offerId));
      res.send(renderCustomerOfferPage(offer));
    } catch (error) {
      handlePageError(error, res);
    }
  });

  return router;
}
