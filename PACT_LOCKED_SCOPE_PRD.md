# PACT — Locked Scope PRD (v1, Sep 2026 submission)

**This document is the single source of truth for what PACT is allowed to contain for this submission. Anything not explicitly listed under "In Scope" is OUT OF SCOPE, full stop, regardless of how small or beneficial it seems. AG must check new work against this file before starting it, not after.**

If a feature seems valuable but isn't listed here: write it in the "Explicitly Deferred" section of the README instead of building it. Do not build first and ask later.

---

## The one-sentence product definition

> PACT helps an invited trip group turn private date, budget, vibe, and dealbreaker constraints into a fair, sealed consensus decision.

Any proposed feature must be tested against this sentence: does it make this one job clearer, or does it add a second job? If it adds a second job, it's out of scope.

---

## In Scope — the complete feature list, nothing else

1. Auth (sign up / log in / guest demo persona)
2. Create a circle / join a circle via invite code
3. Lightweight invite sharing (WhatsApp/SMS/email/copy link/QR) — no user directory, no friend requests
4. Private constraints form (dates, budget, vibe, dealbreakers)
5. Ranked consensus matrix with deadlock detection
6. AI Compromise Whisperer (aggregate data only, via authenticated Edge Function — never a direct client API key)
7. Silent sealed ballot: **Approve / Reject / Rank only** — this is the original, tested mechanic. No alternate scoring systems.
8. Trip Brief: final locked details, WhatsApp share, calendar export, and Instagram/Snap social story card export (this was part of the original Trip Brief design — do not remove)
9. Trip Vault (documents) and Memory Library (photos) — IF server-persisted; otherwise cut from pitch entirely, not left as local-only
10. Settings: privacy toggles, notification toggles, sign out, account deletion (must be real, server-side deletion — not just local clear)
11. One flat PACT Pro organizer pass via real RevenueCat purchase — no tiers, no multi-currency, no concierge flow
12. Single dark theme (original Obsidian/Coral/Emerald palette) — no theme switcher, no additional themes

## V2 Scope Addition (approved 2026-09-14) — build only after original scope is fully tested

The one-sentence definition expands slightly:

> PACT helps an invited trip group turn private constraints into a sealed consensus decision, discuss and plan together in one place, and get real AI-backed recommendations for where to go and what to expect.

13. Group capacity raised to 20 members (from 10) — one flat pass covers up to 20
14. In-circle group chat — persisted messages, visible to all circle members (not private like preferences/votes), archived into the Memory Library when a trip is finalized
15. Real place/hotel/restaurant recommendations — sourced from the Google Places API (real names, prices, ratings) narrated by Gemini, NOT a custom-trained model
16. AI storytelling — on request, AI explains the history/context of an unfamiliar destination in a conversational way, reusing the existing AI Advisor infrastructure
17. Review-derived safety/practicality notes — summarized from real Google Places review text (e.g. "reviewers mention the trail is slippery after rain"). **Never a fabricated usage statistic** ("X people used PACT to visit safely") — that would be false, since PACT has no real users yet.

**Explicitly rejected approach:** training or fine-tuning a custom small language model (SLM) for recommendations. Not feasible in the remaining time — a real technical ML project measured in weeks-to-months, not days. The Google Places + Gemini approach achieves the same user-facing outcome.

## Explicitly Out of Scope — do not build, note as roadmap only

- User directory / friend search / friend requests
- Multiple color themes or a theme customizer
- Multi-currency, tiered, or concierge pricing
- Any voting mechanic other than Approve/Reject/Rank (no point-scoring, no alternate stance systems)
- P2P/offline sync, QR-based offline pass
- Deposit/payment splitting
- Global AI chat assistant as a primary nav tab (the Compromise Whisperer is the only sanctioned AI surface)

## The 4 non-negotiable correctness requirements (must be true, not just reported true)

| # | Requirement | How to verify |
|---|---|---|
| 1 | No AI API key is ever present in client-side code | Search the built app bundle for the key string — it must not appear |
| 2 | Paywall triggers one real RevenueCat purchase, no local-unlock fallback | Complete one real sandbox purchase, confirm entitlement returned |
| 3 | Group data is read only via the aggregate snapshot function, never raw peer rows | Log in as 2 real accounts, confirm neither can query the other's raw preference/vote row |
| 4 | Finalizing a trip persists to Supabase, survives reload, syncs across devices | Finalize on device A, reload device B, confirm same data appears |

**Nothing else matters more than these 4 right now.** A visually excellent app that fails any of these on a judge's own device scores worse than a plainer app that passes all 4.
