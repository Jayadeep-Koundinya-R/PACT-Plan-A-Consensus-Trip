# Requirements Document

## Introduction

This document specifies the requirements for the PACT UI/UX Overhaul — a comprehensive restyle and engineering upgrade of the existing "Plan A Consensus Trip" React Native (Expo) application. The overhaul covers four priority areas: integrating the real RevenueCat `react-native-purchases` SDK to replace the current Zustand flag-based subscription mock; correcting the color token file to match the DESIGN_SYSTEM.md specification and loading the Fraunces and Manrope typefaces via `useFonts`; introducing a shared `ScreenHeader` component and an overflow menu for destructive member actions with consistent scroll padding; and fully restyling all ten application screens using the Ticket card motif, Document card motif, wax-seal stamp animation on trip finalization, and the Welcome screen topographic map drift animation. No features outside the existing consensus-planning flow (chat, events, polls, photos, new tabs, rebrand) are in scope.

---

## Glossary

- **App**: The PACT React Native / Expo application.
- **RevenueCat SDK**: The `react-native-purchases` npm package that provides `Purchases.configure()`, `Purchases.getCustomerInfo()`, and `Purchases.purchasePackage()` on iOS and Android native builds via EAS.
- **Entitlement**: A RevenueCat server-side entitlement object returned by `getCustomerInfo()` that confirms active Pro subscription status.
- **PaywallScreen**: `app/paywall.tsx` — the subscription upgrade screen.
- **ScreenHeader**: A shared React Native component responsible for rendering the PACT brand bar, back button, and theme toggle consistently across all screens.
- **OverflowMenu**: A component presenting destructive or secondary member-level actions (e.g., remove member, delete group) behind a `•••` icon, separate from primary CTA buttons.
- **Ticket Card**: A component motif for items representing one option among several: rectangular with three sharp corners, one rounded corner (top-right, `radius.md`), a dashed perforation line ~28% from the left, a narrow stub on the left, and main content on the right. No drop shadow — 1 px border only.
- **Document Card**: A component motif for records of a decision or form sections: plain rectangle, `radius.sm`, `surface` background, 1 px border, no shadow, generous internal padding (≥24 px).
- **SealStamp**: The wax-seal stamp animation that plays once when a trip is finalized — scale-in with a slight rotation, ~400 ms, using the `seal` color token.
- **MapDriftBackground**: An SVG-based topographic contour-line animation displayed on the Welcome/Auth screen only — ~70 s loop, opacity ≤ 0.08, implemented with `react-native-svg` + RN `Animated`.
- **colors.ts**: `src/theme/colors.ts` — the single source of truth for all color tokens consumed by screen and component files.
- **DESIGN_SYSTEM.md**: The design specification at the workspace root that defines color tokens, typography, component motifs, and motion rules.
- **EAS**: Expo Application Services — the build infrastructure used to produce native iOS and Android builds.
- **Fraunces**: The serif Google Font used for display text, trip brief content, and destination names.
- **Manrope**: The sans-serif Google Font used for all UI elements, body copy, labels, and buttons.
- **useFonts**: The `expo-font` hook used to load custom fonts in `app/_layout.tsx`.
- **`_layout.tsx`**: `app/_layout.tsx` — the root layout file where global font loading and providers are initialized.

---

## Requirements

### Requirement 1 — RevenueCat SDK Integration (P1)

**User Story:** As a user purchasing PACT Pro, I want my subscription status to be verified against a real payment provider so that I receive the entitlements I paid for.

#### Acceptance Criteria

