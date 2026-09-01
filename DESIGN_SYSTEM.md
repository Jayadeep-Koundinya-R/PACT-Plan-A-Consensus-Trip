# PACT — Design System
**"Plan A Consensus Trip" — a travel document, not a dashboard**

This file is the source of truth for anyone (including future-you) working on PACT's UI. Every screen should be checked against this before it's considered done.

---

## 1. Design principle (read this first)

PACT is not a generic productivity app. It produces a real agreement between real people about a real trip. The UI should feel like **travel documents and a physical pact** — tickets, pages, a seal — not like a SaaS dashboard where every piece of content lives in an identical rounded card.

Two rules that matter more than any token below:
1. **Not everything is a card.** Use the Ticket and Document motifs (section 4) with intent, based on what the content actually is. Plain lists and quiet containers are fine everywhere else.
2. **One motion moment per screen, max.** Idle/looping animation is reserved for the Welcome screen's map drift. Everything else animates only in direct response to a person's action (opening, voting, finalizing).

---

## 2. Color tokens

Do not use raw hex values in screen code — always reference `colors.dark.X` / `colors.light.X` from `src/theme/colors.ts`.

| Token | Dark value | Light value | Use for |
|---|---|---|---|
| `background` | `#12182B` (Ink) | `#F6EFDE` (Parchment) | Screen background |
| `surface` | `#1A2138` | `#FFFFFF` | Document cards, inputs |
| `surfaceSubtle` | `#161D33` | `#EFE7D4` | Nested/inset areas |
| `primary` | `#C99A5B` (Brass, lightened for dark bg) | `#A97C3D` (Brass) | Primary buttons, active states, the brass accent throughout |
| `secondary` | `#2D7A75` | `#1E5C58` (Petrol) | Secondary actions, info states, map/date-related UI |
| `success` | `#5E9A64` | `#4B7A51` (Moss) | Confirmed, matched, consensus reached |
| `danger` / `seal` | `#C1503F` | `#A63D2F` (Sealing Red) | Errors AND the trip-finalized seal moment — same color, dual meaning is intentional |
| `textPrimary` | `#F3EEE2` | `#1E1A14` | Headlines, primary copy |
| `textSecondary` | `#A9A08C` | `#5C5445` | Supporting copy |
| `border` | `rgba(243,238,226,0.10)` | `#E3D9C2` | Hairlines only — never a shadow substitute |

**Never pair Parchment background with a warm-orange/terracotta accent** — that specific combination is the most common generic-AI-app look and undermines the "distinct product" impression with judges. Brass and Petrol are the only accents.

---

## 3. Typography

- **Display / headlines / Trip Brief document text:** Fraunces (serif). Use for: hero headline, screen titles, the generated Trip Brief content, destination names on ticket cards.
- **UI / body / forms / buttons:** Manrope (sans). Use for everything else — labels, inputs, nav, descriptions, numbers.
- Never mix the two within a single text block (e.g., don't set a button label in Fraunces).
- Type scale: Hero 28/34, Screen title 20/26, Card title 16/22, Body 14/20, Label/caption 11/14 (all px, size/line-height).
- No all-caps labels. No tracked-out eyebrow text above headings. If a label needs emphasis, use weight (700/800), not caps or color alone.

**Implementation:** add `@expo-google-fonts/fraunces` and `@expo-google-fonts/manrope` (pure JS/asset packages — no native linking, safe to add without a new prebuild). Load via `expo-font`'s `useFonts` in `app/_layout.tsx`, show the existing splash until loaded.

---

## 4. Component motifs

### Ticket card
For anything that represents *one option among several the group is choosing between*: ranked trip options, silent-vote items.

- Rectangular, sharp corners on 3 sides, one corner (top-right) rounded to `radius.md`
- A dashed horizontal "perforation" line runs across the card, ~28% from the left edge
- Left of the perforation: a narrow stub showing the score/consensus % in Fraunces, on a `surfaceSubtle` fill
- Right of the perforation: the main content (destination name, dates, reasoning) in Manrope
- No drop shadow — a 1px border only

### Document card
For anything that *is* a record of a decision: the Trip Brief, the preference-submission form.

- Plain rectangle, `radius.sm` (barely rounded — pages have square-ish corners)
- `surface` background, 1px `border`, **no shadow** — paper sits flat, it doesn't float
- Generous internal padding (24px+) — documents breathe
- Fraunces for any generated/summary text, Manrope for interactive form fields within it

### Everything else (nav, buttons, chips, inputs)
Stays deliberately plain and consistent — quiet supporting cast so the two motifs above are what a judge remembers.

---

## 5. Motion

- **Welcome screen only:** slow topographic contour-line drift behind the hero card. ~70s loop, opacity ≤0.08, built with `react-native-svg` paths + RN `Animated` (see `src/components/MapDriftBackground.tsx`). This is the one "characteristic first thing" a viewer sees.
- **Finalize Trip action:** a wax-seal stamp animation (scale + slight rotate-in, ~400ms, using `seal` color) plays once when a trip is finalized. This is the emotional payoff moment — the group actually agreed on something.
- No other idle motion, no hover/entrance animation on every card. If you're tempted to add a fade-in to a list, don't — it's the generic tell the skill guide explicitly warns against.

---

## 6. Screen-by-screen completeness checklist

Use this to track what still needs building or restyling. Check off as you go.

| Screen | Restyled to new system? | Missing functional pieces to add |
|---|---|---|
| Welcome / Auth | ☐ | Forgot-password link, loading skeleton instead of blank while checking session |
| Dashboard (Your Circles) | ☐ | Empty state ("no circles yet" invitation to act, not a blank screen), pull-to-refresh |
| Group Hub | ☐ | Clear "X of Y responded" always visible near the top, not buried |
| Preferences form | ☐ | Inline validation messages (not just a submit-time error), edit-after-submit before deadline |
| Ranked Options | ☐ | Explicit "Budget Division" / "Deadlock" state UI (not just a low score — a distinct screen state per the design doc's deadlock diagnostics) |
| Silent Vote | ☐ | Confirmation state after voting ("Your vote is recorded — results are private") |
| Trip Brief | ☐ | Wax-seal finalize animation, share-to-WhatsApp button, .ics export button |
| Paywall | ☐ | Real RevenueCat entitlement check wired to the "PRO ACTIVE" badge (currently decorative — see engineering note below) |
| Invite (join by code) | ☐ | Error state for invalid/expired code |
| Join Circle landing | ☐ | Preview of group name before requiring signup |

**Non-visual gaps worth fixing alongside the redesign** (not styling, but they'll show during a demo): the AI Compromise Engine currently runs no real model call despite the "AI thinking" animation — see prior engineering note; the RevenueCat "PRO ACTIVE" badge needs a real entitlement check; add a seeded demo group so the live demo never depends on typing data on camera.

---

## 7. What NOT to do

- Don't add a third card motif "to be safe" — Ticket and Document cover every real content type here.
- Don't reach for a third accent color beyond Brass/Petrol/Seal — the restraint is the point.
- Don't add idle animation to more than the one specified screen.
- Don't use `radius.card` (the old uniform rounded-corner value) on new components — it's being retired in favor of the two motifs above.
