alter table public.agency_settings
  add column if not exists custom_domain text,
  add column if not exists custom_domain_status text not null default 'not_configured',
  add column if not exists custom_domain_verified_at timestamptz,
  add column if not exists custom_domain_verification jsonb,
  add column if not exists custom_domain_dns jsonb;

create unique index if not exists agency_settings_custom_domain_unique
  on public.agency_settings (custom_domain)
  where custom_domain is not null and custom_domain <> '';
