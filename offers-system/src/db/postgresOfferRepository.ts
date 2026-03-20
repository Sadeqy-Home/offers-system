import { Pool } from "pg";
import { config } from "../config.js";
import { HttpError } from "../utils/http.js";
import type { OfferRecord, UpdateOfferInput } from "../types.js";
import type { OfferRepository } from "./repository.js";

function mapRow(row: any): OfferRecord {
  return {
    id: row.id,
    offerId: row.offer_id,
    status: row.status,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address || "",
    postalCode: row.postal_code,
    city: row.city,
    productType: row.product_type,
    model: row.model,
    dimensions: row.dimensions,
    fabric: row.fabric,
    foam: row.foam,
    extrasJson: row.extras_json || [],
    deliveryPrice: Number(row.delivery_price || 0),
    totalPrice: Number(row.total_price || 0),
    notes: row.notes || "",
    internalNotes: row.internal_notes || "",
    configurationJson: row.configuration_json || {},
    payloadJson: row.payload_json || {},
    adminUrl: row.admin_url,
    customerUrl: row.customer_url,
    pdfUrl: row.pdf_url,
    pdfGeneratedAt: row.pdf_generated_at ? new Date(row.pdf_generated_at).toISOString() : null,
    draftOrderId: row.draft_order_id,
    draftOrderInvoiceSentAt: row.draft_order_invoice_sent_at ? new Date(row.draft_order_invoice_sent_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };
}

export class PostgresOfferRepository implements OfferRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({ connectionString: config.databaseUrl });
  }

  async reserveNextOfferNumber(year: number): Promise<number> {
    const result = await this.pool.query(
      `
        insert into offer_counters (year, last_number)
        values ($1, 1)
        on conflict (year)
        do update set last_number = offer_counters.last_number + 1
        returning last_number
      `,
      [year]
    );

    return Number(result.rows[0].last_number);
  }

  async create(offer: OfferRecord): Promise<void> {
    await this.pool.query(
      `
        insert into offers (
          id, offer_id, status, customer_name, customer_email, customer_phone, customer_address, postal_code, city,
          product_type, model, dimensions, fabric, foam, extras_json, delivery_price, total_price,
          notes, internal_notes, configuration_json, payload_json, admin_url, customer_url, pdf_url,
          pdf_generated_at, draft_order_id, draft_order_invoice_sent_at, created_at, updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15::jsonb, $16, $17,
          $18, $19, $20::jsonb, $21::jsonb, $22, $23, $24,
          $25, $26, $27, $28, $29
        )
      `,
      [
        offer.id,
        offer.offerId,
        offer.status,
        offer.customerName,
        offer.customerEmail,
        offer.customerPhone,
        offer.customerAddress,
        offer.postalCode,
        offer.city,
        offer.productType,
        offer.model,
        offer.dimensions,
        offer.fabric,
        offer.foam,
        JSON.stringify(offer.extrasJson || []),
        offer.deliveryPrice,
        offer.totalPrice,
        offer.notes,
        offer.internalNotes,
        JSON.stringify(offer.configurationJson || {}),
        JSON.stringify(offer.payloadJson || {}),
        offer.adminUrl,
        offer.customerUrl,
        offer.pdfUrl,
        offer.pdfGeneratedAt,
        offer.draftOrderId,
        offer.draftOrderInvoiceSentAt,
        offer.createdAt,
        offer.updatedAt
      ]
    );
  }

  async getByOfferId(offerId: string): Promise<OfferRecord | null> {
    const result = await this.pool.query(`select * from offers where offer_id = $1 limit 1`, [offerId]);
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  async updateByOfferId(offerId: string, update: UpdateOfferInput & Partial<OfferRecord>): Promise<OfferRecord> {
    const current = await this.getByOfferId(offerId);
    if (!current) {
      throw new HttpError(404, "Angebot nicht gefunden.");
    }

    const next: OfferRecord = {
      ...current,
      ...update,
      extrasJson: update.extrasJson ?? current.extrasJson,
      configurationJson: update.configurationJson ?? current.configurationJson,
      payloadJson: update.payloadJson ?? current.payloadJson,
      updatedAt: new Date().toISOString()
    };

    await this.pool.query(
      `
        update offers
        set status = $2,
            dimensions = $3,
            fabric = $4,
            foam = $5,
            extras_json = $6::jsonb,
            delivery_price = $7,
            total_price = $8,
            notes = $9,
            internal_notes = $10,
            configuration_json = $11::jsonb,
            payload_json = $12::jsonb,
            pdf_url = $13,
            pdf_generated_at = $14,
            draft_order_id = $15,
            draft_order_invoice_sent_at = $16,
            updated_at = $17
        where offer_id = $1
      `,
      [
        offerId,
        next.status,
        next.dimensions,
        next.fabric,
        next.foam,
        JSON.stringify(next.extrasJson || []),
        next.deliveryPrice,
        next.totalPrice,
        next.notes,
        next.internalNotes,
        JSON.stringify(next.configurationJson || {}),
        JSON.stringify(next.payloadJson || {}),
        next.pdfUrl,
        next.pdfGeneratedAt,
        next.draftOrderId,
        next.draftOrderInvoiceSentAt,
        next.updatedAt
      ]
    );

    return next;
  }
}
