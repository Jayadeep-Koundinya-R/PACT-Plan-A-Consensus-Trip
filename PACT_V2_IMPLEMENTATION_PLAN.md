# PACT V2 — Implementation Plan

**Same rule as testing waves: build one item fully, test it live (not just code review), report, and stop before starting the next. Do not parallelize these.**

Order is deliberate: cheapest/lowest-risk first, riskiest/most novel (chat) built with enough runway left to fix problems, recommendations/storytelling last since they're additive and don't touch existing privacy-critical code paths.

---

## Step 1: Raise capacity to 20 (~0.5 day)
- Update `max_members` default and any hardcoded cap of 10 in `service.ts`, `groupPricing.ts`, `create-circle.tsx`
- Update all UI copy referencing "up to 10"
- Live-test: create a circle with 20 members end to end
- Update `REQUIREMENTS_CHECKLIST.md`

## Step 2: In-circle chat (~3-4 days — biggest item, break into sub-steps)
1. Schema: create `circle_messages` table + RLS per `PACT_V2_SCHEMA.md` (0.5 day)
2. Backend: realtime subscription hook (`useCircleChat.ts`), mirroring the existing `useCircleRealtime.ts` pattern (0.5 day)
3. UI: chat screen/tab on Circle Hub — message list + input, matching existing dark theme (1 day)
4. Archive-on-finalize: when `saveTripBriefToSupabase` runs, copy the chat log into Memory Library as a read-only entry (0.5 day)
5. Live-test: 2 real accounts, real-time message delivery both directions, archive triggers correctly on finalize (0.5-1 day, this is the step most likely to reveal bugs — budget extra time here)

## Step 3: Real place/hotel/restaurant recommendations (~2-3 days)
1. Google Places API key setup + a new Edge Function (`place-recommendations`) that queries Places API for a destination and passes results to Gemini for narration (1 day)
2. Schema: `place_recommendations_cache` table (0.25 day)
3. UI: "Explore this place" expandable section on Ranked Matrix cards (1 day)
4. Live-test: real destination, confirm real place names/ratings appear (not placeholder text), confirm caching works on second view (0.5 day)

## Step 4: AI storytelling (~1 day)
1. New prompt template in the existing AI Advisor Edge Function (no new infrastructure needed) (0.5 day)
2. UI: "Tell me about this place" trigger + conversational response bubble (0.25 day)
3. Live-test: try 2-3 different real places, confirm responses are sensible and non-generic (0.25 day)

## Step 5: Review-derived safety notes (~0.5 day)
1. Extend Step 3's Edge Function to also summarize real review text into one practical note (0.25 day)
2. UI: "Good to know" line on the same place card, omitted when no relevant note exists (0.25 day)
3. Live-test: confirm the note is grounded in real review content, never a fabricated statistic

---

## Cut line

If Step 2 (chat) runs significantly over budget, this is the one item that can be cut entirely without damaging the core pitch — PACT's differentiator was never "has chat," and cutting it cleanly (documented as "What's Next") is far better than shipping a broken or untested chat feature. Steps 3-5 are lower-risk and more additive; prioritize finishing those over rescuing a struggling chat implementation if time runs short.

## After all 5 steps

Update `PACT_TESTING_MATRIX.md` with a new "Wave 6 — V2 Features" section covering these 5 items in the same PASS/FAIL/evidence format as Waves 1-4, before moving to Wave 5's personal device checks and final submission prep.
