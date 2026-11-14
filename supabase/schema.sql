-- ============================================================================
-- Prompt Craftsman - Step 4: Multi-User Workspace & Encrypted BYOK Schema
-- Database: Supabase (PostgreSQL 15+)
-- ============================================================================

create extension if not exists "pgcrypto";

-- 1. Tabel Penyimpanan Master Prompt per User
create table if not exists public.user_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 140),
  short_prompt text not null default '',
  layers jsonb not null default '{}'::jsonb,
  variables jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_prompts_user_id_updated
  on public.user_prompts (user_id, updated_at desc);

-- 2. Tabel Kredensial / Koneksi AI Milik User Sendiri (BYOK - Terenkripsi AES-256-GCM)
create table if not exists public.user_ai_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  provider text not null check (provider in ('gemini', 'anthropic', 'openai', 'openrouter', 'custom')),
  model text not null check (char_length(trim(model)) between 1 and 160),
  base_url text,
  encrypted_api_key text not null,
  key_hint text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_ai_connections_user_id
  on public.user_ai_connections (user_id);

-- 3. Trigger otomatis updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_prompts_updated_at on public.user_prompts;
create trigger trg_user_prompts_updated_at
  before update on public.user_prompts
  for each row execute function public.set_updated_at();

drop trigger if exists trg_user_ai_connections_updated_at on public.user_ai_connections;
create trigger trg_user_ai_connections_updated_at
  before update on public.user_ai_connections
  for each row execute function public.set_updated_at();

-- 4. Row-Level Security (RLS) agar data antar-user terisolasi ketat
alter table public.user_prompts enable row level security;
alter table public.user_ai_connections enable row level security;

-- Kebijakan akses user_prompts (hanya pemilik akun)
drop policy if exists "Users can view own prompts" on public.user_prompts;
create policy "Users can view own prompts"
  on public.user_prompts for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own prompts" on public.user_prompts;
create policy "Users can insert own prompts"
  on public.user_prompts for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own prompts" on public.user_prompts;
create policy "Users can update own prompts"
  on public.user_prompts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own prompts" on public.user_prompts;
create policy "Users can delete own prompts"
  on public.user_prompts for delete
  using (auth.uid() = user_id);

-- Kebijakan akses user_ai_connections (hanya pemilik akun)
drop policy if exists "Users can view own AI connection" on public.user_ai_connections;
create policy "Users can view own AI connection"
  on public.user_ai_connections for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own AI connection" on public.user_ai_connections;
create policy "Users can insert own AI connection"
  on public.user_ai_connections for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own AI connection" on public.user_ai_connections;
create policy "Users can update own AI connection"
  on public.user_ai_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own AI connection" on public.user_ai_connections;
create policy "Users can delete own AI connection"
  on public.user_ai_connections for delete
  using (auth.uid() = user_id);
