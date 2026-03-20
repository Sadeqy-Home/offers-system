create extension if not exists pgcrypto;

create table if not exists offer_counters (
  year integer primary key,
  last_number integer not null default 0
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  offer_id text not null unique,
  status text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null default '',
  customer_address text not null default '',
  postal_code text not null default '',
  city text not null default '',
  product_type text not null,
  model text not null,
  dimensions text not null,
  fabric text not null default '',
  foam text not null default '',
  extras_json jsonb not null default '[]'::jsonb,
  delivery_price numeric(12,2) not null default 0,
  total_price numeric(12,2) not null,
  notes text not null default '',
  internal_notes text not null default '',
  configuration_json jsonb not null default '{}'::jsonb,
  payload_json jsonb not null default '{}'::jsonb,
  admin_url text not null,
  customer_url text not null,
  pdf_url text,
  pdf_generated_at timestamptz,
  draft_order_id text,
  draft_order_invoice_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists offers_status_idx on offers (status);
create index if not exists offers_created_at_idx on offers (created_at desc);
