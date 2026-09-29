# PACT - Master Product Requirements Document (Target: Next Gen Hackathon)

## 1. Strict Demo Data Isolation
- **The Bug:** Demo data (Maya, Jake, random percentages) is bleeding into real screens.
- **The Fix:** Ensure `useDemoMode` strictly gates ALL demo data. Real users logging in must see a 100% clean state. Demo data is ONLY loaded if the user clicks "⚡ Try 5-Min Judge Sandbox" from the landing page.

## 2. Global Multi-Currency Support
- **Requirement:** During "Create a New Trip", users must be able to select ANY global currency (USD, INR, EUR, GBP, JPY, AUD, etc.). 
- **The Fix:** Use `21st.dev` / `UI/UX Pro Max` to drop in a sleek, searchable Country/Currency Select component. Store the `currency_code` in the Supabase `circles` table and format all budget displays across the app using this code.

## 3. The "Dead-End" Fix: Replacing Flight Booking with Living Manifest & Memories
- **The Bug:** After creating a trip, the app gets stuck on a legacy "flight booking / uploading" screen which feels incomplete.
- **The Fix:** Delete the legacy flight booking screen entirely. 
- **New Architecture:** Once a trip is created, route the user to the **Circle Hub**. The Hub has 3 phases:
  1. **Pre-Trip (Consensus Room):** Voting, What-If Slider, AI Whisperer.
  2. **In-Trip (Living Manifest):** Pinned dates, AI spots, Verified Transport contacts, and real-time Chat.
  3. **Post-Trip (Memories/Vault):** A gorgeous photo grid and voice capsule timeline (using Framer Motion layout animations) where users upload trip photos.

## 4. Real-Time Chat Polish
- **Requirement:** A flawless, WhatsApp-style real-time chat for the circle.
- **The Fix:** Ensure Supabase Realtime subscriptions are active on the `messages` table. Style it with UI/UX Pro Max for a premium, native feel (chat bubbles, timestamps, auto-scroll to bottom).

## 5. Ubiquitous "Aha!" Moments (Framer Motion)
- Use `framer-motion` for tactile interactions:
  - Spring-physics when casting a vote.
  - The "Crimson Wax Seal" slamming down when consensus is reached.
  - Smooth page transitions and list staggered animations (Memories photo grid).