# PACT Release-Readiness Audit

## Executive Judgment

PACT has a strong, distinctive core: privately collect group constraints, present an aggregate recommendation, and let a group resolve a trip decision without public budget pressure. That is a credible single-job story for Shipaton.

The current repository is **demo-ready but not production-ready**. The scripted demo, local state, visual system, deterministic consensus engine, and invite UI are substantially complete. The live multi-user consensus path, real purchase path, shared persistence, and secret handling have material gaps. Do not describe those parts as verified in the submission until the blockers below are closed.

| Dimension | Audit score | Judgment |
|---|---:|---|
| Core idea / Innovation | 8 / 10 | Private constraint aggregation plus silent group voting is clear and differentiated. |
| UI / visual system | 7 / 10 | Coral/Emerald tokens are restored and the product has a coherent travel-consensus identity. A final device pass is still needed. |
| UX / core flow | 6 / 10 | The happy-path demo is coherent. Pricing, the global AI tab, demo affordances, and unverified invite links weaken focus. |
| Backend correctness | 3 / 10 | Schema intentions are good, but live reads, aggregate consensus, finalization, and deletion are not fully wired. |
| RevenueCat integration | 2 / 10 | SDK initialization and webhook code exist; the paywall does not initiate a native RevenueCat purchase. |
| Shipaton execution readiness | 4 / 10 | Fix the P0 items before positioning this as a real integrated product. |

RevenueCat's Grand Prize rubric is Innovation, Execution, Feasibility, and Integration. Its 2025 winners also demonstrate that a narrow, polished job is stronger than a broad feature catalogue.[^1]

## Scope Decision

The correct product sentence is:

> PACT helps an invited trip group turn private date, budget, vibe, and dealbreaker constraints into a fair, sealed consensus decision.

Everything that does not directly improve that sentence should be hidden, removed from the pitch, or explicitly deferred. The user directory and friend-request system should remain out of scope. The lightweight invite sheet is the right replacement.

The global AI chat, five-tier multi-currency pricing matrix, concierge flow, document vault, memories, social story export, notifications, theme switching, and multiple demo controls make the app feel broader than its evidence base. They are not necessary to prove the core job.

## Evidence and Limits

The following checks completed successfully on 2026-09-10:

| Check | Result |
|---|---|
| `npm test` | 119 passing tests across 26 suites |
| `npx tsc --noEmit` | Passed with no TypeScript errors |
| `npx expo export --platform web` | Passed; 26 static routes exported |
| Palette tests | Passed; canonical Coral `#FF5A5F`, Emerald `#3DE0A0`, Base `#090A0F`, Card `#13151E`, Gold `#D4AF37` are asserted |

These results are useful but not equivalent to end-to-end proof. Several suites test pure models, source text, or mocked reducers rather than a signed-in Supabase project, two devices, store billing, a deployed domain, or a real AI request. No physical-device RevenueCat purchase or live two-device Realtime test is evidenced in the repository.

## P0: Submission Blockers

| Finding | Evidence | Why it matters | Required correction |
|---|---|---|---|
| Gemini key is exposed to every app client | `src/lib/ai/aiChatClient.ts:9` and `src/lib/ai/aiAdvisorClient.ts:71` read `EXPO_PUBLIC_GEMINI_API_KEY` and send it directly to Google. | Expo documents that `EXPO_PUBLIC_*` values are embedded in readable client bundles.[^2] Anyone can extract and abuse the key; the daily quota is only local state. | Revoke/rotate the current Gemini key immediately. Delete both direct-client call paths. Call only the authenticated Supabase Edge Function, where `GEMINI_API_KEY` remains server-only. Enforce request quotas server-side. |
| The paywall is a fake unlock, not RevenueCat purchasing | `app/paywall.tsx:81-93` sets `premium_monthly` directly; there is no `getOfferings` or `purchasePackage` call. | A judge who tests the native purchase path will not see a purchase. This directly fails the Integration criterion. | Implement one real offering/package selection and `Purchases.purchasePackage`, refresh `CustomerInfo`, and handle cancel/pending/error/restore states. Do not call the button "Activated" until entitlement is returned. |
| Live group consensus conflicts with privacy policies and the secure aggregate RPC is unused | The client calls `fetchGroupPreferencesFromSupabase` and `fetchGroupVotesFromSupabase` in `useGatherlyStore.ts:457-470`. RLS permits only each user's own preference/vote at `supabase/schema.sql:176-190` and `216-229`. The protected aggregate RPC exists at `supabase/schema.sql:313-422` but has no caller in the app. | In a real multi-user circle, a member cannot read peers' raw preferences or votes, as intended. The present client-side scoring/fetch path therefore cannot reconstruct a truthful group matrix or aggregate ballot. The demo hides this with seeded local data. | Replace raw group preference/vote reads with `get_group_consensus_snapshot`. Render only its aggregate-safe fields. On a Realtime signal, re-fetch that snapshot; do not ingest peer vote records into Zustand. Add integration tests against a real Supabase test project. |
| Finalizing a trip, vault files, and memories are local-only | `useGatherlyStore.ts:735-768` changes local state only. `addVaultDocument` and `addMemoryPhoto` at `:810-837` only update Zustand. There is no matching Supabase write for a trip brief. | A confirmed trip will not reliably survive reloads or synchronize to other people. Calling it "shared" or "finalized" is not presently accurate. | Add an organizer-only server transaction/RPC that validates the consensus, writes the trip brief, and changes group status. Persist vault metadata/files and memories, or remove those claims from the submission. |

