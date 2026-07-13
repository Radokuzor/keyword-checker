-- Run this in your Supabase SQL editor
create table if not exists tracked_urls (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  url text not null,
  created_at timestamptz default now(),
  unique(email, url)
);

create index if not exists tracked_urls_email_idx on tracked_urls(email);

create table if not exists tracked_keywords (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  keyword text not null,
  created_at timestamptz default now(),
  unique(email, keyword)
);

create index if not exists tracked_keywords_email_idx on tracked_keywords(email);
