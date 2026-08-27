-- ============================================================================
-- PACT — Plan A Consensus Trip
-- Supabase PostgreSQL Schema & Row Level Security (RLS) Policies
-- Shipathon 2026 (RevenueCat) — Next Gen Award
-- ============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (Extends Supabase Auth users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Groups (Circles)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null, -- e.g., "GOA-2026"
  organizer_id uuid references public.profiles(id) on delete set null,
  status text default 'collecting' check (status in ('collecting', 'voting', 'finalized', 'cancelled')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Group Members
create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'joined', 'left')),
  role text default 'member' check (role in ('member', 'organizer')),
  joined_at timestamptz default now() not null,
  unique(group_id, user_id)
);

-- 4. Preferences (Private per member per group)
create table if not exists public.preferences (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date_ranges jsonb not null, -- e.g., [{"start": "2026-07-10", "end": "2026-07-15"}]
  budget_min integer not null check (budget_min >= 0),
  budget_max integer not null check (budget_max >= budget_min),
  tags text[] not null default '{}',
  dealbreakers text[] default '{}',
  submitted_at timestamptz default now() not null,
  unique(group_id, user_id)
);

-- 5. Trip Options (Generated or Proposed Options)
create table if not exists public.trip_options (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  name text not null,
  destination_type text not null,
  date_start date not null,
  date_end date not null check (date_end >= date_start),
  budget_per_person integer not null check (budget_per_person >= 0),
  tags text[] not null default '{}',
  description text,
  score jsonb, -- Cached consensus score result
  created_at timestamptz default now() not null
);

-- 6. Votes (Silent Voting - individual votes are NEVER exposed in reader queries)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  option_id uuid references public.trip_options(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  approved boolean default true not null,
  voted_at timestamptz default now() not null,
  unique(option_id, user_id)
);

-- 7. Trip Briefs (Generated when consensus is reached/finalized)
create table if not exists public.trip_briefs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  option_id uuid references public.trip_options(id) on delete set null,
  brief_data jsonb not null,
  generated_at timestamptz default now() not null
);

-- 8. Subscriptions (RevenueCat Webhook & Entitlement sync)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  revenuecat_customer_id text,
  plan text default 'free' check (plan in ('free', 'premium_monthly', 'premium_annual')),
  expires_at timestamptz,
  created_at timestamptz default now() not null
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.preferences enable row level security;
alter table public.trip_options enable row level security;
alter table public.votes enable row level security;
alter table public.trip_briefs enable row level security;
alter table public.subscriptions enable row level security;

-- Profiles: Anyone authenticated can view; only self can update
create policy "Profiles viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Groups: Members can view groups they belong to
create policy "Group members can view their group"
  on public.groups for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = groups.id
      and group_members.user_id = auth.uid()
    )
    or organizer_id = auth.uid()
  );

create policy "Users can create new groups"
  on public.groups for insert
  to authenticated
  with check (organizer_id = auth.uid());

create policy "Organizers can update group status"
  on public.groups for update
  to authenticated
  using (organizer_id = auth.uid());

-- Group Members: Members can view fellow members in same group
create policy "Members can view other members in group"
  on public.group_members for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
      and gm.user_id = auth.uid()
    )
  );

create policy "Users can join groups"
  on public.group_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- Preferences: CRITICAL PRIVACY RULE - Members can ONLY read and write their own preferences
create policy "Users can view only their own preferences"
  on public.preferences for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own preferences"
  on public.preferences for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own preferences"
  on public.preferences for update
  to authenticated
  using (user_id = auth.uid());

-- Trip Options: Visible to all members in the group
create policy "Group members can view trip options"
  on public.trip_options for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = trip_options.group_id
      and group_members.user_id = auth.uid()
    )
  );

create policy "Organizers can manage trip options"
  on public.trip_options for all
  to authenticated
  using (
    exists (
      select 1 from public.groups
      where groups.id = trip_options.group_id
      and groups.organizer_id = auth.uid()
    )
  );

-- Votes: PRIVACY RULE - Insert/Update own vote only. Individual votes NOT selectable directly by peers.
create policy "Users can insert own vote"
  on public.votes for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own vote"
  on public.votes for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can view own vote"
  on public.votes for select
  to authenticated
  using (user_id = auth.uid());

-- Secure aggregate function for silent voting (only returns count, never individual identities)
create or replace function get_option_vote_count(p_option_id uuid)
returns table(total_votes bigint, approved_votes bigint)
language sql security definer as $$
  select
    count(*) as total_votes,
    count(*) filter (where approved = true) as approved_votes
  from public.votes
  where option_id = p_option_id;
$$;

-- Trip Briefs: Visible to all group members
create policy "Group members can view trip briefs"
  on public.trip_briefs for select
  to authenticated
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = trip_briefs.group_id
      and group_members.user_id = auth.uid()
    )
  );

-- Subscriptions: User can view their own subscription
create policy "Users can view own subscription"
  on public.subscriptions for select
  to authenticated
  using (user_id = auth.uid());
