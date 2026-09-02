# Implementation Plan: PACT UI/UX Overhaul

## Overview

Eight sequential priority groups deliver the full overhaul: RevenueCat SDK wiring (P1), color token correction and font loading (P2), shared header/overflow/scroll-padding system (P3), animation components (P4), Ticket Card motif (P5), Document Card motif across six screens (P6), restyle of the remaining three screens (P7), and Auth skeleton + Group Hub tracker prominence (P8). Each group is independently executable and must not break existing Zustand state, the consensus engine, Supabase calls, or navigation.

---

## Tasks

- [x] 1. P1 — RevenueCat SDK Integration
  - [x] 1.1 Install `react-native-purchases` as a pinned production dependency
    - Run `npx expo install react-native-purchases` and pin the exact resolved version in `package.json`
    - Confirm `"react-native-purchases": "X.Y.Z"` (exact, no `^`) appears in `dependencies`
    - _Requirements: 1.1_

  - [x] 1.2 Create `src/lib/purchases/config.ts` — SDK init helper
    - Export `initPurchases(): void` that reads `EXPO_PUBLIC_RC_IOS_KEY` and `EXPO_PUBLIC_RC_ANDROID_KEY` from `process.env`
    - Call `Purchases.configure({ apiKey: key })` only when key is non-empty (graceful no-op for Expo Go / web)
    - No literal API key strings anywhere in the file
    - _Requirements: 1.2, 1.3, 1.11_

  - [x] 1.3 Create `src/lib/purchases/customerInfo.ts` — entitlement derivation
    - Move `SubscriptionPlan` type from `src/lib/revenuecat/entitlements.ts` into this file (re-export from entitlements.ts to avoid breaking imports)
    - Export `deriveSubscriptionPlan(info: CustomerInfo): SubscriptionPlan` — returns `'free'` when `pro_access` entitlement absent; `'premium_annual'` when `productIdentifier` contains `'annual'`; `'premium_monthly'` otherwise
    - Pure function, no side effects, no imports from the store
    - _Requirements: 1.4, 1.6_

  - [ ]* 1.4 Write property test for `deriveSubscriptionPlan`
    - **Property 1: Subscription Plan Derivation from Entitlement**
    - **Validates: Requirements 1.4, 1.6, 1.9**
    - Use Node's built-in test runner (matches existing `package.json` `test` script pattern)
    - Cover: absent entitlement → `'free'`; active + `'annual'` → `'premium_annual'`; active + non-annual → `'premium_monthly'`

  - [x] 1.5 Extend `useGatherlyStore` with RevenueCat state slice
    - Add `isCheckingEntitlement: boolean` and `purchaseError: string | null` fields to `GatherlyState`
    - Add setter actions `setIsCheckingEntitlement` and `setPurchaseError`
    - Import `SubscriptionPlan` from `src/lib/purchases/customerInfo.ts` (remove duplicate inline union if present)
    - Existing `setSubscriptionPlan` action remains unchanged
    - _Requirements: 1.10_

  - [x] 1.6 Wire `initPurchases()` into `app/_layout.tsx`
    - Import `initPurchases` from `src/lib/purchases/config`
    - Import `useFonts` stubs (placeholder — fonts are wired properly in task 2.2)
    - Call `initPurchases()` inside a `useEffect` that fires after the component mounts (guarded: only call after fonts are ready in task 2.2)
    - Existing `RootErrorBoundary` and `Stack` navigator are left intact
    - _Requirements: 1.2, 1.3_

  - [x] 1.7 Rewrite `app/paywall.tsx` purchase logic with RevenueCat SDK calls
    - Replace mock `handleSubscribe` / `handleRestore` with real `Purchases.getCustomerInfo()`, `Purchases.purchasePackage()`, `Purchases.restorePurchases()` calls
    - On mount: call `getCustomerInfo()`, derive plan via `deriveSubscriptionPlan`, call `setSubscriptionPlan`
    - `handleSubscribe`: set `isLoading = true`, fetch offerings, call `purchasePackage(pkg)`, on success call `setSubscriptionPlan` then `router.back()`; on `purchaseCancelledError` dismiss loading silently; on other errors call `setPurchaseError(message)`
    - `handleRestore`: call `restorePurchases()`, call `setSubscriptionPlan` on success, catch to `setPurchaseError`
    - All purchase buttons disabled while `isLoading` is true; inline error banner shown when `purchaseError` is set
    - Existing UI markup and styling are preserved in this step
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

