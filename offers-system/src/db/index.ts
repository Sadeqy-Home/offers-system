import { config } from "../config.js";
import { FileOfferRepository } from "./fileOfferRepository.js";
import { PostgresOfferRepository } from "./postgresOfferRepository.js";
import type { OfferRepository } from "./repository.js";

let repository: OfferRepository | null = null;

export function getOfferRepository(): OfferRepository {
  if (repository) return repository;

  repository = config.offerStorageMode === "postgres" && config.databaseUrl
    ? new PostgresOfferRepository()
    : new FileOfferRepository();

  return repository;
}
