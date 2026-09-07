-- ============================================================================
-- PACT — Backend Audit Security & Performance Fixes
-- Remediation for Issues 1, 3, 4, 5, 6, 9
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. [CRITICAL 3] Secure Join-by-Code Lookup (Bypasses Member-Only RLS for Preview)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 2. [CRITICAL 1] Privacy-Preserving Group Consensus Snapshot RPC
-- Calculates aggregate consensus across all locked member preferences inside
-- PostgreSQL without exposing individual private budgets, dates, or dealbreakers.
-- ----------------------------------------------------------------------------
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
  -- Verification: Caller must be a member or organizer of this circle
  select exists (
    select 1 from public.group_members where group_id = p_group_id and user_id = v_caller_id
  ) or exists (
    select 1 from public.groups where id = p_group_id and organizer_id = v_caller_id
  ) into v_is_member;

  if not v_is_member then
    raise exception 'Unauthorized: Caller is not a member of this circle';
  end if;

  -- Member response metrics
  select count(*) into v_total_members from public.group_members where group_id = p_group_id;
  select count(*) into v_responded_count from public.preferences where group_id = p_group_id;

  -- Compute aggregated options with aggregate scoring metrics
  select jsonb_agg(opt_row) into v_options from (
    select
      o.id as option_id,
      coalesce(o.title, o.name) as title,
      coalesce(o.destination, o.destination_type) as destination,
      coalesce(o.price_per_person, o.budget_per_person) as price_per_person,
      o.start_date,
      o.end_date,
      o.tags,
      -- Aggregate Silent Votes
      coalesce(v.total_votes, 0) as total_votes,
      coalesce(v.approved_votes, 0) as approved_votes,
      coalesce(v.veto_votes, 0) as veto_votes,
      -- Aggregate Consensus Score (0 to 100)
      case
        when v_responded_count = 0 then 50
        else least(100, greatest(0, round(
          (
            -- Budget fit component (35%)
            (select coalesce(avg(
              case
                when coalesce(o.price_per_person, o.budget_per_person) <= pr.budget_max then 1.0
                when coalesce(o.price_per_person, o.budget_per_person) <= pr.budget_max * 1.2 then 0.6
                else 0.2
              end
            ), 0.5) from public.preferences pr where pr.group_id = p_group_id) * 35
            +
            -- Tag fit component (25%)
            (select coalesce(avg(
              case
                when pr.preferred_tags && o.tags then 1.0
                else 0.3
              end
            ), 0.5) from public.preferences pr where pr.group_id = p_group_id) * 25
            +
            -- Date overlap component (35%)
            (select coalesce(avg(
              case
                when pr.start_date is null or pr.end_date is null then 0.7
                when o.start_date <= pr.end_date and o.end_date >= pr.start_date then 1.0
                else 0.3
              end
            ), 0.7) from public.preferences pr where pr.group_id = p_group_id) * 35
            +
            -- Silent ballot approval bonus (5%)
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

  -- Determine winner and unanimity
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

-- ----------------------------------------------------------------------------
-- 3. [CRITICAL 4] Silent Voting Permissions & Enhanced Aggregate Function
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 4. [MEDIUM 6] Missing DELETE & INSERT Policies for Group Lifecycle
-- ----------------------------------------------------------------------------
-- Members can leave group
drop policy if exists "Members can leave groups" on public.group_members;
create policy "Members can leave groups"
  on public.group_members for delete
  to authenticated
  using (user_id = auth.uid());

-- Organizers can remove members
drop policy if exists "Organizers can remove group members" on public.group_members;
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

-- Organizers can delete group
drop policy if exists "Organizers can delete groups" on public.groups;
create policy "Organizers can delete groups"
  on public.groups for delete
  to authenticated
  using (organizer_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5. [MEDIUM 9] Database-Enforced Member Cap Trigger (MAX=10)
-- ----------------------------------------------------------------------------
create or replace function public.check_group_member_limit()
returns trigger
language plpgsql as $$
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

-- ----------------------------------------------------------------------------
-- 6. [MEDIUM 5] PII Protection: Profiles Safe Insert Policy
-- ----------------------------------------------------------------------------
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);