- [x] 2. Checkpoint — P1 complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. P2 — Color Tokens and Font Loading
  - [x] 3.1 Rewrite `src/theme/colors.ts` with corrected Ink/Parchment/Brass/Petrol/Seal/Moss tokens
    - Replace `dark.background` with `#12182B`, `light.background` with `#F6EFDE`
    - Replace `dark.primary` / `light.primary` with `#C99A5B` / `#A97C3D` (remove all `#EA580C` values)
    - Replace `dark.secondary` / `light.secondary` with `#2D7A75` / `#1E5C58` (remove all `#F97316` values)
    - Replace `dark.success` / `light.success` with `#5E9A64` / `#4B7A51`
    - Replace `dark.danger` / `light.danger` with `#C1503F` / `#A63D2F`
    - Add `seal` token to both `dark` and `light` objects (`#C1503F` / `#A63D2F`)
    - Update `dark.surface` to `#1A2138`, `dark.surfaceSubtle` to `#161D33`, `dark.navBg` to `rgba(22, 29, 51, 0.96)`
    - Update all `rgba()` light values for `primaryLight`, `secondaryLight`, `successLight`, `dangerLight` to match new hex bases
    - Update `shadows.glowPrimary.shadowColor` to `#C99A5B`, `shadows.glowSuccess.shadowColor` to `#5E9A64`, `shadows.glowSecondary.shadowColor` to `#2D7A75`
    - `spacing`, `radius`, and shadow structure remain unchanged (only color values)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [x] 3.2 Create `src/theme/typography.ts` font constant helper
    - Export `fontDisplay`, `fontDisplayRegular`, `fontUI`, `fontUIBold`, `fontUIExtraBold` string constants mapping to exact Expo Google Fonts family names
    - No logic, just constants — consumed by all screen and component files
    - _Requirements: 2.11, 2.12, 2.13_

  - [x] 3.3 Wire `useFonts` + `SplashScreen` in `app/_layout.tsx`
    - Import `Fraunces_400Regular`, `Fraunces_700Bold` from `@expo-google-fonts/fraunces`
    - Import `Manrope_400Regular`, `Manrope_700Bold`, `Manrope_800ExtraBold` from `@expo-google-fonts/manrope`
    - Import `* as SplashScreen` from `expo-splash-screen`; call `SplashScreen.preventAutoHideAsync()` at module level
    - Call `useFonts({...})` inside `RootLayout`
    - In `useEffect` on `fontsLoaded`: call `SplashScreen.hideAsync()` then `initPurchases()`
    - Return `null` (not a blank View) while fonts are loading so splash screen remains
    - _Requirements: 2.9, 2.10_

- [x] 4. Checkpoint — P2 complete
  - Ensure all tests pass and the app renders without font warnings, ask the user if questions arise.

