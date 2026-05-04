alter table public.agency_settings
  add column if not exists trial_reminder_sent_at timestamptz;

