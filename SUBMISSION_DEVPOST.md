# PACT — Travel Consensus Without Group Chat Paralysis

**Submission for RevenueCat Shipathon 2026 — Next Gen Track**

---

## 📌 Project Overview

- **Project Title:** PACT — Travel Consensus Without Group Chat Paralysis
- **Tagline:** Reach travel consensus in seconds using zero-knowledge silent ballots and viral Pro Circle inheritance.
- **Track:** Next Gen Track (RevenueCat Shipathon 2026)

---

## 💡 Inspiration & Problem Statement

Planning group trips in 2026 remains remarkably broken. When 4 to 24 friends attempt to organize a vacation over WhatsApp, Slack, or iMessage, coordination stalls for weeks in group chat chaos.

### The Core Friction Points:
1. **Asymmetric Budget Pressure & Social Shaming**: Members hesitate to admit lower budget ceilings or non-negotiable dealbreakers in public chats, leading to flaky commitments or uncomfortable opt-outs.
2. **Loudest Voice Dominance**: One vocal member books accommodations unilaterally without consensus, breeding passive resentment.
3. **Ghost Member Poisoning**: Unresponsive friends skew traditional poll averages and stall progress indefinitely.
4. **Coordination Failure (Pareto Inefficiency)**: Groups fail to discover destination and date options that optimize collective happiness while strictly respecting individual constraints.

PACT was built to eliminate group travel paralysis permanently by replacing opinionated group chat arguments with **Zero-Knowledge Silent Ballots**, **Deterministic Consensus Scoring**, and **RevenueCat-Powered Pro Circle Inheritance**.

---

## ✨ What It Does (Screen-by-Screen Feature Breakdown)

PACT seamlessly guides group travel across three distinct phases:

### Phase 1: Pre-Trip Consensus Room
- **3-Step Milestone Wizard (`app/create-circle.tsx`)**: Group organizers set destination candidates, date ranges, multi-currency defaults (USD, EUR, INR, GBP), and instant invite codes (`GOA-4F82`).
- **Sealed Constraints Room (`app/circle/[id]/preferences.tsx`)**: Members submit secret date availability, max budget ceilings, vibe preference tags, and dealbreaker chips without peer visibility.
- **Zero-Knowledge Silent Ballot (`app/circle/[id]/vote.tsx`)**: Users cast sealed voting tickets. Votes are submitted via an authentic wax seal stamp animation with physics-backed haptics.
- **What-If Compromise Simulator (`src/components/consensus/WhatIfCompromiseSlider.tsx`)**: Members slide budget ceilings in real-time on the ranked destination matrix (`app/circle/[id]/ranked-matrix.tsx`) to dynamically visualize how preference shifts yield instant supermajority consensus.

### Phase 2: In-Trip Living Manifest
- **Circle Hub & Living Manifest (`app/circle/[id]/hub.tsx`)**: Displays pinned destination brief, dynamic dates, currency code, and ongoing live trip assistant cards with daily budget tracking.
- **Veto-Aware AI Concierge (`src/components/itinerary/VetoAwareConcierge.tsx`)**: Gemini Edge AI generatesconflict-free itinerary anchors filtered against all anonymized group dealbreakers.
- **Trip Chat & Gemini AI Recommendations (`app/circle/[id]/chat.tsx`)**: Ephemeral group chat featuring Gemini place & activity spot recommendations and voice note mic triggers.
- **24/7 Safe Travel Dialers (`src/components/SafeTravelSection.tsx`)**: One-tap access to local emergency hotlines and verified transport contact dialers integrated into the trip brief (`app/circle/[id]/brief.tsx`).

### Phase 3: Post-Trip Vault
- **Past Trips Vault (`app/vault.tsx`)**: Archives historical briefs, Pact Receipts, anniversary notifications, and year-grouped memories.
- **Voice Capsules (`src/components/audio/VoiceMemoriesDrawer.tsx`)**: Mini-audio moments recorded during the trip and playable from a compact drawer.
- **Viral Pact Receipt Share Card (`src/components/export/PactReceiptCard.tsx`)**: Generates shareable, high-impact consensus receipts formatted for 1-tap export to WhatsApp and social channels.

---

## 🛠️ How We Built It (Technical Architecture)

- **Frontend & UI Engine**: Expo SDK 52 + React Native + Expo Router v4. Built with React Native Reanimated 3 physics and native Expo Haptics.
- **State Management**: Zustand multi-store architecture (`useGatherlyStore`, `useCircleStore`, `useVoteStore`, `useNotificationStore`) with persistent AsyncStorage backups.
- **Backend & Database**: Supabase PostgreSQL 15 with strict Row-Level Security (RLS) policies enforcing sealed voter privacy.
- **AI & Edge Computation**: Supabase Edge Functions coupled with Google Gemini API and local fallback heuristics.
- **In-App Subscriptions & Monetization**: RevenueCat SDK (`react-native-purchases` v10.8) powering entitlement checks and Pro Circle Inheritance.
- **Design System**: Obsidian Midnight design tokens (`#090A0F` base, `#13151E` card, `#FF5A5F` coral primary, `#3DE0A0` emerald success) with heavy geometric typography scales.

---

## 🐱 RevenueCat Integration Details & Pro Circle Inheritance

PACT leverages RevenueCat to power a unique **Multiplayer Viral Monetization Loop**:

### 1. RevenueCat SDK Integration
- Integrated `react-native-purchases` for native Android & iOS entitlement checks and sandbox purchasing.
- Direct entitlement state verification (`pro` entitlement) with graceful web fallbacks.

### 2. "Pro Circle Inheritance" Architecture
- **Problem**: In group software, forcing every member of a 10-person trip to buy a individual subscription introduces massive friction and kills viral adoption.
- **Solution**: When the trip **Circle Organizer** holds an active RevenueCat Pro subscription, all 24 invited circle members automatically **inherit Pro status** for that specific trip circle!
- **Multiplayer Growth Engine**: Non-paying guests experience premium AI Compromise Whispering, Voice Capsules, and Vault storage for free during the trip. Upon organizing their next trip, guests convert into paying organizers themselves.

---

## 🏆 Accomplishments That We're Proud Of

1. **247/247 Passing Test Suite**: 100% green test suite across 58 test suites validating consensus mathematics, RLS privacy boundaries, multi-currency formatting, and store safety.
2. **Zero-Knowledge Voting Privacy**: Fully verified math engine ensuring individual budgets and dealbreakers remain 100% secret from peers while generating accurate group rankings.
3. **Sub-16ms Animation Performance**: Silky-smooth Reanimated 3 wax seal stamping and real-time What-If compromise sliders running at native 60fps.
4. **Hermes-Safe Dynamic Currency Engine**: Seamless formatting across USD (`$`), EUR (`€`), INR (`₹`), and GBP (`£`) synced across stores without locale mismatches.

---

## 🚧 Challenges Overcome

- **React Native Render Loops in Real-Time Consensus Gauges**: Solved by decoupling raw store state updates from Reanimated shared values using derived selector hooks.
- **Hermes JavaScript Engine Compatibility**: Fixed dynamic currency and number formatting issues by implementing Hermes-safe fallback formatters for React Native mobile builds.
- **Offline-Isolated Sandbox State**: Designed a zero-network 5-Minute Judge Sandbox mode using canonical demo datasets (`circle-college-reunion-2026`) that operates flawlessly offline or online.

---

## 🛠️ Verification & Quality Assurance

- **TypeScript Typecheck**: `./node_modules/.bin/tsc --noEmit` returns **0 errors**.
- **Unit & Integration Tests**: `npm test` passes **247/247 tests**.
