# 🌴 GATHERLY — Trip Consensus App
> **Shipathon 2026 (RevenueCat)** — Next Gen Award (Student Track)  
> *Turn "we should go somewhere" into a real confirmed trip plan.*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-v52-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20Postgres-3ECF8E.svg?style=flat&logo=supabase)](https://supabase.com)
[![RevenueCat](https://img.shields.io/badge/RevenueCat-In--App%20Subscriptions-E85D04.svg?style=flat&logo=revenuecat)](https://revenuecat.com)

---

## 📖 1. Overview & Problem Statement

**The Problem:** Groups of 8–12 friends and family want to travel together, but everyone has conflicting date availabilities, different budget caps, varying activity preferences, and unspoken dealbreakers. Today, negotiations drag on for weeks in messy WhatsApp group chats. Plans stall, someone unilaterally books something that breeds resentment, or the trip simply never happens.

**The Solution:** Gatherly is a private, zero-guilt decision-phase tool:
1. **Privately collects constraints** (dates, min/max budget, tags, dealbreakers).
2. **Deterministically scores and ranks trip options** with plain-English breakdowns.
3. **Enables Silent Voting** where members privately approve options and only aggregate consensus percentages are visible.
4. **Auto-generates a shareable Trip Brief** once consensus is reached.

---

## 🎯 2. Critical Design Principles

1. **Deterministic Ranking:** Date overlap %, Budget fit %, and Tag match % use exact mathematical scoring. AI is strictly layered on top for plain-English prose enhancement.
2. **Truly Silent Voting:** Individual voting ballots are never exposed to other members. Only group consensus percentages are visible.
3. **Ghost Members Never Poison Averages:** Scoring calculations only evaluate members who have submitted their private preferences (e.g., "5 of 5 responded").
4. **Explicit Budget Gap Flagging:** If >30% of members cannot afford an option, the system flags a visible `Budget Division` warning rather than masking it behind a composite score.
5. **Deadlock State Diagnostics:** If no option reaches the ~70% threshold, Gatherly diagnoses the root cause (`budget_gap`, `date_conflict`, `dealbreakers`, or `split_support`) and provides organizer recommendations.

---

## 🧮 3. Consensus Engine Formula

```
Member Score = (Date Score × 0.35) + (Budget Score × 0.35) + (Tag Score × 0.25)
If Dealbreaker Triggered: Member Score = 0 (Override)
```

- **Date Overlap Score (35%):**  
  `max(overlap_days across member ranges) / trip_duration` (capped at `1.0`)
- **Budget Fit Score (35%):**  
  - Trip cost within `[budgetMin, budgetMax]` $\rightarrow$ `1.0`  
  - Trip cost $< budgetMin$ $\rightarrow$ `tripCost / budgetMin`  
  - Trip cost $> budgetMax$ $\rightarrow$ `0.0` (cannot afford)
- **Tag Match Score (25%):**  
  `|member_tags ∩ trip_tags| / |member_tags|`
- **Dealbreaker Override:**  
  If any dealbreaker keyword matches trip characteristics $\rightarrow$ Member Score drops to `0`.
- **Consensus Percentage:**  
  `members where (dateScore > 0 && budgetScore > 0 && !dealbreakerHit) / responding_members × 100`

---

## 🏖️ 4. Demo Scenario: College Friends Beach Trip

### The 5 Members & Constraints:
| Member | Preferred Dates | Budget | Tags | Dealbreakers |
|---|---|---|---|---|
| **Maya** *(Organizer)* | Jul 10–15, Jul 25–30 | $400–$900 | Beach, Relaxed | Hiking, Cold |
| **Jake** | Jul 12–20, Aug 1–10 | $1000–$2500 | Active, Beach, Hiking | City |
| **Priya** | Jul 8–14 | $300–$700 | Budget-conscious, Relaxed, Beach | Expensive |
| **Alex** | Jul 10–25 | $800–$2000 | City, Culture, Active | Isolated |
| **Sam** | Jul 15–28, Aug 5–15 | $600–$1500 | Beach, Active, Budget-conscious | *None* |

### Scored Trip Options:
1. **🏆 Goa Beach Weekend (Winner):** Score **74.24%** | Consensus **100%**  
   *Reason: Fits all 5 member budgets and date ranges with great beach/relaxed tag match and zero dealbreakers.*
2. **#2 Kerala Backwaters Chill:** Score **53.00%** | Consensus **60%** (Budget Gap Flagged)  
   *Reason: Over budget for 2 (Priya, Maya) and no date overlap for 2.*
3. **#3 Manali Mountain Trek:** Score **48.67%** | Consensus **60%**  
   *Reason: Triggers "hiking/cold" dealbreaker for Maya.*
4. **#4 Bangalore City Break:** Score **48.67%** | Consensus **40%**  
   *Reason: Triggers "city" dealbreaker for Jake.*

---

## 🛠️ 5. Tech Stack

- **Frontend:** Expo SDK 52 + React Native + Expo Router v4
- **State Management:** Zustand
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security & Functions)
- **Monetization:** RevenueCat (Student / Next Gen Award Track)
- **Icons & Theme:** Lucide React Native + Curated Light/Dark Palette
- **Language:** TypeScript 5.3

---

## 🚀 6. Quick Start & Verification

### 1. Run Unit Tests (Built-in Node Test Runner)
```bash
npm test
```

### 2. Run the Consensus Engine Demo Script
```bash
npm run verify-demo
```

### 3. Launch the Expo App
```bash
# Web preview
npm run web

# Mobile (iOS / Android)
npm start
```

---

## 🗄️ 7. Database Schema (Supabase)

The complete SQL schema and Row Level Security definitions are located in [`supabase/schema.sql`](supabase/schema.sql).

### Key Tables:
- `profiles`: User information extending Supabase Auth.
- `groups`: Circles with unique invite codes (e.g. `GOA-2026`).
- `group_members`: Member membership and roles.
- `preferences`: Private per-member constraints with RLS restricting access to the owner only.
- `trip_options`: Candidate destinations and cached scoring results.
- `votes`: Private votes aggregated securely without exposing ballots.
- `trip_briefs`: Finalized trip agreements and shareable details.
- `subscriptions`: RevenueCat entitlement sync.

---

## 📜 8. License

This project is licensed under the [MIT License](LICENSE).
