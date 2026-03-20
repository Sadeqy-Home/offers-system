export type OfferStatus =
  | "neu"
  | "geprüft"
  | "angebot_erstellt"
  | "angebot_gesendet"
  | "draft_order_erstellt"
  | "rechnung_gesendet"
  | "bestellt";

export type OfferLinkRole = "admin" | "customer";

export interface OfferExtrasItem {
  label: string;
  value?: string;
  quantity?: number;
  price?: number;
}

export interface OfferPayloadInput {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  customer_address?: string;
  postal_code?: string;
  city?: string;
  product_type: string;
  model: string;
  dimensions: string;
  fabric?: string;
  foam?: string;
  extras?: OfferExtrasItem[] | string[] | string | null;
  delivery_price?: number | string | null;
  total_price: number | string;
  notes?: string;
  configuration_json?: Record<string, unknown>;
  payload_json?: Record<string, unknown>;
}

export interface NormalizedOfferInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  postalCode: string;
  city: string;
  productType: string;
  model: string;
  dimensions: string;
  fabric: string;
  foam: string;
  extras: OfferExtrasItem[];
  deliveryPrice: number;
  totalPrice: number;
  notes: string;
  configurationJson: Record<string, unknown>;
  payloadJson: Record<string, unknown>;
}

export interface OfferRecord {
  id: string;
  offerId: string;
  status: OfferStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  postalCode: string;
  city: string;
  productType: string;
  model: string;
  dimensions: string;
  fabric: string;
  foam: string;
  extrasJson: OfferExtrasItem[];
  deliveryPrice: number;
  totalPrice: number;
  notes: string;
  internalNotes: string;
  configurationJson: Record<string, unknown>;
  payloadJson: Record<string, unknown>;
  adminUrl: string;
  customerUrl: string;
  pdfUrl: string | null;
  pdfGeneratedAt: string | null;
  draftOrderId: string | null;
  draftOrderInvoiceSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferResult {
  offer: OfferRecord;
  warnings: string[];
}

export interface UpdateOfferInput {
  status?: OfferStatus;
  dimensions?: string;
  fabric?: string;
  foam?: string;
  notes?: string;
  internalNotes?: string;
  deliveryPrice?: number;
  totalPrice?: number;
  extrasJson?: OfferExtrasItem[];
}

export interface ValidationIssue {
  field: string;
  message: string;
}

export interface LinkTokenPayload {
  offerId: string;
  role: OfferLinkRole;
  exp: number;
}
