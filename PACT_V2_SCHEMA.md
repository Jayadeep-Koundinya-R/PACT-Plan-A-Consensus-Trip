# PACT V2 — Schema Additions

Only new/changed tables. Existing schema (groups, preferences, votes, trip_briefs, etc.) is unchanged.

```sql
-- 1. Raise capacity
alter table public.groups
  alter column max_members set default 20;
-- Update any CHECK constraint or application-level cap from 10 to 20

-- 2. Circle chat messages
create table public.circle_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  user_display_name text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index circle_messages_group_id_idx on public.circle_messages(group_id, created_at);

alter table public.circle_messages enable row level security;

-- Unlike preferences/votes, chat is visible to the WHOLE circle, not just the author
create policy "Circle members can read all messages in their circle"
  on public.circle_messages for select
  using (
    exists (
      select 1 from public.group_members
      where group_members.group_id = circle_messages.group_id
      and group_members.user_id = auth.uid()
    )
  );

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

-- 3. Archived chat log reference in Memory Library (on finalize)
alter table public.trip_briefs
  add column chat_log_archived boolean not null default false;

-- 4. Place recommendation cache (avoid re-calling Google Places API repeatedly)
create table public.place_recommendations_cache (
  id uuid primary key default gen_random_uuid(),
  destination text not null unique,
  places_json jsonb not null,
  ai_summary text,
  safety_note text,
  fetched_at timestamptz not null default now()
);
-- No RLS needed — this is non-sensitive, non-user-specific cached public data.
-- Consider a simple fetched_at > now() - interval '30 days' staleness check before reuse.
```

**Important RLS note:** `circle_messages` is the one deliberate exception to PACT's "private by default" model — chat is meant to be visible to the whole circle, unlike preferences and votes. Make sure this distinction is documented clearly in code comments so a future security pass doesn't "fix" it by accidentally locking chat down to sender-only (which would break the feature) or, in the other direction, doesn't get treated as a template for loosening the real privacy-critical tables.
