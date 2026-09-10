# 🌴 PACT — Plan A Consensus Trip
> **Shipathon 2026 (RevenueCat)** — Next Gen Award Track  
> *Turn "we should go somewhere" into a real confirmed trip plan.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-v52-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com)
[![RevenueCat](https://img.shields.io/badge/RevenueCat-In--App%20Subscriptions-E85D04.svg?style=flat&logo=revenuecat)](https://revenuecat.com)
[![Tests](https://img.shields.io/badge/Tests-116%2F116%20Passing-brightgreen.svg)](package.json)

---

## 📖 1. Overview & Problem Statement

**The Problem:** Groups of friends and family want to travel together, but conflicting dates, different budget caps, varying vibe preferences, and unspoken dealbreakers stall planning for weeks in chaotic WhatsApp group chats. Either someone unilaterally books something that breeds resentment, or the trip never happens.

**The Solution:** PACT is a private, zero-guilt consensus platform:
1. **Privately collects sealed constraints** (dates, budget bands, vibes, dealbreakers) without peer pressure.
2. **Deterministically scores and ranks destinations** using a mathematical formula where ghost members never poison averages.
3. **Resolves deadlocks with AI** through an **AI Compromise Whisperer** operating strictly on anonymized, aggregated bucket data.
4. **Conducts Silent Voting** with an authentic wax seal stamp animation where individual ballots remain strictly secret.
5. **Locks consensus** (70% supermajority threshold required to finalize; 100% unanimous agreement unlocks golden payoff celebration) and generates an exportable **Trip Brief** shareable back to WhatsApp in one tap.

---

## 🏗️ 2. System Architecture

```
                       +-----------------------------------+
                       |         User Interfaces           |
                       |  iOS / Android App | Web Preview  |
                       +-----------------+-----------------+
                                         |
                       +-----------------v-----------------+
                       |       Zustand Reactive Store       |
                       | (useCircleStore, useVoteStore)    |
                       +--------+-----------------+--------+
                                |                 |
         +----------------------v--+           +--v---------------------+
         | Deterministic Consensus |           | Live Edge AI Services  |
         |    Scoring Engine       |           | Supabase Edge Function |
         | (Dates 35%, Budget 35%, |           |     (ai-advisor)       |
         |  Tags 25%, Dealbreakers)|           |     + Gemini API       |
         +-------------------------+           +------------+-----------+
                                                            |
                       +------------------------------------v--+
                       |              Supabase Backend         |
                       |  PostgreSQL 15 + Row Level Security   |
                       |  Aggregated Functions + Realtime Sync |
                       +--------------------+------------------+
                                            |
                       +--------------------v------------------+
                       |      RevenueCat Subscriptions         |
                       |  Mobile Native Purchases + Webhooks   |
                       |  Pro Circle Inheritance to All Guests |
                       +---------------------------------------+
```

### Architectural Guarantees:
- **Privacy-First Vault**: Individual budgets and personal dealbreakers are protected by Supabase Row-Level Security (RLS) policies. Only the ballot creator can view raw entries.
- **Anonymized AI Whispering**: The Gemini Edge Function receives only aggregated data buckets (e.g. *"2 members capped at $600, 3 at $1,200"*). Zero individual names or veto details are ever sent to external LLMs.
- **Fail-Safe Client Caching**: All AI endpoints feature an in-memory cache and a strict **3.5-second timeout** with instant local market-index fallbacks so the UI never blocks.
- **Pro Circle Inheritance**: When a circle organizer holds an active RevenueCat Pro subscription, all invited friends automatically inherit Pro perks for that trip circle.

---

## ✨ 3. Feature Matrix

| Feature | Description | Privacy Guarantee |
|---|---|---|
| **Invite Codes** | Short random codes (`GOA-4F82`) for closed, trusted trip circles. | RLS and invite-only membership; the code is the reliable join fallback. |
| **Sealed Constraints** | Date availability ranges, budget slider, and dealbreaker chips. | Stored privately; never shared with peers. |
| **AI Budget Advisor** | Dynamic typical destination budget range near slider. | Live Gemini estimate with instant fallback. |
| **Deterministic Matrix** | Mathematical scoring of candidate destinations with plain-English breakdowns. | Ghost members never poison averages. |
| **AI Compromise Whisperer** | Detects deadlocks and proposes fair villa/itinerary compromises. | Operates on anonymized buckets only. |
| **Silent Ballot & Wax Seal** | Secret voting tickets with animated wax seal stamp. | Ballots are sealed; only % consensus is shown. |
| **Trip Brief** | Sealed agreement with dates, cost split, and 1-tap WhatsApp export. | Unshakeable post-consensus confirmation. |
| **Archive Circles** | Active vs Archived dashboard tabs with 1-tap Archive and Restore. | Keeps dashboard clean and focused. |
| **Push Notifications** | Generic reminders (*"A member hasn't responded yet"*). | Privacy engine strictly blocks financial numbers. |
| **Trip Vault & Memories** | Shared documents, booking codes, and photo library with attribution. | Available offline with pre-seeded fallbacks. |

---

## 🧮 4. Consensus Engine Scoring Formula

$$\\text{Member Score} = (\\text{Date Score} \\times 0.35) + (\\text{Budget Score} \\times 0.35) + (\\text{Tag Score} \\times 0.25)$$

- **Dealbreaker Override**: If any dealbreaker keyword matches trip characteristics, the member's score immediately drops to `0.0`.
- **Date Overlap Score (35%)**: Max overlapping days divided by trip duration.
- **Budget Fit Score (35%)**:
  - Trip cost within $[\\text{min}, \\text{max}] \\rightarrow 1.0$
  - Trip cost $< \\text{min} \\rightarrow \\text{trip cost} / \\text{budget min}$
  - Trip cost $> \\text{max} \\rightarrow 0.0$ (disqualified for that member)
- **Tag Match Score (25%)**: Jaccard similarity across selected vibe tags.
- **Supermajority Rule**: If an individual veto blocks an otherwise unanimous trip, an 80% supermajority vote unlocks a soft override with guaranteed accommodations.

---

## 💳 5. Monetization (RevenueCat Integration)

PACT incorporates a sustainable, fair monetization model powered by RevenueCat:

- **Free Tier**: Up to 1 active trip circle and 5 members, standard destination scoring, basic Trip Brief.
- **PACT Organizer Pass** ($9.99 per trip, up to 10 members):
  - Only the organizer pays; invited members join free.
  - AI Compromise Whisperer & AI Budget Advisor live calls.
  - **Circle Inheritance**: When the organizer has Pro, all invited circle members get Pro features for that trip.
- **Cross-Platform Resilience**: Web preview explains that purchases are available in the mobile app. Native billing must be verified in the RevenueCat sandbox before calling the purchase flow production-ready.

---

## 🛠️ 6. Tech Stack

- **Framework**: Expo SDK 52 + React Native + Expo Router v4
- **State Management**: Zustand
- **Animations**: React Native Reanimated 3 + Expo Haptics
- **Backend & Database**: Supabase (PostgreSQL 15 with Row Level Security)
- **AI Services**: Supabase Edge Functions + Google Gemini API (with local fallback heuristics)
- **Subscriptions**: RevenueCat In-App Purchases & Webhook Handlers
- **Deployment**: Vercel (Web Preview) + EAS Build (Android APK / iOS)
- **Language**: TypeScript 5.3

---

## 🔥 7. Quick Start for Judges (Run Locally in 3 Steps)

### Prerequisites:
- Node.js 18+ installed on your machine.
- Git.

### Environment Configuration (Optional)
PACT runs immediately in resilient demo mode out-of-the-box. To connect your own Supabase instance or RevenueCat sandbox:
```bash
cp .env.example .env
# Edit .env with your EXPO_PUBLIC_SUPABASE_URL, ANON_KEY, and RC keys
```

### Step 1: Clone and Install Dependencies
```bash
git clone https://github.com/Jayadeep-Koundinya-R/PACT-Plan-A-Consensus-Trip.git
cd PACT-Plan-A-Consensus-Trip
git checkout pre-submission-review
npm install
```

### Step 2: Run the Automated Regression Test Suite
Run the 116-test suite validating scoring, privacy guards, webhooks, AI fallbacks, and the design-system tokens:
```bash
npm test
```
*Expected output: 116 passed across 26 suites.*

### Step 3: Launch Web Preview
```bash
npm run web
```
Open **`http://localhost:8081`** in your browser to test the full consensus experience.

---

## 🔮 8. What's Next (Roadmap & Explicit Non-Goals)

### Lightweight "Add People" Invite Flow & Unified Sharing
PACT replaces cumbersome user searches with a lightweight **Circle Hub Invite Flow**:
- **Native OS Sharing**: Organizers tap **+ Add People** on the Circle Hub to immediately trigger pre-filled invitations via **WhatsApp**, **Messages (SMS)**, **Email**, or the native **Device Share Sheet** (AirDrop, Slack, Telegram).
- **Invite Code Fallback**: The invite code is the reliable join method. The `pact://join/{code}` app link may open an installed app, but no public HTTPS invite domain is assumed.
- **Unified Sharing Hook (`useShareInvite`)**: All WhatsApp and share touchpoints across the app (Trip Brief export, Hub invites, bulk group nudges, and QR passes) share a single hardened, privacy-compliant hook.

---

### Explicit Architectural Non-Goals (Scope Boundaries)

To preserve PACT's private, invite-only architecture, the following features were **strictly and intentionally excluded**:

### 1. Central User Directory & Public User Search (Explicit Non-Goal)
- **Why excluded:** PACT is built around access-controlled, invite-only circles. Having a searchable central directory or user catalog would expose member identities, travel schedules, and circle affiliations to strangers. Circles use short random invite codes (`GOA-4F82`).
- **Roadmap consideration:** Mutual, double-opt-in contact book hashing where both parties must have each other's phone number before any discovery occurs.

### 2. Friend-Request & Social Graph System (Explicit Non-Goal)
- **Why excluded:** PACT trips are organized among real-world friends, family, and colleagues who already communicate on WhatsApp, iMessage, or Slack. Introducing a social networking graph with friend requests adds unnecessary onboarding friction and spam.

### 3. Public Circle Discovery & Open Stranger Trips (Roadmap)
- **Why excluded now:** Group travel consensus succeeds because participants navigate shared budgets with mutual goodwill. Opening circles to public internet strangers dilutes ballot authenticity and compromises sealed privacy.
- **Future implementation:** Curated solo traveler circles with identity-verified deposits and reputation escrow.

### 2. Public Circle Discovery & Open Stranger Trips (Roadmap)
- **Why excluded now:** Group travel consensus works because participants are real friends/colleagues navigating shared budgets and genuine constraints. Opening circles to public internet strangers dilutes ballot authenticity and compromises sealed privacy.
- **Future implementation:** Curated solo traveler circles with identity-verified deposits and reputation escrow.

### 3. Integrated Split Payments (Stripe / Splitwise / UPI)
- Direct payment deep-links triggered from the locked **Trip Brief** to settle shared deposits (villas, rental cars) automatically honoring the consensus tiered budget splits.

### 4. Direct Calendar Integration
- 1-tap .ics / Google Calendar / Apple Calendar sync for confirmed trip dates once 100% consensus is reached.

---

## 📜 9. License

This project is licensed under the [MIT License](LICENSE).
