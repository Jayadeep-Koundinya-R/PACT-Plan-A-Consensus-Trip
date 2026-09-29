-- ============================================================================
-- PACT V2 Core Schema Migration (Shipathon 2026 Next Gen Track)
-- Implements exact schema defined in PACT_V2_SCHEMA.md
-- ============================================================================

-- 1. circles table
create table if not exists public.circles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  trip_type text default 'Vacation',
  currency_code text default 'USD' not null,
  status text default 'voting' check (status in ('voting', 'finalized', 'archived')),
  invite_code text unique not null,
  created_by uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_circles_created_by on public.circles(created_by);
create index if not exists idx_circles_invite_code on public.circles(invite_code);
create index if not exists idx_circles_status on public.circles(status);

alter table public.circles enable row level security;

-- 2. circle_members table
create table if not exists public.circle_members (
  circle_id uuid references public.circles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text default 'member' check (role in ('organizer', 'member')),
  joined_at timestamptz default now() not null,
  primary key (circle_id, user_id)
);

create index if not exists idx_circle_members_circle_id on public.circle_members(circle_id);
create index if not exists idx_circle_members_user_id on public.circle_members(user_id);

alter table public.circle_members enable row level security;

-- 3. messages table (Real-Time Chat)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references public.circles(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

create index if not exists idx_messages_circle_id on public.messages(circle_id);
create index if not exists idx_messages_created_at on public.messages(circle_id, created_at desc);

alter table public.messages enable row level security;

-- 4. memories table (Post-Trip Photo/Voice Vault)
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid references public.circles(id) on delete cascade not null,
  uploader_id uuid references auth.users(id) on delete cascade not null,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'voice')),
  created_at timestamptz default now() not null
);

create index if not exists idx_memories_circle_id on public.memories(circle_id);
create index if not exists idx_memories_uploader_id on public.memories(uploader_id);

alter table public.memories enable row level security;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Circles Policies
create policy "Circle members and creators can view circles"
  on public.circles for select
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.circle_members
      where circle_members.circle_id = circles.id
      and circle_members.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create circles"
  on public.circles for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Circle organizers can update circle details and status"
  on public.circles for update
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.circle_members
      where circle_members.circle_id = circles.id
      and circle_members.user_id = auth.uid()
      and circle_members.role = 'organizer'
    )
  );

-- Circle Members Policies
create policy "Members can view other members in the same circle"
  on public.circle_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.circle_members as cm
      where cm.circle_id = circle_members.circle_id
      and cm.user_id = auth.uid()
    )
    or exists (
      select 1 from public.circles
      where circles.id = circle_members.circle_id
      and circles.created_by = auth.uid()
    )
  );

create policy "Users can join circles"
  on public.circle_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.circles
      where circles.id = circle_members.circle_id
      and circles.created_by = auth.uid()
    )
  );

-- Messages Policies
create policy "Circle members can view messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = messages.circle_id
      and circle_members.user_id = auth.uid()
    )
    or exists (
      select 1 from public.circles
      where circles.id = messages.circle_id
      and circles.created_by = auth.uid()
    )
  );

create policy "Circle members can send messages"
  on public.messages for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      exists (
        select 1 from public.circle_members
        where circle_members.circle_id = messages.circle_id
        and circle_members.user_id = auth.uid()
      )
      or exists (
        select 1 from public.circles
        where circles.id = messages.circle_id
        and circles.created_by = auth.uid()
      )
    )
  );

-- Memories Policies
create policy "Circle members can view memories"
  on public.memories for select
  to authenticated
  using (
    exists (
      select 1 from public.circle_members
      where circle_members.circle_id = memories.circle_id
      and circle_members.user_id = auth.uid()
    )
    or exists (
      select 1 from public.circles
      where circles.id = memories.circle_id
      and circles.created_by = auth.uid()
    )
  );

create policy "Circle members can upload memories"
  on public.memories for insert
  to authenticated
  with check (
    uploader_id = auth.uid()
    and (
      exists (
        select 1 from public.circle_members
        where circle_members.circle_id = memories.circle_id
        and circle_members.user_id = auth.uid()
      )
      or exists (
        select 1 from public.circles
        where circles.id = memories.circle_id
        and circles.created_by = auth.uid()
      )
    )
  );
