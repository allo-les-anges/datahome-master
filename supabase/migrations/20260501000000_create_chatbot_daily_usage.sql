create table if not exists public.chatbot_daily_usage (
  agency_id uuid not null,
  usage_date date not null,
  usage_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (agency_id, usage_date)
);

create index if not exists chatbot_daily_usage_usage_date_idx
  on public.chatbot_daily_usage (usage_date);