## P1: Correctness, Privacy, and Trust Gaps

| Finding | Evidence | Required correction |
|---|---|---|
| Pricing sells capacity the backend rejects | Resolved in the current scope pass. `groupPricing.ts`, create-circle, and paywall now expose free up to 5 and one organizer pass up to 10, matching the backend cap. | Keep the 10-member limit consistent in future RevenueCat product configuration. |
| Subscription prices and product model conflict | README, pricing code, settings, demo copy, and entitlement display now describe one $9.99 organizer pass per trip. | The native RevenueCat product still requires real sandbox verification in the separate billing task. |
| Account deletion only clears the device | Resolved by renaming the action to `clearLocalAccountData`; Settings and legal copy now state that it signs out and clears local data only. | Build server deletion later if permanent account removal becomes a requirement. |
| Invite privacy is weaker than the copy suggests | Runtime share copy now treats `pact://join/{code}` as an optional installed-app hint and always includes the invite code. No public HTTPS invite domain is assumed. | Keep the code as the reliable fallback until a real HTTPS domain and associated links are deployed. |
| `get_option_vote_count` has no membership check | `supabase/schema.sql:426-436` grants an aggregate count by option UUID without verifying the caller belongs to the option's group. | Add a group membership authorization condition inside the RPC or retire it in favour of the authenticated consensus snapshot. |
| Deep links are not deployment proof | Runtime share copy no longer uses the unconfigured `pact.app` domain. The app configuration still only registers custom schemes (`app.json:29-47,64`). | Keep the invite code as the reliable fallback until a real HTTPS domain and associated links are deployed. |
| Documentation is stale and internally inconsistent | Resolved for test count and pricing: README now reports 116 tests across 26 suites and one organizer pass. | Remove duplicated roadmap text in a later documentation polish pass. |

## UI Audit

### What is working well

- The canonical dark palette is restored in `src/theme/colors.ts`, and automated token tests verify it. This satisfies the code portion of R25.
- The information design supports the core story: private inputs, ranked options, silent ballot, and a final brief are legible product stages.
- `AddPeopleModal` gives the right lightweight sharing options rather than inventing a directory: WhatsApp, SMS, email, native share, copy link, and QR.
- The shared `useShareInvite` hook centralizes WhatsApp, SMS, email, nudge, and Trip Brief sharing. This is a good consistency boundary for R26 and R27.

### UI risks before recording

- The four visible bottom tabs include a full AI Advisor. It signals a second, generic travel-chat job and competes with the consensus story. Hide it from the tab bar for the submission build, or make it appear only from a deadlock state.
- The paywall is visually substantial but functionally deceptive. A beautiful non-purchase path is worse than a small, truthful "available in the app" state.
- The web paywall uses a phone-frame container and several large tier cards. It is heavy for a judge trying to scan the core flow. With the recommended single pass, this page becomes much shorter and calmer.
- Visual responsiveness, text overflow, touch targets, Android back behavior, light mode, native share sheets, and real asset quality have not been independently screenshot-tested in this audit. Test two phone sizes and web before recording.

## UX Audit

### Core experience

The core UX is good in concept: it removes the public negotiation that causes trip planning to stall. The best route is invite -> private constraints -> aggregate matrix -> sealed ballot -> final brief -> share back to the existing group chat.

### Friction and misleading states

- Demo personas and scenario switchers are useful rehearsal tools but should never be visible in the recorded user journey.
- "WhatsApp nudge" is a manual share action, not an automated message system. The settings text and tier features should not imply automation.
- `NudgeModal` defines an unused message containing a different `/invite/` URL while the shared hook uses `/join/` (`src/components/NudgeModal.tsx:41-56`, `src/hooks/useShareInvite.ts:47-51`). Remove the dead copy and use one canonical route.
- A visitor needs a reliable guest/onboarding path, real link resolution, and an obvious recovery path if a circle is full or finalized. These flows compile but are not device-verified.
- The product should not promise that private fields are "cryptographically computed" or "zero knowledge". Current privacy is RLS-based access control over normal database fields, which is valuable but different.

