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
    has_pro boolean default false,
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
  start_date date,
  end_date date,
  date_ranges jsonb default '[]'::jsonb, -- e.g., [{"start": "2026-07-10", "end": "2026-07-15"}]
  budget_min integer not null check (budget_min >= 0),
  budget_max integer not null check (budget_max >= budget_min),
  preferred_tags text[] not null default '{}',
  tags text[] not null default '{}',
  dealbreakers text[] default '{}',
  is_flexible boolean default true,
  submitted_at timestamptz default now() not null,
  unique(group_id, user_id)
);

-- 5. Trip Options (Generated or Proposed Options)
create table if not exists public.trip_options (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade not null,
  name text not null,
  title text, -- Alias for code queries
  destination_type text not null,
  destination text, -- Alias for code queries
  date_start date not null,
  start_date date, -- Alias for code queries
  date_end date not null check (date_end >= date_start),
  end_date date, -- Alias for code queries
  budget_per_person integer not null check (budget_per_person >= 0),
  price_per_person integer, -- Alias for code queries
  tags text[] not null default '{}',
  description text,
  score jsonb, -- Cached consensus score result
  created_at timestamptz default now() not null
);

-- 6. Votes (Silent Voting - individual votes are NEVER exposed in reader queries)
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references public.groups(id) on delete cascade,
  option_id uuid references public.trip_options(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  approved boolean default true not null,
  voted_at timestamptz default now() not null,
  unique(option_id, user_id)
);
create index if not exists idx_votes_group_id on public.votes(group_id);

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

-- Archive circles migration
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_groups_archived ON public.groups(archived);

-- ============================================================================
-- AUDIT REMEDIATIONS & ENHANCED PRIVACY RPCs (2026-09-07)
-- ============================================================================

