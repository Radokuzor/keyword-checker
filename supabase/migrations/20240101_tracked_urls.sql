-- Run this in your Supabase SQL editor
create table if not exists tracked_urls (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  url text not null,
  created_at timestamptz default now(),
  unique(email, url)
);

create index if not exists tracked_urls_email_idx on tracked_urls(email);