1. THE App SHALL declare `react-native-purchases` as a production dependency in `package.json` with an exact pinned version.
2. WHEN the App initializes on iOS, THE App SHALL call `Purchases.configure({ apiKey: IOS_RC_KEY })` before any screen renders.
3. WHEN the App initializes on Android, THE App SHALL call `Purchases.configure({ apiKey: ANDROID_RC_KEY })` before any screen renders.
4. WHEN `PaywallScreen` mounts, THE App SHALL call `Purchases.getCustomerInfo()` and derive Pro status from the returned `CustomerInfo.entitlements.active` object.
5. WHEN a user taps the upgrade button in `PaywallScreen`, THE App SHALL call `Purchases.purchasePackage(selectedPackage)` with the package corresponding to the user's selected billing cycle.
6. WHEN `Purchases.purchasePackage()` resolves successfully, THE App SHALL update the Zustand `subscriptionPlan` state to reflect the active entitlement identifier returned by RevenueCat.
7. IF `Purchases.purchasePackage()` rejects with a user-cancellation error, THEN THE App SHALL dismiss the loading state and return to `PaywallScreen` without displaying an error message.
8. IF `Purchases.purchasePackage()` rejects with a non-cancellation error, THEN THE App SHALL display an inline error message in `PaywallScreen` describing the failure.
9. WHEN a user taps "Restore Purchases" in `PaywallScreen`, THE App SHALL call `Purchases.restorePurchases()` and update the Zustand `subscriptionPlan` state from the restored `CustomerInfo`.
10. WHILE a `Purchases` async call is in-flight, THE App SHALL display a loading indicator in `PaywallScreen` and disable all purchase-action buttons.
11. THE App SHALL NOT store RevenueCat API keys as plain string literals in committed source files; API keys SHALL be read from environment variables or EAS secrets at build time.

---

### Requirement 2 — Color Token Correction and Font Loading (P2)

**User Story:** As a developer maintaining PACT, I want `colors.ts` to exactly match DESIGN_SYSTEM.md and fonts to load at app start so that every screen renders the intended visual identity without runtime font-fallback or off-spec colors.

#### Acceptance Criteria

1. THE App SHALL define the `dark.background` token in `colors.ts` as `#12182B`.
2. THE App SHALL define the `light.background` token in `colors.ts` as `#F6EFDE`.
3. THE App SHALL define the `dark.primary` token in `colors.ts` as `#C99A5B`.
4. THE App SHALL define the `light.primary` token in `colors.ts` as `#A97C3D`.
5. THE App SHALL define the `dark.secondary` and `light.secondary` tokens in `colors.ts` as the Petrol values `#2D7A75` and `#1E5C58` respectively.
6. THE App SHALL define a `seal` token in both `dark` and `light` objects in `colors.ts` — `#C1503F` for dark and `#A63D2F` for light.
7. THE App SHALL define the `dark.success` token as `#5E9A64` and the `light.success` token as `#4B7A51`.
8. THE App SHALL remove all color token values that deviate from DESIGN_SYSTEM.md, including the `#EA580C` terracotta value currently assigned to `primary`.
9. WHEN `_layout.tsx` mounts, THE App SHALL call `useFonts` with both `Fraunces_400Regular` and `Manrope_400Regular`, `Manrope_700Bold`, and `Manrope_800ExtraBold` font variants.
10. WHILE the fonts loaded by `useFonts` are not yet ready, THE App SHALL keep the splash screen visible and SHALL NOT render any application screens.
11. WHERE a text element carries display or trip-brief content (hero headlines, screen titles, destination names, Trip Brief body copy), THE App SHALL apply the Fraunces font family.
12. WHERE a text element carries UI copy (labels, descriptions, buttons, inputs, numbers, navigation), THE App SHALL apply the Manrope font family.
13. THE App SHALL NOT mix Fraunces and Manrope within a single `Text` element.

---

### Requirement 3 — Shared ScreenHeader, Overflow Menu, and Scroll Padding (P3)

**User Story:** As a user navigating PACT, I want consistent screen headers and safe scroll padding across all screens so that the brand feels cohesive and no content is obscured by the floating tab bar.

#### Acceptance Criteria

