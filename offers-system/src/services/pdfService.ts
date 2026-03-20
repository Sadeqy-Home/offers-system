import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import { config } from "../config.js";
import type { OfferRecord } from "../types.js";
import { ensureDir } from "../utils/fs.js";
import { renderOfferPdfHtml } from "../templates/pdf/offerPdfTemplate.js";

export async function renderOfferPdf(offer: OfferRecord): Promise<{ filePath: string; publicUrl: string; buffer: Buffer }> {
  await ensureDir(config.pdfStorageDir);
  const fileName = `offer-${offer.offerId}.pdf`;
  const filePath = path.join(config.pdfStorageDir, fileName);
  const html = renderOfferPdfHtml(offer);
  const launchArgs = process.getuid?.() === 0 ? ["--no-sandbox", "--disable-setuid-sandbox"] : [];

  const browser = await chromium.launch({ headless: true, args: launchArgs });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: true,
      margin: { top: "16mm", right: "14mm", bottom: "16mm", left: "14mm" }
    });
  } finally {
    await browser.close();
  }

  const buffer = await fs.readFile(filePath);
  return {
    filePath,
    publicUrl: `${config.appBaseUrl}/files/pdfs/${encodeURIComponent(fileName)}`,
    buffer
  };
}
