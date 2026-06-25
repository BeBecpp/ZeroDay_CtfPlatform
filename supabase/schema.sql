
-- ZeroDay Arena safe patch / full schema check
-- Run this in Supabase SQL Editor.
-- Safe to re-run.

create extension if not exists pgcrypto;

-- Teams
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Challenges
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  points integer not null,
  difficulty text not null,
  description text not null,
  url text,
  file_url text,
  file_path text,
  flag_hash text not null,
  visible boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Safe migration for existing databases
alter table challenges add column if not exists file_path text;

-- Submissions
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  challenge_id uuid references challenges(id) on delete cascade,
  submitted_flag text not null,
  correct boolean not null default false,
  created_at timestamptz default now()
);

-- Solves
create table if not exists solves (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  challenge_id uuid references challenges(id) on delete cascade,
  points integer not null,
  solved_at timestamptz default now(),
  unique (team_id, challenge_id)
);

-- Event Settings
create table if not exists event_settings (
  id integer primary key default 1,
  event_name text not null default 'ZeroDay Arena: Friendly Duel #01',
  start_time timestamptz,
  end_time timestamptz,
  scoreboard_frozen boolean default false,
  constraint event_settings_single_row check (id = 1)
);

insert into event_settings (id, event_name)
values (1, 'ZeroDay Arena: Friendly Duel #01')
on conflict (id) do nothing;

-- Indexes
create index if not exists idx_submissions_team_id on submissions(team_id);
create index if not exists idx_submissions_challenge_id on submissions(challenge_id);
create index if not exists idx_submissions_created_at on submissions(created_at desc);

create index if not exists idx_solves_team_id on solves(team_id);
create index if not exists idx_solves_challenge_id on solves(challenge_id);
create index if not exists idx_solves_solved_at on solves(solved_at desc);

create index if not exists idx_challenges_visible on challenges(visible);
create index if not exists idx_challenges_slug on challenges(slug);
create index if not exists idx_challenges_sort_order on challenges(sort_order);
create index if not exists idx_challenges_file_path on challenges(file_path);

create index if not exists idx_teams_code on teams(code);

-- updated_at trigger for challenges
create or replace function update_challenges_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists challenges_updated_at on challenges;

create trigger challenges_updated_at
  before update on challenges
  for each row
  execute function update_challenges_updated_at();

-- Supabase Storage bucket for challenge uploads
-- This creates a PRIVATE bucket named challenge-files.
insert into storage.buckets (id, name, public)
values ('challenge-files', 'challenge-files', false)
on conflict (id) do update
set public = false;

-- Make sure bucket stays private if it already existed
update storage.buckets
set public = false
where id = 'challenge-files';

-- Notes:
-- 1. Do not make challenge-files public.
-- 2. The app should generate signed upload/download URLs server-side.
-- 3. The service role key must only be used in server-side API routes.
```
```sql
-- ZeroDay Arena safe patch / full schema check
-- Run this in Supabase SQL Editor.
-- Safe to re-run.

create extension if not exists pgcrypto;

-- Teams
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Challenges
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null,
  points integer not null,
  difficulty text not null,
  description text not null,
  url text,
  file_url text,
  file_path text,
  flag_hash text not null,
  visible boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Safe migration for existing databases
alter table challenges add column if not exists file_path text;

-- Submissions
create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  challenge_id uuid references challenges(id) on delete cascade,
  submitted_flag text not null,
  correct boolean not null default false,
  created_at timestamptz default now()
);

-- Solves
create table if not exists solves (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  challenge_id uuid references challenges(id) on delete cascade,
  points integer not null,
  solved_at timestamptz default now(),
  unique (team_id, challenge_id)
);

-- Event Settings
create table if not exists event_settings (
  id integer primary key default 1,
  event_name text not null default 'ZeroDay Arena: Friendly Duel #01',
  start_time timestamptz,
  end_time timestamptz,
  scoreboard_frozen boolean default false,
  constraint event_settings_single_row check (id = 1)
);

insert into event_settings (id, event_name)
values (1, 'ZeroDay Arena: Friendly Duel #01')
on conflict (id) do nothing;

-- Indexes
create index if not exists idx_submissions_team_id on submissions(team_id);
create index if not exists idx_submissions_challenge_id on submissions(challenge_id);
create index if not exists idx_submissions_created_at on submissions(created_at desc);

create index if not exists idx_solves_team_id on solves(team_id);
create index if not exists idx_solves_challenge_id on solves(challenge_id);
create index if not exists idx_solves_solved_at on solves(solved_at desc);

create index if not exists idx_challenges_visible on challenges(visible);
create index if not exists idx_challenges_slug on challenges(slug);
create index if not exists idx_challenges_sort_order on challenges(sort_order);
create index if not exists idx_challenges_file_path on challenges(file_path);

create index if not exists idx_teams_code on teams(code);

-- updated_at trigger for challenges
create or replace function update_challenges_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists challenges_updated_at on challenges;

create trigger challenges_updated_at
  before update on challenges
  for each row
  execute function update_challenges_updated_at();

-- Supabase Storage bucket for challenge uploads
-- This creates a PRIVATE bucket named challenge-files.
insert into storage.buckets (id, name, public)
values ('challenge-files', 'challenge-files', false)
on conflict (id) do update
set public = false;

-- Make sure bucket stays private if it already existed
update storage.buckets
set public = false
where id = 'challenge-files';

-- Notes:
-- 1. Do not make challenge-files public.
-- 2. The app should generate signed upload/download URLs server-side.
-- 3. The service role key must only be used in server-side API routes.

