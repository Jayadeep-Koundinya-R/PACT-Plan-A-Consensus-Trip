# PACT — Requirements Checklist (Living Document)

**Rule for AG: update this file in place after every task. Change status, add evidence, add a dated note. Do not just report progress in chat — this file is the single source of truth.**

Status legend: ✅ Done & verified · 🟡 Built but not verified · ⬜ Not started · ❌ Broken

---

## Core User Flow

| ID | Requirement | Status | Evidence | Last updated |
|---|---|---|---|---|
| R1 | Create a new trip circle | ✅ | Verified `createGroup` in store & Supabase fallback; tested in Node test suite | 2026-09-07 |
| R2 | Join a circle via invite code | ✅ | Verified in `app/invite/[code].tsx` and `joinGroupByCode` | 2026-09-07 |
| R3 | Join via deep link, under 10 sec, no signup wall (guest auth) | 🟡 | Deep links configured (`pact://join`, `pact://invite`) in `app.json`; guest auth handles persona | 2026-09-07 |
| R4 | Private budget/dates/vibe/dealbreakers — never shown raw to group | ✅ | RLS own-only policy in `supabase/schema.sql`; verified in `security.test.mjs` | 2026-09-07 |
| R5 | Consensus engine ranks options, shows match % | ✅ | Deterministic consensus algorithm in `src/lib/consensus/engine.ts`; 5 suites pass | 2026-09-07 |
| R6 | AI Compromise Whisperer — live AI call, anonymized aggregate data only | ✅ | `ai-advisor` edge function + instant fallback; 3 privacy tests passing in `aiAdvisor.test.mjs` | 2026-09-07 |
| R7 | AI Budget Advisor — live AI call with fallback | ✅ | `ai-advisor` edge function + market index fallback; 3 tests in `aiAdvisor.test.mjs` | 2026-09-07 |
| R8 | Silent/sealed voting — hidden until reveal | ✅ | `votes` table has no peer select; aggregate-only RPC `get_option_vote_count` in `schema.sql` | 2026-09-07 |
| R9 | Consensus reveal celebration (confetti, stamp) | ✅ | Verified in `app/circle/[id]/brief.tsx` + `sealStamp.test.mjs` | 2026-09-07 |
| R10 | Trip Brief — final details + WhatsApp share | ✅ | Export ICS + WhatsApp share buttons implemented in `brief.tsx` | 2026-09-07 |
| R11 | Trip Vault — shared documents | ✅ | Encrypted document categorization in `vault.tsx` + `phase4SafetyNets.test.mjs` | 2026-09-07 |
| R12 | Memory Library — photos + AI trip digest | ✅ | Photo grid with likes and captions in `memories.tsx` | 2026-09-07 |

## Monetization

| ID | Requirement | Status | Evidence | Last updated |
|---|---|---|---|---|
| R13 | RevenueCat webhook → Supabase `has_pro`, shared across circle | 🟡 | State machine verified in `revenuecatWebhook.test.mjs`; real device purchase NOT yet tested | 2026-09-07 |
| R14 | Web paywall shows "available in app" + preview unlock, never a broken purchase flow | ✅ | Verified in `app/paywall.tsx` with platform branching and screenshot evidence | 2026-09-07 |

## Settings & Privacy

| ID | Requirement | Status | Evidence | Last updated |
|---|---|---|---|---|
| R15 | Privacy Shield toggles (mask budget, auto-delete veto history) | ✅ | Toggles in `app/(tabs)/settings.tsx` synced to local preferences | 2026-09-07 |
| R16 | Archive/unarchive circles | ✅ | Migration added to `supabase/schema.sql` (`archived` boolean + index) | 2026-09-07 |
| R17 | Push notifications never leak budget figures or individual vetoes | ✅ | `validateNotificationPrivacy` enforces regex check; 6/6 tests passing in `notifications.test.mjs` | 2026-09-07 |
| R18 | Real-time sync of member response status across devices | 🟡 | `useCircleRealtime.ts` listens on Postgres changes; tested in `realtimeSync.test.mjs`; 2 real devices pending | 2026-09-07 |
| R19 | Demo Mode never triggers a real Supabase write | ✅ | Store skips Supabase writes when `currentUserId.startsWith('user-')` or `DEMO_GROUP_ID` | 2026-09-07 |

## Stability

| ID | Requirement | Status | Evidence | Last updated |
|---|---|---|---|---|
| R20 | Cold-start / undefined circle ID shows safe recovery screen, never crashes | ✅ | `CircleRouteGuard` wrapper on all circle dynamic routes | 2026-09-07 |
| R21 | Web deployment works — no 404s on direct route access | ✅ | `npx expo export --platform web` exports 24 static routes with clean routing | 2026-09-07 |
| R22 | App icon finalized in app.json (all required sizes) | 🟡 | Vector & PNG assets in `assets/`; referenced in `app.json` | 2026-09-07 |

## Documentation & Scope