-- 1. Secure Join-by-Code Lookup (Bypasses Member-Only RLS for Preview)
create or replace function public.lookup_group_by_invite_code(p_invite_code text)
returns table (
  id uuid,
  name text,
  invite_code text,
  organizer_id uuid,
  organizer_name text,
  status text,
  member_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group record;
begin
  select g.id, g.name, g.invite_code, g.organizer_id, g.status
  into v_group
  from public.groups g
  where upper(g.invite_code) = upper(trim(p_invite_code))
  limit 1;

  if not found then
    return;
  end if;

  return query
  select
    v_group.id,
    v_group.name,
    v_group.invite_code,
    v_group.organizer_id,
    coalesce(p.display_name, 'Organizer') as organizer_name,
    v_group.status,
    coalesce((select count(*) from public.group_members gm where gm.group_id = v_group.id), 0::bigint) as member_count
  from (select 1) _
  left join public.profiles p on p.id = v_group.organizer_id;
end;
$$;

grant execute on function public.lookup_group_by_invite_code(text) to authenticated;
grant execute on function public.lookup_group_by_invite_code(text) to anon;

-- 2. Privacy-Preserving Group Consensus Snapshot RPC
create or replace function public.get_group_consensus_snapshot(p_group_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_id uuid := auth.uid();
  v_is_member boolean;
  v_total_members bigint;
  v_responded_count bigint;
  v_options jsonb;
  v_winning_option_id uuid := null;
  v_max_score numeric := -1;
  v_unanimous boolean := false;
  v_deadlock boolean := false;
begin
  select exists (
    select 1 from public.group_members where group_id = p_group_id and user_id = v_caller_id
  ) or exists (
    select 1 from public.groups where id = p_group_id and organizer_id = v_caller_id
  ) into v_is_member;

  if not v_is_member then
    raise exception 'Unauthorized: Caller is not a member of this circle';
  end if;

  select count(*) into v_total_members from public.group_members where group_id = p_group_id;
  select count(*) into v_responded_count from public.preferences where group_id = p_group_id;

  select jsonb_agg(opt_row) into v_options from (
    select
      o.id as option_id,
      coalesce(o.title, o.name) as title,
      coalesce(o.destination, o.destination_type) as destination,
      coalesce(o.price_per_person, o.budget_per_person) as price_per_person,
      o.start_date,
      o.end_date,
      o.tags,
      coalesce(v.total_votes, 0) as total_votes,
      coalesce(v.approved_votes, 0) as approved_votes,
      coalesce(v.veto_votes, 0) as veto_votes,
      case
        when v_responded_count = 0 then 50
        else least(100, greatest(0, round(
          (
            (select coalesce(avg(
              case
                when coalesce(o.price_per_person, o.budget_per_person) <= pr.budget_max then 1.0
                when coalesce(o.price_per_person, o.budget_per_person) <= pr.budget_max * 1.2 then 0.6
                else 0.2
              end
            ), 0.5) from public.preferences pr where pr.group_id = p_group_id) * 35
            +
            (select coalesce(avg(
              case
                when pr.preferred_tags && o.tags then 1.0
                else 0.3
              end
            ), 0.5) from public.preferences pr where pr.group_id = p_group_id) * 25
            +
            (select coalesce(avg(
              case
                when pr.start_date is null or pr.end_date is null then 0.7
                when o.start_date <= pr.end_date and o.end_date >= pr.start_date then 1.0
                else 0.3
              end
            ), 0.7) from public.preferences pr where pr.group_id = p_group_id) * 35
            +
            case when coalesce(v.approved_votes, 0) >= v_total_members then 5 else 0 end
          )::numeric, 1
        )))
      end as consensus_score
    from public.trip_options o
    left join (
      select
        option_id,
        count(*) as total_votes,
        count(*) filter (where approved = true) as approved_votes,
        count(*) filter (where approved = false) as veto_votes
      from public.votes
      group by option_id
    ) v on v.option_id = o.id
    where o.group_id = p_group_id
    order by consensus_score desc
  ) opt_row;

  if v_options is not null and jsonb_array_length(v_options) > 0 then
    v_winning_option_id := (v_options->0->>'option_id')::uuid;
    v_max_score := (v_options->0->>'consensus_score')::numeric;
    v_unanimous := ((v_options->0->>'approved_votes')::bigint >= v_total_members and v_total_members > 0);
    v_deadlock := ((v_options->0->>'veto_votes')::bigint > 0 and (v_options->0->>'approved_votes')::bigint < (v_total_members * 0.7));
  end if;

  return jsonb_build_object(
    'group_id', p_group_id,
    'total_members_count', v_total_members,
    'responded_members_count', v_responded_count,
    'is_consensus_unlocked', (v_responded_count >= 3 or v_responded_count >= v_total_members),
    'winning_option_id', v_winning_option_id,
    'highest_score', v_max_score,
    'is_unanimous', v_unanimous,
    'is_deadlock', v_deadlock,
    'options', coalesce(v_options, '[]'::jsonb)
  );
end;
$$;

grant execute on function public.get_group_consensus_snapshot(uuid) to authenticated;

-- 3. Enhanced Silent Voting Function & Grant
create or replace function public.get_option_vote_count(p_option_id uuid)
returns table(total_votes bigint, approved_votes bigint, veto_votes bigint)
language sql security definer as $$
  select
    count(*) as total_votes,
    count(*) filter (where approved = true) as approved_votes,
    count(*) filter (where approved = false) as veto_votes
  from public.votes
  where option_id = p_option_id;
$$;

grant execute on function public.get_option_vote_count(uuid) to authenticated;

-- 4. Group Lifecycle DELETE Policies
create policy "Members can leave groups"
  on public.group_members for delete
  to authenticated
  using (user_id = auth.uid());

create policy "Organizers can remove group members"
  on public.group_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.groups
      where groups.id = group_members.group_id
      and groups.organizer_id = auth.uid()
    )
  );

create policy "Organizers can delete groups"
  on public.groups for delete
  to authenticated
  using (organizer_id = auth.uid());

-- 5. Member Cap Trigger (MAX=10)
create or replace function public.check_group_member_limit()
returns trigger language plpgsql as $$
begin
  if (select count(*) from public.group_members where group_id = NEW.group_id) >= 10 then
    raise exception 'Group has reached maximum capacity of 10 members';
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_check_group_member_limit on public.group_members;
create trigger trg_check_group_member_limit
before insert on public.group_members
for each row execute function public.check_group_member_limit();

-- 6. Safe Profiles Insert
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);