- [x] 5. P3 — Shared ScreenHeader, OverflowMenu, Scroll Padding
  - [x] 5.1 Create `src/components/ScreenHeader.tsx`
    - Accept props: `title: string`, `subtitle?: string`, `onBack?: () => void`, `rightSlot?: React.ReactNode`, `isDarkMode: boolean`
    - Left: 32×32 back button (`surfaceSubtle` bg, `border` border) rendered only when `onBack` is provided; otherwise a 32 px-wide spacer `View`
    - Center: logo circle + `title` (Manrope ExtraBold) + optional `subtitle` (Manrope Regular, smaller), `flex: 1`, centered
    - Right: `rightSlot` if provided, otherwise `<ThemeToggle />`
    - All colors sourced from `colors.dark` / `colors.light` via `isDarkMode`; no raw hex values
    - _Requirements: 3.1, 3.3, 3.4_

  - [ ]* 5.2 Write property test for `ScreenHeader` back-button rendering
    - **Property 3: ScreenHeader Renders Back Button Iff onBack Provided**
    - **Validates: Requirements 3.3**
    - Test both cases: `onBack` provided → back button present; `onBack` undefined → spacer present, back button absent

  - [x] 5.3 Create `src/components/OverflowMenu.tsx`
    - Accept props: `actions: OverflowMenuAction[]`, `isDarkMode: boolean`
    - Trigger: 32×32 icon button using `MoreHorizontal` from `lucide-react-native`
    - Presentation: React Native `Modal` (`transparent={true}`) with `TouchableWithoutFeedback` backdrop closing it; bottom-sheet content slides up with `Animated.timing`
    - Destructive actions (`isDestructive: true`): label colored `theme.danger`; preceded by `Alert.alert()` confirmation before executing
    - Closes on: backdrop tap, cancel tap, or post-action completion
    - _Requirements: 3.6, 3.7, 3.8, 3.9, 3.10_

  - [x] 5.4 Replace inline headers with `ScreenHeader` in all ten screens
    - Files: `app/auth.tsx`, `app/index.tsx`, `app/paywall.tsx`, `app/invite/[code].tsx`, `app/invite/index.tsx`, `app/groups/[id]/index.tsx`, `app/groups/[id]/preferences.tsx`, `app/groups/[id]/options.tsx`, `app/groups/[id]/vote.tsx`, `app/groups/[id]/brief.tsx`
    - Import and render `<ScreenHeader>` replacing each screen's existing `View`-based brand header block
    - Pass `onBack` only where a back navigation action already exists
    - Pass existing `ThemeToggle` usage as `rightSlot` only if the screen already renders it separately; otherwise omit `rightSlot` to use the default
    - _Requirements: 3.2_

  - [x] 5.5 Move "Delete Trip Circle" and "Leave Circle" into `OverflowMenu` in Group Hub screen
    - File: `app/groups/[id]/index.tsx`
    - Remove the inline destructive-action buttons from scroll content
    - Wire `<OverflowMenu>` into the `rightSlot` of the newly placed `<ScreenHeader>`
    - Pass `leaveGroup` and `deleteGroup` store calls as the action handlers
    - _Requirements: 3.7, 3.8, 3.9_

  - [x] 5.6 Standardize `ScrollView` `contentContainerStyle` across all ten screens
    - For every `ScrollView` in the ten files listed in 5.4, set `paddingHorizontal: 20`, `paddingBottom: 90`, `maxWidth: 600`, `width: '100%'`, `alignSelf: 'center'`
    - Preserve existing per-screen `paddingTop` values
    - _Requirements: 3.5_

- [x] 6. Checkpoint — P3 complete
  - Ensure all tests pass and navigation between screens works correctly, ask the user if questions arise.

