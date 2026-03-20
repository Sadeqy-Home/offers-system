import fs from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import { config } from "../config.js";
import { ensureDir } from "../utils/fs.js";
import type { OfferRecord } from "../types.js";
import { renderCustomerConfirmationEmail } from "../templates/emails/customerConfirmation.js";
import { renderFinalOfferEmail } from "../templates/emails/finalOffer.js";
import { renderInternalNotificationEmail } from "../templates/emails/internalNotification.js";

interface SendMailArgs {
  to: string | string[];
  subject: string;
  html: string;
  previewName: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

async function writePreview(previewName: string, subject: string, html: string): Promise<void> {
  await ensureDir(config.mailPreviewDir);
  const filePath = path.join(config.mailPreviewDir, `${previewName}.html`);
  await fs.writeFile(filePath, `<h1>${subject}</h1>${html}`, "utf8");
}

async function sendMail(args: SendMailArgs): Promise<void> {
  if (!config.resendApiKey) {
    await writePreview(args.previewName, args.subject, args.html);
    return;
  }

  const resend = new Resend(config.resendApiKey);
  await resend.emails.send({
    from: config.resendFromEmail,
    to: Array.isArray(args.to) ? args.to : [args.to],
    subject: args.subject,
    html: args.html,
    attachments: args.attachments?.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content
    }))
  });
}

export async function sendInternalNotification(offer: OfferRecord): Promise<void> {
  const email = renderInternalNotificationEmail(offer);
  await sendMail({
    to: config.adminEmail,
    subject: email.subject,
    html: email.html,
    previewName: `${offer.offerId}-internal-notification`
  });
}

export async function sendCustomerConfirmation(offer: OfferRecord): Promise<void> {
  const email = renderCustomerConfirmationEmail(offer);
  await sendMail({
    to: offer.customerEmail,
    subject: email.subject,
    html: email.html,
    previewName: `${offer.offerId}-customer-confirmation`
  });
}

export async function sendFinalOfferEmail(offer: OfferRecord, pdfBuffer: Buffer, pdfFilename: string): Promise<void> {
  const email = renderFinalOfferEmail(offer);
  await sendMail({
    to: [offer.customerEmail, config.adminEmail],
    subject: email.subject,
    html: email.html,
    previewName: `${offer.offerId}-final-offer`,
    attachments: [{ filename: pdfFilename, content: pdfBuffer }]
  });
}
