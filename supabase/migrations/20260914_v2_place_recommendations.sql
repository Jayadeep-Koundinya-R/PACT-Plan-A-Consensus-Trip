-- ============================================================================
-- PACT V2 Migration: Place Recommendations Cache Table
-- Caches Google Places API responses and Gemini narration per destination
-- ============================================================================
create table if not exists public.place_recommendations_cache (
  id uuid primary key default gen_random_uuid(),
  destination text not null unique,
  places_json jsonb not null,
  ai_summary text,
  safety_note text,
  fetched_at timestamptz not null default now()
);

create index if not exists place_recommendations_destination_idx
  on public.place_recommendations_cache(destination);