- [ ] 7. P4 — Animation Components
  - [x] 7.1 Create `src/components/MapDriftBackground.tsx`
    - Implement with `Svg` + `Path` from `react-native-svg` and `Animated` from `react-native`
    - Define `TOPO_PATHS`: array of ~8 closed SVG path strings representing concentric elevation contour lines spread across a `400×800` viewBox
    - `useRef(new Animated.Value(0))` → `Animated.loop(Animated.sequence([timing(1, 35000), timing(0, 35000)]))` (≈70 s full cycle)
    - `translateX` interpolates `[0, 1]` → `[0, 12]`; `translateY` interpolates `[0, 1]` → `[0, 6]`
    - All `<Path>` elements: `opacity={0.07}`, `stroke={theme.primary}`, `strokeWidth={1}`, `fill="none"`
    - Wrap in `Animated.View` with `StyleSheet.absoluteFillObject` and `pointerEvents="none"`
    - _Requirements: 7.1, 7.3, 7.4, 7.5_

  - [ ] 7.2 Write property test for `MapDriftBackground` path opacity
    - **Property 5: MapDriftBackground Path Opacity Never Exceeds 0.08**
    - **Validates: Requirements 7.4**
    - Assert every path in `TOPO_PATHS` is rendered with `opacity` ≤ 0.08

  - [x] 7.3 Update `src/components/SealStamp.tsx` — add `hasPlayed` guard and use `seal` token
    - Add `const hasPlayed = useRef(false)` before the `useEffect`
    - At the top of `useEffect`: `if (hasPlayed.current) return; hasPlayed.current = true;`
    - Change `sealColor` source from `theme.danger` to `(theme as any).seal ?? theme.danger`
    - No other logic or style changes
    - _Requirements: 6.1, 6.3, 6.4_

  - [ ] 7.4 Write property test for `SealStamp` animation guard
    - **Property 4: SealStamp Animation Fires Exactly Once Per Mount**
    - **Validates: Requirements 6.1, 6.4**
    - Mock `Animated.parallel` and assert it is called exactly once across multiple state-driven re-renders

- [x] 8. Checkpoint — P4 complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. P5 — RankedOptionCard Ticket Card Motif
  - [x] 9.1 Refactor `src/components/RankedOptionCard.tsx` to Ticket Card motif
    - Remove `radius.card` and `shadows.md` from the outermost card `View`
    - Apply Ticket Card corner radii: `borderTopRightRadius: radius.md (12)`, `borderTopLeftRadius: 0`, `borderBottomLeftRadius: 0`, `borderBottomRightRadius: 0`, `borderWidth: 1`, `overflow: 'hidden'`
    - Insert a horizontal perforation row between the stub and main content: full-width `View` with `borderStyle: 'dashed'`, `borderWidth: 1`, `borderColor: theme.border`
    - Extract a left stub column (~28% width): `backgroundColor: theme.surfaceSubtle`, `borderRightWidth: 1`, `borderRightColor: theme.border`, vertically centered; display `consensusPercent` in Fraunces (`fontDisplay`) at size 19
    - Stub score text color: `theme.success` when `consensusPercent >= 70`, `theme.primary` otherwise
    - Move rank badge, match score, destination name, and date/budget meta into the right content column (the remaining ~72%)
    - Preserve: `isExpanded` member breakdown, vote button, `onToggleVote` prop, all existing accessibility labels
    - Remove `ImageBackground` hero image (incompatible with side-by-side stub layout — replace destination name area with a plain header row using the existing `scrimOverlay` color as a tinted background panel)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 9.2 Write property test for stub color threshold
    - **Property 2: Ticket Card Stub Color is Threshold-Gated**
    - **Validates: Requirements 4.4, 4.5**
    - For `consensusPercent` in [0, 69]: assert color === `theme.primary`; for [70, 100]: assert color === `theme.success`

  - [x] 9.3 Apply `RankedOptionCard` Ticket motif to the Dashboard consensus lead card
    - File: `app/index.tsx`
    - Locate the "Current Consensus Lead" card and wrap it in (or replace it with) `<RankedOptionCard>` using the same `scoredOption` prop it already has
    - If the dashboard uses a condensed inline variant, apply the same Ticket corner radii and stub pattern inline rather than reusing the full component
    - _Requirements: 4.1_