## Backend Audit

### Sound foundations

- Supabase RLS appropriately makes preferences and individual votes owner-readable only.
- The `get_group_consensus_snapshot` RPC is the correct architectural direction: it checks membership and returns aggregates rather than private fields.
- RevenueCat webhook authorization fails closed when its secret is not configured, and its sandbox guard is sensible.
- The AI Edge Function validates a Supabase JWT before using its server-side Gemini key.

### Required repairs

1. Make the aggregate snapshot RPC the only live matrix/ballot data source.
2. Send Realtime only a safe "circle changed" signal or refetch aggregate state after secure events. Do not rely on receiving private table rows across members.
3. Add server-authoritative finalization and persisted brief data.
4. Move all AI calls and quotas to the authenticated Edge Function. Validate that an AI request relates to a circle the caller belongs to before accepting group data.
5. Add a deletion policy for private rows plus a protected account-deletion workflow.
6. Create an integration test database and test real RLS using two authenticated users. Current unit tests cannot establish live policy behavior.

## Requirements R25-R30

| Requirement | Audit status | Evidence and decision |
|---|---|---|
| R25: restore Coral/Emerald palette | Code verified; device visual verification pending | Tokens and unit tests are correct. Do a final physical-device visual pass. |
| R26: lightweight invite sheet | Built; external delivery pending | Modal and native channel handlers exist. Verify each link/channel on iOS and Android after the production domain is configured. |
| R27: shared WhatsApp function | Mostly built | All primary surfaces use `useShareInvite`; remove duplicate/dead nudge copy and standardize on `/join/{code}`. |
| R28: no user directory/friend requests | Done | Code and README align with this scope decision. Keep it a firm non-goal. |
| R29: one organizer pass up to 10 members | Implemented in code; billing pending | Multi-tier capacity claims are removed. The native purchase mapping remains part of the separate RevenueCat verification task. |
| R30: global AI chat tab | Built; remove from focal path | It expands scope, exposes a key, and is not the distinctive product. Keep the narrow compromise assistant only after the backend repair. |

## Submission Plan

### Before recording or submitting

1. Rotate the Gemini key, remove `EXPO_PUBLIC_GEMINI_API_KEY` usage, and route AI exclusively through the authenticated Edge Function.
2. Replace tier pricing with one organizer pass. Wire its button to a real RevenueCat offering, purchase, entitlement refresh, restore purchase, and error state.
3. Replace raw live reads with `get_group_consensus_snapshot`; persist finalization on the server; test two genuine user accounts on two devices.
4. Make the invitation URL real, configure associated links, and test WhatsApp/SMS/email/copy from a clean phone.
5. Either persist Vault/Memories or remove them from the video, README, and feature matrix.
6. Correct account deletion wording or implement server deletion.
7. Update the README and checklist from actual test evidence. Remove stale test counts, duplicated roadmap text, unverified guarantees, and false purchase claims.

### Required manual acceptance test

Run this once on two real devices, recording pass/fail and screenshots:

1. Organizer purchases and restores the organizer pass in the RevenueCat sandbox.
2. Organizer creates a circle and shares a real HTTPS invite through WhatsApp, SMS, email, copy, and QR.
3. Guest opens the link on a clean device, joins, and submits private constraints.
4. Verify each account cannot query another account's raw preferences or vote rows.
5. Verify both devices see only aggregate response/vote information and the same ranked snapshot.
6. Create a deadlock; request a compromise; verify the AI request contains aggregates only.
7. Reach the voting threshold; finalize as organizer; reload both devices and confirm the same persisted brief.
8. Test cancellation, network loss, expired/full invite, sign-out, account deletion behavior, and restore purchase.

### Two-minute video

- 0:00-0:15: The WhatsApp trip-planning deadlock and the privacy problem.
- 0:15-0:40: Organizer creates a circle and shares the invite.
- 0:40-1:05: Two members submit sealed constraints; show only aggregate progress.
- 1:05-1:30: Ranked matrix and one deadlock compromise suggestion.
- 1:30-1:50: Silent ballot, aggregate consensus, and the final Trip Brief sent back to WhatsApp.
- 1:50-2:00: One concise RevenueCat proof after the sandbox purchase is working. Mention AI-assisted development as the build story, not as a feature distraction.

Do not lead with pricing, the concierge modal, global chat, vault, memories, or a theme switcher. The video should make the one job memorable.

## Sources

[^1]: RevenueCat. "[Shipaton 2025 Winners](https://www.revenuecat.com/blog/company/shipaton-2025-winners)." October 13, 2025, updated October 14, 2025.

[^2]: Expo. "[Environment variables in Expo](https://docs.expo.dev/guides/environment-variables/)." Updated July 28, 2026.
