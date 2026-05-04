alter table public.villas
  add column if not exists listing_type text not null default 'sale',
  add column if not exists rental_period text null;

alter table public.villas
  drop constraint if exists villas_listing_type_check;

alter table public.villas
  add constraint villas_listing_type_check
  check (listing_type in ('sale', 'rent'));

create index if not exists villas_listing_type_idx
  on public.villas(listing_type);