- [x] 10. Checkpoint — P5 complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. P6 — Document Card Motif (Preferences, Trip Brief, Paywall, Group Hub, Auth)
  - [x] 11.1 Apply Document Card to all form sections in Preferences screen
    - File: `app/groups/[id]/preferences.tsx`
    - Wrap each section (date range, budget, vibes, dealbreakers) and the privacy shield banner in a `View` with: `borderRadius: radius.sm (8)`, `backgroundColor: theme.surface`, `borderWidth: 1`, `borderColor: theme.border`, `padding: 24`, no shadow
    - Remove any existing `radius.card` or `shadows.md` on these section containers
    - Apply `fontDisplay` (Fraunces) to section destination/summary text; apply `fontUIBold` / `fontUI` (Manrope) to labels and inputs
    - _Requirements: 5.1, 5.4, 5.5, 5.6_

  - [x] 11.2 Apply Document Card to Trip Brief screen
    - File: `app/groups/[id]/brief.tsx`
    - Wrap the main finalized trip summary and the celebration header in Document Card containers
    - Render destination name and trip summary text in `fontDisplay` (Fraunces), interactive elements in Manrope
    - Ensure `<SealStamp>` is positioned over the Document Card, not inside it
    - _Requirements: 5.2, 5.4, 5.5, 5.6_

  - [x] 11.3 Apply Document Card to Paywall screen
    - File: `app/paywall.tsx`
    - Replace the current `heroCard`, `featureItem`, and `planCard` containers with Document Card styling: `borderRadius: radius.sm`, `backgroundColor: theme.surface`, `borderWidth: 1`, `borderColor: theme.border`, `padding: 24`, no shadow
    - Ensure `brandHeaderBox` (screen header area, replaced by `ScreenHeader` in P3) also follows Document Card spec
    - _Requirements: 5.3, 5.4_

  - [x] 11.4 Apply Document Card to Group Hub screen
    - File: `app/groups/[id]/index.tsx`
    - Wrap the invite code card, responded-tracker card, and each action card in Document Card containers
    - Remove any `radius.card` or shadow styling from these containers
    - _Requirements: 5.4_

  - [x] 11.5 Apply Document Card to Auth screen
    - File: `app/auth.tsx`
    - Wrap the hero welcome banner, auth form card, and each value pillar card in Document Card containers
    - Apply `fontDisplay` to hero headline and pillar titles; Manrope to form labels, inputs, and button text
    - _Requirements: 5.4, 5.5, 5.6_

- [x] 12. Checkpoint — P6 complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. P7 — Restyle Dashboard, Ranked Options, and Silent Vote Screens
  - [x] 13.1 Restyle Dashboard screen with corrected tokens
    - File: `app/index.tsx`
    - Replace all `theme.primary`, `theme.secondary`, `theme.background`, `theme.success`, `theme.danger` usages so they now resolve to the corrected token values from the updated `colors.ts` (no code changes needed if tokens are already referenced symbolically — verify no raw hex overrides)
    - Wrap the constraint status card in a Document Card container
    - Apply `fontUIExtraBold` (Manrope) to section headings; `fontUI` to body copy
    - Verify no raw `#EA580C`, `#F97316`, or other off-spec hex values remain
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 13.2 Restyle Ranked Options screen
    - File: `app/groups/[id]/options.tsx`
    - Ensure `RankedOptionCard` (now Ticket Card) is used for all ranked option items
    - Add a deadlock/budget-division state card: a `View` with `borderColor: theme.danger`, `borderWidth: 1.5`, `borderRadius: radius.sm`, `backgroundColor: theme.dangerLight` — separate from the ranked list, shown only when deadlock state is detected
    - Wrap the AI banner card in a Document Card container
    - Apply corrected tokens throughout; remove any raw hex values
    - _Requirements: 8.1, 8.4, 8.7_

  - [x] 13.3 Restyle Silent Vote screen
    - File: `app/groups/[id]/vote.tsx`
    - Apply Ticket Card motif to the top-pick option display (same structural rules as `RankedOptionCard`)
    - Add a vote-confirmation banner (`View` with `backgroundColor: theme.successLight`, `borderColor: theme.success`, Document Card corner radius) shown after the user casts a vote — text indicates vote is recorded and results are private
    - Apply corrected tokens throughout; remove any raw hex values
    - _Requirements: 4.2, 8.1, 8.4, 8.8_

- [x] 14. Checkpoint — P7 complete
  - Ensure all tests pass and screen transitions work, ask the user if questions arise.