1. THE App SHALL provide a `ScreenHeader` component at `src/components/ScreenHeader.tsx` that accepts `title`, `subtitle`, `onBack`, and `rightSlot` props and renders the PACT brand bar layout.
2. WHEN any of the ten application screens renders its header, THE App SHALL use the `ScreenHeader` component instead of an inline `View`-based header implementation.
3. THE `ScreenHeader` component SHALL render the back button only when the `onBack` prop is provided.
4. THE `ScreenHeader` component SHALL render the `ThemeToggle` in the right slot by default when no `rightSlot` prop is provided.
5. THE App SHALL apply `paddingHorizontal: 20` and `paddingBottom: 90` to the `contentContainerStyle` of every `ScrollView` in the ten application screens.
6. THE App SHALL provide an `OverflowMenu` component that renders a `•••` icon button and displays destructive or secondary actions in a modal bottom sheet when tapped.
7. WHEN the Group Hub screen (`app/groups/[id]/index.tsx`) needs to expose "Delete Trip Circle" or "Leave Circle" actions, THE App SHALL place these actions inside the `OverflowMenu` component rather than as inline buttons in the main scroll content.
8. WHEN the `OverflowMenu` presents a destructive action, THE App SHALL render the action label in the `danger` color token.
9. WHEN a user taps a destructive action inside the `OverflowMenu`, THE App SHALL display a confirmation `Alert` before executing the action.
10. THE `OverflowMenu` SHALL close when the user taps outside the bottom sheet or taps a cancel option.

---

### Requirement 4 — Full Restyle: Ticket Card Motif (P4-a)

**User Story:** As a user reviewing ranked trip options or casting a vote, I want option cards to look like physical travel tickets so that the act of choosing feels deliberate and meaningful.

#### Acceptance Criteria

1. WHEN a ranked trip option is rendered in `app/groups/[id]/options.tsx`, THE App SHALL render the option using the Ticket Card motif: three sharp corners and one rounded top-right corner at `radius.md`, a dashed perforation line ~28% from the left edge, a stub on the left showing consensus percentage in Fraunces, and option detail content on the right in Manrope.
2. WHEN a trip option is rendered in the Silent Vote screen (`app/groups/[id]/vote.tsx`), THE App SHALL render the top-pick option using the Ticket Card motif.
3. THE Ticket Card SHALL use a 1 px `border` and SHALL NOT apply any drop shadow.
4. WHEN the consensus percentage displayed in the Ticket Card stub reaches or exceeds 70%, THE App SHALL apply the `success` color token to the stub score text.
5. WHEN the consensus percentage displayed in the Ticket Card stub is below 70%, THE App SHALL apply the `primary` color token to the stub score text.
6. THE App SHALL NOT render the Ticket Card motif for content types other than "one option among several being chosen".

---

### Requirement 5 — Full Restyle: Document Card Motif (P4-b)

**User Story:** As a user reviewing or filling in trip-planning forms and the final Trip Brief, I want form sections and decision records to feel like physical documents so that submitted data feels official and trustworthy.

#### Acceptance Criteria

1. WHEN the Preferences screen (`app/groups/[id]/preferences.tsx`) renders form sections (date range, budget, vibes, dealbreakers), THE App SHALL render each section as a Document Card: plain rectangle, `radius.sm`, `surface` background, 1 px `border`, no shadow, and internal padding ≥ 24 px.
2. WHEN the Trip Brief screen (`app/groups/[id]/brief.tsx`) renders the finalized trip summary, THE App SHALL render the summary in a Document Card.
3. WHEN the Paywall screen (`app/paywall.tsx`) renders feature highlights or pricing information, THE App SHALL render each block as a Document Card.
4. THE Document Card SHALL NOT apply `radius.card` or any shadow style.
5. WHERE a Document Card contains generated or summary text (destination name, dates, budget figure), THE App SHALL render that text in the Fraunces font family.
6. WHERE a Document Card contains interactive form fields or button labels, THE App SHALL render those elements in the Manrope font family.

---

### Requirement 6 — Full Restyle: SealStamp Animation (P4-c)

