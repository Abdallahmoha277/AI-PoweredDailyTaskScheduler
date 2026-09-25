-- =====================================================================
-- TaskFlow AI - Database Schema
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/jscubeezgegvoistwyke/sql/new
-- =====================================================================

-- 1. Enable UUID generation
create extension if not exists "pgcrypto";

-- 2. Create the tasks table
create table if not exists public.tasks (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users(id) on delete cascade not null,
  title               text not null,
  description         text,
  status              text not null default 'pending'
                        check (status in ('pending', 'in_progress', 'done')),
  priority            text not null default 'medium'
                        check (priority in ('low', 'medium', 'high')),
  estimated_duration  text not null default '30m',
  due_date            timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 3. Enable Row Level Security (RLS)
alter table public.tasks enable row level security;

-- 4. Drop existing policies if re-running this script
drop policy if exists "Users can view own tasks"   on public.tasks;
drop policy if exists "Users can insert own tasks" on public.tasks;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;

-- 5. Create RLS policies so each user only sees their own tasks
create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 6. Indexes for performance
create index if not exists tasks_user_id_idx  on public.tasks(user_id);
create index if not exists tasks_due_date_idx on public.tasks(due_date);
create index if not exists tasks_status_idx   on public.tasks(status);

-- 7. Auto-update the updated_at column on every UPDATE
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();