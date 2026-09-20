# AGENTS.md — PACT Developer & AI Agent Guidelines

This repository contains **PACT (Plan A Consensus Trip)**, a private, zero-guilt group travel consensus platform developed for the Shipathon 2026 (RevenueCat) Next Gen Award Track.

---

## 1. Project Overview & Core Mission

**Problem Statement:** Groups of friends and family struggle to plan trips together due to conflicting date availability, differing budget caps, opposing vibe preferences, and unspoken dealbreakers. This often leads to endless WhatsApp debates, decision paralysis, or unilateral bookings that breed resentment.

**Solution:** PACT collects sealed, private constraints (dates, budget bands, vibes, dealbreakers) from invited members, deterministically ranks destinations, resolves deadlocks using an AI Compromise Whisperer (operating solely on aggregate buckets), and conducts silent sealed voting backed by an authentic wax seal animation. Final consensus (70% supermajority or 100% unanimous) produces an exportable Trip Brief.

---

## 2. Architectural Principles & Rules

1. **Deterministic Consensus First:** The mathematical scoring engine (`src/lib/consensus/engine.ts`) is the primary source of truth. AI is strictly advisory and operates on aggregated buckets.
2. **Aggregated Snapshot Only:** Client applications must NEVER query raw individual preference or vote rows of peer members. All group state reads must pass through Supabase aggregate snapshot functions / RPCs (`get_group_consensus_snapshot`).
3. **Fail-Safe Fallbacks:** All remote AI and external API client calls must implement strict timeouts (3.5s max) and instant local market-index / heuristic fallbacks so the UI never blocks or fails during demonstrations.
4. **Pro Circle Inheritance:** When a trip circle organizer holds an active RevenueCat Pro subscription, all invited guests in that circle inherit Pro capabilities (`has_pro: true`).
5. **Preserve Architectural Foundations:** Do not rewrite state management (Zustand), styling systems, navigation layouts, or DB schema unless explicitly requested and approved by human leads.

---

## 3. Privacy & Security Rules

1. **Sealed Personal Constraints:** Personal budgets, date constraints, and personal dealbreakers are sacred. They are protected by Supabase Row-Level Security (RLS) policies and must NEVER be visible to other members.
2. **Zero Name / Veto Leakage to AI:** External LLM calls (via Supabase Edge Functions) must receive strictly anonymized bucket data (e.g. *"2 members capped at $600, 3 at $1,200"*). Individual names, emails, or veto details must never leave the backend boundary.
3. **No Central User Directory:** Public search, user discovery, and unsolicited friend requests are strictly prohibited to protect user privacy. Circle membership is invite-only via short codes (e.g. `GOA-4F82`).
4. **No Secrets in Client Code:** Never place API keys (Gemini, Google Places, Supabase Service Role, RevenueCat secret keys) in Expo public client code (`.env` or `EXPO_PUBLIC_` variables). All sensitive API calls must route through authenticated Supabase Edge Functions.
5. **Server-Side Data Sanitization:** User profile queries must explicitly exclude user emails from public member lists.

---

## 4. Environment-Variable Rules

1. **Only Public Keys in Expo:** Only non-sensitive identifiers (e.g., `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_REVENUECAT_APPLE_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`) may be exposed to the client.
2. **Secrets in Edge Function Environment Only:** Secrets (`GEMINI_API_KEY`, `GOOGLE_PLACES_API_KEY`, `REVENUECAT_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) must reside exclusively in Supabase Edge Function environment configuration.
3. **No Real Secrets in Source Control:** `.env.example` must contain placeholder values only. Never commit real credentials.

---

## 5. Git & Workflow Rules

1. **Branch Hygiene:** Never push directly to `main` or production branches. Work on descriptive feature/fix branches.
2. **Commit Conventions:** Follow standard git commits (short subject line under 50 chars, blank line, detailed body explaining *why*).
3. **Targeted Merges:** Use Git merge diffs accurately when editing files.
4. **No Unapproved Destructive Actions:** Do not force push, delete database schemas, or clear migration history without explicit user approval.

---

## 6. Testing & Quality Requirements

1. **Test Suite Execution:** Before submitting any change, run the full test suite (`npm test`). All unit, integration, and security tests must pass.
2. **TypeScript Integrity:** Run `./node_modules/.bin/tsc --noEmit` to verify 0 TypeScript compiler errors.
3. **Proactive Test Expansion:** Any bug fix or new feature must include corresponding test coverage in the `src/**/__tests__/` directory.
4. **Never Claim Unverified Functionality:** Never report a feature or integration as "working" or "live-verified" unless it has been explicitly validated via automated tests, visual verification, or physical device testing.

---

## 7. UI/UX Principles & Design System

1. **Obsidian Midnight Palette:** Maintain the single dark mode design system (`#090A0F` background, `#13151E` card surface, `#FF5A5F` primary Coral, `#3DE0A0` Emerald seal, `#F4F3F0` primary text).
2. **2-Second Visual Clarity:** Every screen must have ONE clear primary action visible within 2 seconds of loading.
3. **Robust State Handling:** Every screen component must gracefully handle Loading, Empty, Error, and Success states with skeletons, empty cards, or actionable error displays.
4. **Haptic & Visual Feedback:** Touch interactions should be accompanied by subtle haptics (`expo-haptics`) and fluid animations (`react-native-reanimated`).

---

## 8. Dependency Rules

1. **Diagnose Before Changing Environment:** Do not install, uninstall, or upgrade npm packages without diagnosing root causes and checking compatibility with Expo SDK 52 and React Native 0.76.
2. **No Custom SLM / Heavy ML Packages:** Rely on standard cloud Edge Functions and client-side heuristics. Avoid unneeded heavy ML dependencies.

---

## 9. Definition of Done (DoD)

A task is complete ONLY when:
1. Source code changes are implemented and verified via read-only inspection tools.
2. `npm test` executes with 100% passing tests.
3. `./node_modules/.bin/tsc --noEmit` finishes with 0 errors.
4. No scope creep or non-PRD features were introduced.
5. All security, privacy, and secret hygiene rules remain 100% compliant.