- [x] 15. P8 — Auth Skeleton and Group Hub Tracker Prominence
  - [x] 15.1 Add loading skeleton to Auth screen while session is being checked
    - File: `app/auth.tsx`
    - Read `initAuthSession` loading state from the store (or add a local `isCheckingSession` state initialized to `true`)
    - While session check is in flight, render `<SkeletonLoader>` placeholder blocks in place of the hero banner, auth form, and pillar cards (reuse existing `src/components/SkeletonLoader.tsx`)
    - Once session check resolves, fade in the real content (use `Animated.timing` opacity 0→1, 200 ms)
    - Do not show a blank screen at any point during session check
    - _Requirements: 8.9_

  - [x] 15.2 Move "X of Y travelers responded" tracker to top of Group Hub scroll content
    - File: `app/groups/[id]/index.tsx`
    - Locate the responded-count display and move it to the first visible card below `ScreenHeader`, above all action cards
    - Render as a Document Card with a prominent respondent fraction (e.g., "3 / 5 travelers responded") in `fontUIExtraBold` at large size, with a secondary Manrope subtitle
    - _Requirements: 8.10_

  - [x] 15.3 Render `MapDriftBackground` on Auth screen and only on Auth screen
    - File: `app/auth.tsx`
    - Import `MapDriftBackground` and render it as the first child of the outermost `SafeAreaView`, before the `KeyboardAvoidingView`
    - Confirm no other screen file imports or renders `MapDriftBackground`
    - _Requirements: 7.2, 7.6, 7.7_

  - [x] 15.4 Trigger `SealStamp` animation on Trip Brief finalization
    - File: `app/groups/[id]/brief.tsx`
    - Confirm `<SealStamp>` is rendered when `finalizedBrief` is non-null and the group status is `'finalized'`
    - Pass `isDarkMode` from the store; pass `onAnimationComplete` callback if one is needed for subsequent UI state
    - The updated `hasPlayed` guard (from task 7.3) guarantees it plays once per mount
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 15.5 Write property test for screen background color token
    - **Property 6: Screen Background Color Matches Theme Mode**
    - **Validates: Requirements 8.2, 8.3**
    - For dark mode: assert `SafeAreaView` background === `colors.dark.background` (`#12182B`)
    - For light mode: assert `SafeAreaView` background === `colors.light.background` (`#F6EFDE`)

  - [ ]* 15.6 Write property test for primary action button token
    - **Property 7: Primary Action Buttons Use Primary Color Token**
    - **Validates: Requirements 8.6**
    - For each screen's primary CTA: assert `backgroundColor` === `theme.primary`; no raw hex values permitted

- [~] 16. Final Checkpoint — Full Overhaul Complete
  - Ensure all tests pass across all modified screens and components, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build
- Each task references specific requirements for traceability
- Checkpoints provide integration validation points between priority groups
- Property tests validate correctness invariants: derivation logic (P1), color thresholds (P5), animation guards (P4), and token correctness (P8)
- The `hasPlayed` ref in `SealStamp` and the `initPurchases` key guard are the two most important correctness-critical code paths
- No new tabs, screens, or navigation entries are introduced — the tab bar in `BottomTabBar.tsx` is intentionally unchanged

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.2"] },
    { "id": 1, "tasks": ["1.2", "1.3", "3.1"] },
    { "id": 2, "tasks": ["1.4", "1.5", "3.3"] },
    { "id": 3, "tasks": ["1.6", "1.7"] },
    { "id": 4, "tasks": ["5.1", "7.1", "7.3"] },
    { "id": 5, "tasks": ["5.2", "5.3", "7.2", "7.4"] },
    { "id": 6, "tasks": ["5.4", "5.5", "5.6"] },
    { "id": 7, "tasks": ["9.1"] },
    { "id": 8, "tasks": ["9.2", "9.3"] },
    { "id": 9, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5"] },
    { "id": 10, "tasks": ["13.1", "13.2", "13.3"] },
    { "id": 11, "tasks": ["15.1", "15.2", "15.3", "15.4"] },
    { "id": 12, "tasks": ["15.5", "15.6"] }
  ]
}
```