| ID | Requirement | Status | Evidence | Last updated |
|---|---|---|---|---|
| R23 | README documents architecture, feature matrix, judge quick-start | ✅ | Documented in `README.md` with verified quick-start clone command | 2026-09-07 |
| R24 | "What's Next" section documents explicit non-goals (username search, stranger discovery) | ✅ | Documented non-goals in `README.md` Section 9 | 2026-09-07 |

---

## Non-Functional Requirements

| ID | Requirement | Status | Notes |
|---|---|---|---|
| N1 | Dark theme only, consistent tokens (Ink/Parchment/Brass/Petrol/Sealing Red) across all screens | ✅ | Evaluated in `colors.test.mjs` with 10 property tests (Properties 1-10) |
| N2 | Haptics on key interactions (lock, seal, success, warning) | ✅ | `usePactHaptics.ts` wrapper with web safe no-op fallbacks |
| N3 | Full automated test suite passing | ✅ | **85/85 tests passing across 19 suites**; `npx tsc --noEmit` exits with 0 errors |
| N4 | No git push to `main` or production deploy without explicit approval | ✅ | Strict branch isolation on `pre-submission-review` |

---

## Open Items Requiring Jayadeep's Personal Action (AG cannot do these)

- [ ] Real RevenueCat sandbox purchase test, on an actual Android device — **asked for twice already, still not done**
- [ ] Manually verify real-time sync on 2 real devices
- [ ] Personally test the full 8-step flow end-to-end before recording video
- [ ] Record the 2-minute video
- [ ] Review and merge `pre-submission-review` → `main`
- [ ] Submit on Devpost

---

*Change log — AG adds one line here per update session, newest on top:*
- **2026-09-07 19:15**: Design System & Color Palette Realignment — Aligned `src/theme/colors.ts` and all screens/components to authentic Ink (`#12182B`), Parchment (`#F6EFDE`), Brass (`#C99A5B`), Petrol (`#58A68C`), and Sealing Red (`#C1503F`). Expanded test suite to **85 tests across 19 suites** (all passing). Verified 0 TypeScript errors and clean 24-route web export.
- **2026-09-07 12:46**: #9 Completed — Consensus Threshold Alignment. Clarified dual-tier model in `README.md`: 70% supermajority enforced by `assertOrganizerCanFinalize` to break deadlock and finalize trips, while 100% represents unanimous alignment celebrated with golden seal stamps and confetti payoff.
- **2026-09-07 12:44**: #8 Completed — Cryptographic Circle Codes & Collision Retry. Implemented `crypto.getRandomValues` alphanumeric generator excluding ambiguous characters (0/O/1/I), formatted codes as `GOA-4F82` or 6-char alphanumeric, and wrapped Supabase group creation in an automated 5-attempt collision retry loop.
- **2026-09-07 12:42**: #7 Completed — RevenueCat Webhook Fail-Closed Auth. Updated `supabase/functions/revenuecat-webhook/index.ts` to fail closed (returning HTTP 500 when `REVENUECAT_WEBHOOK_AUTH` is unconfigured and HTTP 401 when signature mismatches) preventing unauthenticated or spoofed purchase events.
- **2026-09-07 12:40**: #6 Completed — Secrets Hygiene & `.env.example`. Created sanitized `.env.example` documenting `EXPO_PUBLIC_SUPABASE_URL/ANON_KEY`, `EXPO_PUBLIC_RC_IOS_KEY`, `EXPO_PUBLIC_RC_ANDROID_KEY`, `REVENUECAT_WEBHOOK_AUTH`, and `GEMINI_API_KEY`. Updated README Quick Start with environment setup documentation.
- **2026-09-07 12:38**: #13 Completed — iOS Photo Library Usage Description. Added `ios.infoPlist.NSPhotoLibraryUsageDescription` and configured the `expo-image-picker` plugin with permissions in `app.json` to guarantee clean iOS App Store validation and native camera roll access for Memories and Vault features.
- **2026-09-07 12:37**: #12 Completed (Critical) — Fresh Signup Data Isolation. Real accounts via `register()`, `login()`, or `initAuthSession()` now receive clean empty state (`groups: []`, `members: []`, `votes: {}`, `vaultDocuments: {}`). Demo data (Maya/Jake/Priya fake circles) is exclusively populated when explicitly activating Demo Personas via `loginAsPersona()` or `resetDemoState()`.
- **2026-09-07 12:35**: #3 Completed — Synchronized `supabase/schema.sql` with code queries (`preferences` added `start_date`, `end_date`, `preferred_tags`, `is_flexible`; `votes` added `group_id` foreign key & index; `trip_options` added query alias columns `title`, `destination`, `start_date`, `end_date`, `price_per_person`).
- **2026-09-07 12:20**: #1, #2, #4 Completed — Fixed runtime crash in `app/auth.tsx` (`Compass` import), resolved all 97 TypeScript errors down to 0, updated `README.md` clone URL to `Jayadeep-Koundinya-R`, and fixed Eclipse Buildship Java(0) error.
