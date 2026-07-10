-- Inquiries table - run once in the Supabase SQL editor (or via CLI migration).
-- Captures every public intent: facility bookings, service hires,
-- membership applications (the waitlist), and event RSVPs.

create table if not exists inquiries (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('facility', 'service', 'membership', 'event')),
  item text not null,
  offering text,
  name text not null,
  email text not null,
  phone text,
  socials text,
  portfolio text,
  references_available text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- The API writes with the secret (service role) key; keep the table locked
-- to anonymous/authenticated clients.
alter table inquiries enable row level security;

create index if not exists inquiries_kind_status_idx on inquiries (kind, status);
create index if not exists inquiries_created_at_idx on inquiries (created_at desc);