**User Story:** As a user whose group has finalized a trip, I want to see a wax-seal stamp animation the moment consensus is locked so that the emotional payoff of reaching agreement is clearly communicated.

#### Acceptance Criteria

1. WHEN the Trip Brief screen (`app/groups/[id]/brief.tsx`) mounts with a finalized trip, THE App SHALL play the `SealStamp` animation exactly once.
2. THE `SealStamp` animation SHALL use a scale-in combined with a slight rotation entrance, completing within 400 ms.
3. THE `SealStamp` animation SHALL use the `seal` color token (`#A63D2F` light / `#C1503F` dark) for the stamp fill.
4. THE `SealStamp` animation SHALL NOT loop and SHALL NOT play again unless the component is fully unmounted and remounted.
5. THE App SHALL NOT display any other looping or idle animation on the Trip Brief screen.

---

### Requirement 7 — Full Restyle: MapDriftBackground Animation (P4-d)

**User Story:** As a first-time user arriving at the Welcome/Auth screen, I want to see a subtle animated topographic background so that PACT feels distinctive and craft-forward from the very first moment.

#### Acceptance Criteria

1. THE App SHALL provide a `MapDriftBackground` component at `src/components/MapDriftBackground.tsx` implemented with `react-native-svg` paths and React Native `Animated`.
2. WHEN the Welcome/Auth screen (`app/auth.tsx`) renders, THE App SHALL display the `MapDriftBackground` component behind all other UI elements.
3. THE `MapDriftBackground` animation loop duration SHALL be approximately 70 seconds per cycle.
4. THE `MapDriftBackground` path opacity SHALL not exceed 0.08.
5. THE `MapDriftBackground` SHALL use the `primary` color token for path stroke color.
6. THE App SHALL NOT render `MapDriftBackground` on any screen other than the Welcome/Auth screen.
7. THE App SHALL NOT add any other idle or looping animation to screens other than the Welcome/Auth screen.

---

### Requirement 8 — Full Restyle: All Ten Screens (P4-e)

**User Story:** As a user navigating PACT, I want every screen to use the corrected color palette, Fraunces/Manrope typography, and the appropriate card motifs so that the app presents a consistent and differentiated visual identity across the entire consensus-planning flow.

#### Acceptance Criteria

1. THE App SHALL apply the corrected `colors.ts` tokens (Ink, Parchment, Brass, Petrol, Seal, Moss) to all ten screens: Welcome/Auth, Dashboard, Group Hub, Preferences, Ranked Options, Silent Vote, Trip Brief, Paywall, Invite/Join Circle landing, and the root index.
2. WHEN any screen renders in light mode, THE App SHALL use `light.background` (`#F6EFDE`) as the screen background color.
3. WHEN any screen renders in dark mode, THE App SHALL use `dark.background` (`#12182B`) as the screen background color.
4. THE App SHALL NOT use any raw hex value in screen or component files that is not defined in `colors.ts`.
5. THE App SHALL NOT use `#EA580C`, `#F97316`, or any other orange-terracotta value on any screen.
6. WHEN any screen renders a primary action button, THE App SHALL apply the `primary` color token as the button background.
7. WHEN the Ranked Options screen renders a deadlock or budget-division state, THE App SHALL display a visually distinct state card using the `danger` color token border — separate from the normal low-score ranked list.
8. WHEN the Silent Vote screen renders after a user has cast a vote, THE App SHALL display a confirmation banner indicating that the vote is recorded and results are private.
9. WHEN the Welcome/Auth screen renders, THE App SHALL display a loading skeleton in place of content while the authentication session is being checked, rather than a blank screen.
10. WHEN the Group Hub screen renders, THE App SHALL display the "X of Y travelers responded" count in a prominent position near the top of the scroll content, not buried below the action cards.
11. THE App SHALL NOT introduce `radius.card` on any newly styled component; the Ticket Card and Document Card motifs SHALL replace all generic rounded-card patterns.
