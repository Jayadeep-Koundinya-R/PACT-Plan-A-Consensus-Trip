# PACT Release-Readiness Audit

> **Original Audit Date**: 2026-09-10
> **Updated**: 2026-09-17 (honest re-evaluation with verified code state)
> **Branch**: `v2-features`
> **Tests**: 131/131 passing across 28 suites (`npm test`)
> **TypeScript**: 0 errors (`npx tsc --noEmit`)

## Executive Judgment

PACT has a strong, distinctive core: privately collect group constraints, present an aggregate recommendation, and let a group resolve a trip decision without public budget pressure. That is a credible single-job story for Shipaton.

The repository is **code-complete for all 17 in-scope features** (V1 + V2) and has materially improved since the original September 10 audit. However, it remains **demo-ready, not production-ready** because critical external integrations have not been deployed or verified on real devices.

### Updated Audit Scorecard

| Dimension | Sep 10 Score | Sep 17 Score | What Changed |
|---|---:|---:|---|
| Core idea / Innovation | 8 / 10 | 8 / 10 | Unchanged — the privacy-first consensus concept remains strong and differentiated. |
| UI / visual system | 7 / 10 | 7.5 / 10 | Improved — AI Chatbot tab removed (R30), Sun/Moon toggle verified working with persistence, responsive layouts verified at 360px/390px/desktop. |
| UX / core flow | 6 / 10 | 7 / 10 | Improved — V2 features (chat, place recommendations UI, storytelling UI) add depth. Global AI tab removed. Pricing is now one flat pass. But V2 Steps 3-5 fall back to local market data because API keys are not set. |
| Backend correctness | 3 / 10 | 6 / 10 | **Significantly improved** — `get_group_consensus_snapshot` RPC is now the live data source in `useGatherlyStore`. `saveTripBriefToSupabase`/`fetchTripBriefFromSupabase` exist for server persistence. `EXPO_PUBLIC_GEMINI_API_KEY` removed from client. BUT: Edge Functions are not deployed, so this is code-correct but not live-verified. |
| RevenueCat integration | 2 / 10 | 4 / 10 | **Improved in code** — real `Purchases.getOfferings()`, `purchasePackage()`, and `restorePurchases()` are now wired in `app/paywall.tsx` with web fallback. Webhook handler exists. BUT: zero real sandbox purchases have been completed on any physical device. |
| Shipaton execution readiness | 4 / 10 | 5.5 / 10 | **Improved** — more features complete, tests passing, scope tightened. BUT: the submission's credibility still depends on proving the RevenueCat purchase and deploying Edge Functions. |

---

## P0 Findings: Current Status

| Original P0 Finding | Sep 10 Status | Sep 17 Status | Evidence |
|---|---|---|---|
| **Gemini key exposed to client** | OPEN | ✅ **RESOLVED** | `EXPO_PUBLIC_GEMINI_API_KEY` removed from `.env` and all client paths. `keyHygiene.test.mjs` blocks regressions. All AI calls route through authenticated Edge Function. |
| **Paywall is a fake unlock** | OPEN | ⚠️ **CODE FIXED, NOT VERIFIED** | `app/paywall.tsx` now has real `Purchases.getOfferings()` → `purchasePackage()` → entitlement check → `restorePurchases()`. Web fallback is honestly labeled. BUT: no real sandbox purchase has been completed on a physical device. The code is correct; the proof is missing. |
| **Live consensus uses raw reads, not aggregate RPC** | OPEN | ✅ **RESOLVED** | `useGatherlyStore.fetchGroupDataFromCloud` now calls `fetchGroupConsensusSnapshot(groupId)` (line 493). Security Test 4 verifies the store never imports raw group read functions. |
| **Finalization, vault, memories are local-only** | OPEN | ⚠️ **PARTIALLY RESOLVED** | `saveTripBriefToSupabase` and `fetchTripBriefFromSupabase` exist in `service.ts` (lines 426-480). Trip finalization writes to Supabase. BUT: Vault and Memories remain local-only (Zustand state). This should be either server-persisted or honestly labeled as local in the submission. |

---

## P1 Findings: Current Status

