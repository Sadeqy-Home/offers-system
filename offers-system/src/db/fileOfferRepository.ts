import crypto from "node:crypto";
import { config } from "../config.js";
import { ensureDir, readJsonFile, writeJsonFile } from "../utils/fs.js";
import { HttpError } from "../utils/http.js";
import type { OfferRecord, UpdateOfferInput } from "../types.js";
import type { OfferRepository } from "./repository.js";

interface FileDbShape {
  counters: Record<string, number>;
  offers: OfferRecord[];
}

const EMPTY_DB: FileDbShape = {
  counters: {},
  offers: []
};

export class FileOfferRepository implements OfferRepository {
  private async load(): Promise<FileDbShape> {
    await ensureDir(config.storageRoot);
    return readJsonFile<FileDbShape>(config.fileDbPath, EMPTY_DB);
  }

  private async save(db: FileDbShape): Promise<void> {
    await ensureDir(config.storageRoot);
    await writeJsonFile(config.fileDbPath, db);
  }

  async reserveNextOfferNumber(year: number): Promise<number> {
    const db = await this.load();
    const key = String(year);
    const next = (db.counters[key] || 0) + 1;
    db.counters[key] = next;
    await this.save(db);
    return next;
  }

  async create(offer: OfferRecord): Promise<void> {
    const db = await this.load();
    db.offers.push({
      ...offer,
      id: offer.id || crypto.randomUUID()
    });
    await this.save(db);
  }

  async getByOfferId(offerId: string): Promise<OfferRecord | null> {
    const db = await this.load();
    return db.offers.find((offer) => offer.offerId === offerId) || null;
  }

  async updateByOfferId(offerId: string, update: UpdateOfferInput & Partial<OfferRecord>): Promise<OfferRecord> {
    const db = await this.load();
    const index = db.offers.findIndex((offer) => offer.offerId === offerId);
    if (index < 0) {
      throw new HttpError(404, "Angebot nicht gefunden.");
    }

    db.offers[index] = {
      ...db.offers[index],
      ...update,
      updatedAt: new Date().toISOString()
    };

    await this.save(db);
    return db.offers[index];
  }
}
