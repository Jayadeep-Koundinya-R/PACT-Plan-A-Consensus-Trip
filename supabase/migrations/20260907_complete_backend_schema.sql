-- ============================================================================
-- PACT — Complete Backend Schema Migration
-- Adds missing tables: trip_briefs, subscriptions, trip_memories, vault_documents
-- Enables Row Level Security (RLS) and creates indexes
-- ============================================================================

-- 1. Trip Briefs Table
create table if not exists public.trip_briefs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  option_id uuid references public.trip_options(id) on delete set null,
  brief_data jsonb not null,
  generated_at timestamptz default now() not null
);

create index if not exists idx_trip_briefs_group_id on public.trip_briefs(group_id);

alter table public.trip_briefs enable row level security;

create policy "Group members can view trip briefs"
  on public.trip_briefs for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = trip_briefs.group_id
      and group_members.user_id = auth.uid()
    )
    or exists (
      select 1 from public.groups
      where groups.id = trip_briefs.group_id
      and groups.organizer_id = auth.uid()
    )
  );

create policy "Organizers can insert trip briefs"
  on public.trip_briefs for insert
  to authenticated
  with check (
    exists (
      select 1 from public.groups
      where groups.id = trip_briefs.group_id
      and groups.organizer_id = auth.uid()
    )
  );

-- 2. Subscriptions Table (RevenueCat sync)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  revenuecat_customer_id text,
  plan text default 'free' check (plan in ('free', 'premium_monthly', 'premium_annual')),
  expires_at timestamptz,
  created_at timestamptz default now() not null
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can update own subscription"
  on public.subscriptions for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert own subscription"
  on public.subscriptions for insert
  to authenticated
  with check (user_id = auth.uid());

-- 3. Trip Memories Table
create table if not exists public.trip_memories (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  photo_url text not null,
  author_name text not null,
  caption text,
  created_at timestamptz default now() not null
);

create index if not exists idx_trip_memories_group_id on public.trip_memories(group_id);

alter table public.trip_memories enable row level security;

create policy "Group members can view memories"
  on public.trip_memories for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = trip_memories.group_id
      and group_members.user_id = auth.uid()
    )
    or exists (
      select 1 from public.groups
      where groups.id = trip_memories.group_id
      and groups.organizer_id = auth.uid()
    )
  );

create policy "Group members can insert memories"
  on public.trip_memories for insert
  to authenticated
  with check (
    exists (
      select 1 from public.group_members
      where group_members.group_id = trip_memories.group_id
      and group_members.user_id = auth.uid()
    )
    or exists (
      select 1 from public.groups
      where groups.id = trip_memories.group_id
      and groups.organizer_id = auth.uid()
    )
  );

-- 4. Vault Documents Table
create table if not exists public.vault_documents (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete set null,
  name text not null,
  meta text,
  doc_type text default 'other' check (doc_type in ('flight', 'transfer', 'villa', 'ticket', 'other')),
  section text default 'Bookings',
  file_url text,
  created_at timestamptz default now() not null
);

create index if not exists idx_vault_documents_group_id on public.vault_documents(group_id);

alter table public.vault_documents enable row level security;

create policy "Group members can view vault documents"
  on public.vault_documents for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = vault_documents.group_id
      and group_members.user_id = auth.uid()
    )
    or exists (
      select 1 from public.groups
      where groups.id = vault_documents.group_id
      and groups.organizer_id = auth.uid()
    )
  );

create policy "Group members can insert vault documents"
  on public.vault_documents for insert
  to authenticated
  with check (
    exists (
      select 1 from public.group_members
      where group_members.group_id = vault_documents.group_id
      and group_members.user_id = auth.uid()
    )
    or exists (
      select 1 from public.groups
      where groups.id = vault_documents.group_id
      and groups.organizer_id = auth.uid()
    )
  );