| Original P1 Finding | Sep 10 Status | Sep 17 Status |
|---|---|---|
| Pricing sells capacity the backend rejects | ✅ Resolved | ✅ Still resolved — one flat organizer pass, capacity raised to 20. |
| Subscription prices and product model conflict | ⚠️ Partial | ⚠️ Still partial — code is aligned to one `.99` pass, but native RevenueCat product config needs real sandbox verification. |
| Account deletion only clears device | ✅ Resolved (renamed to `clearLocalAccountData`) | ✅ Honestly labeled — Settings says "Clear Local Data" not "Delete Account". Server deletion is NOT implemented. |
| Invite privacy weaker than copy suggests | ✅ Resolved | ✅ Invite code is the reliable fallback. No false HTTPS domain claims. |
| `get_option_vote_count` has no membership check | ⚠️ Open | ✅ **RESOLVED** — group membership check added inside the RPC. |
| Deep links not deployment-proof | ⚠️ Open | ⚠️ Still open — no real HTTPS domain configured. Invite codes remain the reliable fallback. |

---

## Requirements R25-R30: Updated Status

| Requirement | Sep 10 Status | Sep 17 Status | Evidence |
|---|---|---|---|
| R25: Coral/Emerald palette | Code verified | ✅ **FULLY VERIFIED** | 10 property tests passing. Live browser screenshots confirm colors. |
| R26: Lightweight invite sheet | Built | ✅ **VERIFIED** | `AddPeopleModal` with WhatsApp/SMS/Email/Copy/QR. Live browser test passed. |
| R27: Shared WhatsApp function | Mostly built | ✅ **VERIFIED** | All surfaces use `useShareInvite` hook. |
| R28: No user directory | Done | ✅ Done | Not present in codebase. |
| R29: One organizer pass up to 20 | Implemented (was 10) | ✅ **Code correct** | Capacity raised to 20. Single flat pass. `groupCapacity20.test.mjs` passes. Real billing untested. |
| R30: Global AI chat tab removed | Open (tab still visible) | ✅ **RESOLVED** | `app/(tabs)/chatbot.tsx` deleted. `_layout.tsx` has 3 visible tabs + hidden pro. |

---

## UI Audit Update

### What is working well (confirmed Sep 17)
- Canonical Obsidian dark palette verified live in browser with 10 automated property tests.
- Sun/Moon toggle in ScreenHeader switches dark ↔ light with persistence across reloads (confirmed via live click-through and WebP recording).
- 3 visible bottom tabs (My Circles, New Trip, Settings) + hidden Pro tab. AI Chatbot removed.
- Responsive layouts verified at 360px (small Android), 390px (iPhone), and desktop web.
- Circle Chat UI renders with dark theme, persona switcher, and 2-account live messaging.

### UI risks still open
- Place recommendation cards show `🗂 Cached` badge and verified market data — this looks real but is actually the hardcoded `REAL_DESTINATION_DATA` fallback because no Google Places API key is configured.
- Paywall visually shows a purchase flow, but on web it's a demo unlock (honestly labeled). On native, it's untested.
- Social story card export (Instagram/Snap) is wired but untested on native devices.

---

## Backend Audit Update

### Sound foundations (confirmed Sep 17)
- Supabase RLS makes preferences and individual votes owner-readable only (Security Tests 1-4 pass).
- `get_group_consensus_snapshot` RPC is the live data source (confirmed in `useGatherlyStore.ts:493`).
- RevenueCat webhook fails closed when secret is unconfigured.
- AI Edge Function validates Supabase JWT before using server-side Gemini key.
- `saveTripBriefToSupabase` writes finalized trip data to Supabase.
- Circle Chat schema with deliberate RLS exception for member-visible messages.

### Still required
1. **Deploy Edge Functions** — `ai-advisor`, `place-recommendations`, `og-preview`, `revenuecat-webhook` are written but not deployed. The `ai-advisor` returns 404 on remote calls.
2. **Set Supabase secrets** — `GEMINI_API_KEY` and `GOOGLE_PLACES_API_KEY` must be set in Supabase dashboard.
3. **Server-persist Vault/Memories** — or remove claims from submission.
4. **Server-side account deletion** — currently local clear only.
5. **Integration test with 2 real Supabase users** — unit tests mock the RLS layer; real policy behavior is unverified.

