import type { OfferRecord, UpdateOfferInput } from "../types.js";

export interface OfferRepository {
  reserveNextOfferNumber(year: number): Promise<number>;
  create(offer: OfferRecord): Promise<void>;
  getByOfferId(offerId: string): Promise<OfferRecord | null>;
  updateByOfferId(offerId: string, update: UpdateOfferInput & Partial<OfferRecord>): Promise<OfferRecord>;
}
