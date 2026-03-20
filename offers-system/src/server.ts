import express from "express";
import { config } from "./config.js";
import { createApiRouter } from "./routes/api.js";
import { createPagesRouter } from "./routes/pages.js";

const app = express();
app.set("trust proxy", true);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

app.get("/healthz", (_req, res) => {
  res.json({
    ok: true,
    service: "sadeqy-offers-system",
    storage_mode: config.offerStorageMode
  });
});

app.use("/files", express.static(config.storageRoot));
app.use("/api", createApiRouter());
app.use("/apps/offers", createApiRouter());
app.use(createPagesRouter());

app.listen(config.port, () => {
  console.log(`Sadeqy offers system listening on ${config.appBaseUrl} (port ${config.port})`);
});