---

## Evidence and Limits (Sep 17)

| Check | Result |
|---|---|
| `npm test` | 131 passing tests across 28 suites (0 failures) |
| `npx tsc --noEmit` | 0 errors |
| Key hygiene | `EXPO_PUBLIC_GEMINI_API_KEY` not present in `.env` or any client code |
| Paywall code | Real `Purchases.getOfferings()`, `purchasePackage()`, `restorePurchases()` present |
| Aggregate RPC | `fetchGroupConsensusSnapshot` called in store (line 493) |
| Trip persistence | `saveTripBriefToSupabase` exists (line 426) |
| `.env` contents | Only `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` — no leaked API keys |
| Theme toggle | Verified live in browser with dark→light→persist→dark cycle |
| V2 Chat | 2-account live test verified with screenshots and video |
| V2 Places | Code verified — falls back to `pact_verified_market` data (API key not set) |
| V2 Storytelling | Code verified — Edge Function returns 404 (not deployed) |
| V2 Safety Notes | Code verified — no live Google review data available |
| RevenueCat sandbox | **NOT TESTED** — zero real purchases on any device |
| Multi-device sync | **NOT TESTED** — no 2-device real-time test with real Supabase accounts |

### What these tests prove vs. what they don't

**Tests DO prove**: correct model logic, privacy guards, color tokens, webhook handling, pricing rules, data flow patterns, consensus math, RLS intent.

**Tests DO NOT prove**: real RevenueCat billing, real Google Places API results, real Gemini AI responses, real 2-device Realtime sync, real RLS policy enforcement, real Edge Function deployment.

---

## Submission Plan (Updated Sep 17)

### Phase 1: Critical (MUST DO before submission)

| # | Action | Time Estimate | Owner |
|---|---|---|---|
| 1 | Deploy Edge Functions to Supabase (`supabase functions deploy`) | 30 min | Jayadeep |
| 2 | Set `GEMINI_API_KEY` and `GOOGLE_PLACES_API_KEY` in Supabase secrets | 15 min | Jayadeep |
| 3 | Complete one real RevenueCat sandbox purchase on physical Android | 1 hour | Jayadeep |
| 4 | Test 2-device real-time sync with real Supabase accounts | 30 min | Jayadeep |
| 5 | Record 2-minute demo video | 2 hours | Jayadeep |

### Phase 2: Should Do

| # | Action | Time Estimate | Owner |
|---|---|---|---|
| 6 | Verify invite deep links resolve on a clean device | 30 min | Jayadeep |
| 7 | Run full 8-step end-to-end flow on physical device | 1 hour | Jayadeep |
| 8 | Submit on Devpost | 30 min | Jayadeep |

### Phase 3: Nice to Have (if time permits)

| # | Action | Time Estimate | Owner |
|---|---|---|---|
| 9 | Server-side account deletion | 2 hours | AG |
| 10 | Server-persist Vault/Memories | 3 hours | AG |
| 11 | Generate final 1024x1024 app icons | 30 min | AG |

### Two-minute video (same structure as original audit)

- 0:00-0:15: The WhatsApp trip-planning deadlock and the privacy problem.
- 0:15-0:40: Organizer creates a circle and shares the invite.
- 0:40-1:05: Two members submit sealed constraints; show only aggregate progress.
- 1:05-1:30: Ranked matrix and one deadlock compromise suggestion.
- 1:30-1:50: Silent ballot, aggregate consensus, and the final Trip Brief sent back to WhatsApp.
- 1:50-2:00: One concise RevenueCat proof after the sandbox purchase is working.

Do not lead with pricing, vault, memories, or themes. The video should make the one job memorable.

---

## Sources

[^1]: RevenueCat. "[Shipaton 2025 Winners](https://www.revenuecat.com/blog/company/shipaton-2025-winners)." October 13, 2025, updated October 14, 2025.

[^2]: Expo. "[Environment variables in Expo](https://docs.expo.dev/guides/environment-variables/)." Updated July 28, 2026.
