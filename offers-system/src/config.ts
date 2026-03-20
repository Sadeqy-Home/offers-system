import "dotenv/config";
import path from "node:path";

export interface AppConfig {
  nodeEnv: string;
  port: number;
  appBaseUrl: string;
  railwayPublicDomain: string;
  shopifyAppProxyBaseUrl: string;
  databaseUrl: string;
  offerStorageMode: "postgres" | "file";
  fileDbPath: string;
  adminEmail: string;
  adminLinkSecret: string;
  customerLinkSecret: string;
  resendApiKey: string;
  resendFromEmail: string;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  storageRoot: string;
  pdfStorageDir: string;
  mailPreviewDir: string;
}

const cwd = process.cwd();
const port = Number(process.env.PORT || 8787);
const railwayPublicDomain = String(process.env.RAILWAY_PUBLIC_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
const defaultAppBaseUrl = railwayPublicDomain ? `https://${railwayPublicDomain}` : `http://localhost:${port}`;
const storageRoot = path.resolve(cwd, process.env.STORAGE_ROOT || "./storage");
const defaultFileDbPath = path.join(storageRoot, "offers.json");

export const config: AppConfig = {
  nodeEnv: process.env.NODE_ENV || "development",
  port,
  appBaseUrl: String(process.env.APP_BASE_URL || defaultAppBaseUrl).replace(/\/$/, ""),
  railwayPublicDomain,
  shopifyAppProxyBaseUrl: String(process.env.SHOPIFY_APP_PROXY_BASE_URL || "").replace(/\/$/, ""),
  databaseUrl: process.env.DATABASE_URL || "",
  offerStorageMode: process.env.OFFER_STORAGE_MODE === "postgres" ? "postgres" : "file",
  fileDbPath: path.resolve(cwd, process.env.FILE_DB_PATH || defaultFileDbPath),
  adminEmail: process.env.ADMIN_EMAIL || "shop@sadeqy.com",
  adminLinkSecret: process.env.ADMIN_LINK_SECRET || "change-me",
  customerLinkSecret: process.env.CUSTOMER_LINK_SECRET || "change-me-too",
  resendApiKey: process.env.RESEND_API_KEY || "",
  resendFromEmail: process.env.RESEND_FROM_EMAIL || "shop@sadeqy.com",
  companyName: process.env.COMPANY_NAME || "Sadeqy Home",
  companyAddress: process.env.COMPANY_ADDRESS || "Sandheiderstr. 64, 40699 Erkrath",
  companyEmail: process.env.COMPANY_EMAIL || "shop@sadeqy.com",
  companyPhone: process.env.COMPANY_PHONE || "+49 2104 2005002",
  storageRoot,
  pdfStorageDir: path.join(storageRoot, "pdfs"),
  mailPreviewDir: path.join(storageRoot, "mail-previews")
};
