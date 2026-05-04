create table if not exists public.module_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agency_settings(id) on delete cascade,
  agency_name text,
  agency_email text,
  module_id text not null,
  module_name text not null,
  module_price text,
  currency text not null default 'EUR',
  status text not null default 'pending',
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by text,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists module_purchase_requests_agency_id_idx
  on public.module_purchase_requests(agency_id);

create index if not exists module_purchase_requests_status_idx
  on public.module_purchase_requests(status);

alter table public.module_purchase_requests enable row level security;
