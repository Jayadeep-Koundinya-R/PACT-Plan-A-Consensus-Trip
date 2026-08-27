-- ============================================================================
-- GATHERLY — Demo Seed Data
-- Shipathon 2026 (RevenueCat) — College Friends Beach Trip Demo
-- ============================================================================

-- 1. Create Demo Profiles
insert into public.profiles (id, display_name, avatar_url) values
  ('00000000-0000-0000-0000-000000000001', 'Maya', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
  ('00000000-0000-0000-0000-000000000002', 'Jake', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
  ('00000000-0000-0000-0000-000000000003', 'Priya', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
  ('00000000-0000-0000-0000-000000000004', 'Alex', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'),
  ('00000000-0000-0000-0000-000000000005', 'Sam', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150')
on conflict (id) do nothing;

-- 2. Create Demo Group (Circle)
insert into public.groups (id, name, invite_code, organizer_id, status) values
  ('11111111-1111-1111-1111-111111111111', 'College Reunion Trip', 'GOA-2026', '00000000-0000-0000-0000-000000000001', 'collecting')
on conflict (id) do nothing;

-- 3. Add Members
insert into public.group_members (group_id, user_id, status, role) values
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'joined', 'organizer'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'joined', 'member'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000003', 'joined', 'member'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000004', 'joined', 'member'),
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000005', 'joined', 'member')
on conflict (group_id, user_id) do nothing;

-- 4. Submit Member Preferences (Private)
insert into public.preferences (group_id, user_id, date_ranges, budget_min, budget_max, tags, dealbreakers) values
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000001',
    '[{"start": "2026-07-10", "end": "2026-07-15"}, {"start": "2026-07-25", "end": "2026-07-30"}]'::jsonb,
    400, 900,
    array['beach', 'relaxed'],
    array['hiking', 'cold']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000002',
    '[{"start": "2026-07-12", "end": "2026-07-20"}, {"start": "2026-08-01", "end": "2026-08-10"}]'::jsonb,
    1000, 2500,
    array['active', 'beach', 'hiking'],
    array['city']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000003',
    '[{"start": "2026-07-08", "end": "2026-07-14"}]'::jsonb,
    300, 700,
    array['budget-conscious', 'relaxed', 'beach'],
    array['expensive']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000004',
    '[{"start": "2026-07-10", "end": "2026-07-25"}]'::jsonb,
    800, 2000,
    array['city', 'culture', 'active'],
    array['isolated']
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000005',
    '[{"start": "2026-07-15", "end": "2026-07-28"}, {"start": "2026-08-05", "end": "2026-08-15"}]'::jsonb,
    600, 1500,
    array['beach', 'active', 'budget-conscious'],
    array[]::text[]
  )
on conflict (group_id, user_id) do nothing;

-- 5. Candidate Trip Options
insert into public.trip_options (id, group_id, name, destination_type, date_start, date_end, budget_per_person, tags, description) values
  (
    '22222222-2222-2222-2222-222222222201',
    '11111111-1111-1111-1111-111111111111',
    'Goa Beach Weekend',
    'Coastal Getaway',
    '2026-07-12',
    '2026-07-15',
    650,
    array['beach', 'relaxed', 'budget-conscious'],
    'Sunsets, beachside shacks, relaxed vibes with budget-friendly stays.'
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '11111111-1111-1111-1111-111111111111',
    'Manali Mountain Trek',
    'Alpine Adventure',
    '2026-07-15',
    '2026-07-20',
    1200,
    array['hiking', 'active', 'mountains', 'cold'],
    'High altitude trail hiking and crisp mountain passes.'
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '11111111-1111-1111-1111-111111111111',
    'Bangalore City Break',
    'Urban Culture',
    '2026-07-10',
    '2026-07-14',
    800,
    array['city', 'culture', 'active'],
    'Craft breweries, live music, art galleries, and botanical gardens.'
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    '11111111-1111-1111-1111-111111111111',
    'Kerala Backwaters Chill',
    'Nature & Houseboat',
    '2026-07-18',
    '2026-07-24',
    1100,
    array['beach', 'relaxed', 'budget-conscious'],
    'Serene houseboat cruise through palm-fringed lagoons.'
  )
on conflict (id) do nothing;
