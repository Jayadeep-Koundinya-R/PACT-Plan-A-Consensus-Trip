-- ============================================================================
-- PACT V2 Migration: Circle Chat & Archived Chat Log
-- ============================================================================

-- 1. Add chat_log_archived to trip_briefs
alter table if exists public.trip_briefs
  add column if not exists chat_log_archived boolean not null default false;

-- 2. Create circle_messages table
create table if not exists public.circle_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  user_display_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists circle_messages_group_id_idx
  on public.circle_messages(group_id, created_at);

alter table public.circle_messages enable row level security;

-- ============================================================================
-- IMPORTANT PRIVACY/SECURITY NOTE:
-- Unlike preferences and votes which are strictly private-by-default (own-row only),
-- circle_messages is the ONE deliberate exception where all verified members of a circle
-- can read all messages within that circle. This is intentional for collaborative trip chat.
-- Do NOT restrict this policy to author-only; and do NOT use this as a precedent for
-- relaxing preferences/votes privacy.
-- ============================================================================

drop policy if exists "Circle members can read all messages in their circle" on public.circle_messages;
create policy "Circle members can read all messages in their circle"
  on public.circle_messages for select
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = circle_messages.group_id
      and group_members.user_id = auth.uid()
    )
  );

drop policy if exists "Circle members can send messages in their circle" on public.circle_messages;
create policy "Circle members can send messages in their circle"
  on public.circle_messages for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.group_members
      where group_members.group_id = circle_messages.group_id
      and group_members.user_id = auth.uid()
    )
  );
