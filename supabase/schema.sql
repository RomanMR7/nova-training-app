-- Anchor Pay training simulator schema for Supabase Free.
-- Run in Supabase SQL editor after creating the project.
-- Uses Supabase Auth for passwords; this app does not store plaintext passwords.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'training_role') then
    create type training_role as enum (
      'admin',
      'teamlead_manager',
      'trader_manager',
      'trader',
      'merchant',
      'merchant_manager',
      'head_support',
      'support'
    );
  end if;
end $$;

do $$
begin
  alter type training_role add value if not exists 'teamlead_manager';
  alter type training_role add value if not exists 'trader_manager';
  alter type training_role add value if not exists 'merchant_manager';
  alter type training_role add value if not exists 'head_support';
end $$;

create table if not exists public.training_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text not null unique,
  password_hash text,
  display_name text not null,
  role training_role not null default 'support',
  is_active boolean not null default true,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.training_users.password_hash is
  'Reserved for migrations only. Anchor Pay uses Supabase Auth; do not store plaintext passwords here.';

create table if not exists public.training_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.training_users(id) on delete cascade,
  role training_role not null,
  completed_modules text[] not null default '{}',
  completed_simulations text[] not null default '{}',
  quiz_scores jsonb not null default '{}'::jsonb,
  final_quiz_status text not null default 'not_started'
    check (final_quiz_status in ('not_started', 'passed', 'failed')),
  final_quiz_score integer not null default 0
    check (final_quiz_score >= 0 and final_quiz_score <= 100),
  last_activity_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_training_users_updated_at on public.training_users;
create trigger set_training_users_updated_at
before update on public.training_users
for each row execute function public.set_updated_at();

drop trigger if exists set_training_progress_updated_at on public.training_progress;
create trigger set_training_progress_updated_at
before update on public.training_progress
for each row execute function public.set_updated_at();

create or replace function public.is_training_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.training_users
    where auth_user_id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.current_training_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.training_users
  where auth_user_id = auth.uid()
    and is_active = true
  limit 1;
$$;

create or replace function public.can_access_training_role(target_role training_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.training_users
    where auth_user_id = auth.uid()
      and is_active = true
      and (role = 'admin' or role = target_role)
  );
$$;

alter table public.training_users enable row level security;
alter table public.training_progress enable row level security;

drop policy if exists "Users can read own profile" on public.training_users;
create policy "Users can read own profile"
on public.training_users
for select
to authenticated
using (auth_user_id = auth.uid() and is_active = true);

drop policy if exists "Admins can read all profiles" on public.training_users;
create policy "Admins can read all profiles"
on public.training_users
for select
to authenticated
using (public.is_training_admin());

drop policy if exists "Users can read own progress" on public.training_progress;
create policy "Users can read own progress"
on public.training_progress
for select
to authenticated
using (user_id = public.current_training_user_id());

drop policy if exists "Users can insert own progress" on public.training_progress;
create policy "Users can insert own progress"
on public.training_progress
for insert
to authenticated
with check (
  user_id = public.current_training_user_id()
  and public.can_access_training_role(role)
);

drop policy if exists "Users can update own progress" on public.training_progress;
create policy "Users can update own progress"
on public.training_progress
for update
to authenticated
using (
  user_id = public.current_training_user_id()
  and public.can_access_training_role(role)
)
with check (
  user_id = public.current_training_user_id()
  and public.can_access_training_role(role)
);

drop policy if exists "Admins can read all progress" on public.training_progress;
create policy "Admins can read all progress"
on public.training_progress
for select
to authenticated
using (public.is_training_admin());

-- Bootstrap:
-- 1. Create the first admin user in Supabase Authentication UI.
-- 2. Copy its auth.users id.
-- 3. Insert the matching profile:
--
-- insert into public.training_users (auth_user_id, email, display_name, role, is_active, note)
-- values ('00000000-0000-0000-0000-000000000000', 'admin@example.com', 'Anchor Pay Admin', 'admin', true, 'Initial bootstrap admin');
--
-- After that, use the Anchor Pay admin panel with a Vercel serverless route
-- configured with SUPABASE_SERVICE_ROLE_KEY to create employees.
