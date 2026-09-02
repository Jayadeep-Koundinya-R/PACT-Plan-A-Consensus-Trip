# Design Document — PACT UI/UX Overhaul

## Overview

This document specifies the architecture and implementation strategy for the PACT UI/UX overhaul. Four independent concerns are addressed: (1) wiring the RevenueCat `react-native-purchases` SDK replacing the current Zustand flag mock; (2) correcting all color tokens in `colors.ts` and loading Fraunces/Manrope at app boot via `useFonts`; (3) introducing shared `ScreenHeader` and `OverflowMenu` components with unified scroll padding; and (4) restyling all ten screens with the Ticket Card and Document Card motifs, the `SealStamp` animation on trip finalization, and the `MapDriftBackground` drift animation on the Auth screen only.

The stack is Expo 52 / React Native 0.76 / TypeScript / Expo Router 4. State is managed by Zustand via `useGatherlyStore`. No new screens or tabs are introduced.

---

## Architecture

### 1. RevenueCat SDK Integration

#### Module Layout

```
src/
  lib/
    purchases/
      config.ts          ← SDK init helper (Purchases.configure)
      customerInfo.ts    ← CustomerInfo → subscriptionPlan derivation
  store/
    useGatherlyStore.ts  ← extend with customerInfo state slice
app/
  _layout.tsx            ← calls initPurchases() on mount
  paywall.tsx            ← calls getCustomerInfo(), purchasePackage(), restorePurchases()
```

`react-native-purchases` requires native modules. It is therefore not available on Expo Go; builds are done through EAS. The SDK is declared as a production dependency.

#### `src/lib/purchases/config.ts`

```typescript
import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// Keys are injected at EAS build time via process.env; never committed as literals.
const IOS_RC_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '';
const ANDROID_RC_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '';

export function initPurchases(): void {
  const key = Platform.OS === 'ios' ? IOS_RC_KEY : ANDROID_RC_KEY;
  if (!key) return; // Graceful no-op in Expo Go / web
  Purchases.configure({ apiKey: key });
}
```

`app.config.js` or `app.json` exposes these via `extra` / `EXPO_PUBLIC_*` env variables read from EAS secrets. No literal API keys appear anywhere in committed source.

#### `src/lib/purchases/customerInfo.ts`

```typescript
import { CustomerInfo } from 'react-native-purchases';

export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_annual';

const ENTITLEMENT_ID = 'pro_access';

// Pure derivation — the function under test for correctness properties.
export function deriveSubscriptionPlan(info: CustomerInfo): SubscriptionPlan {
  const active = info?.entitlements?.active ?? {};
  if (!active[ENTITLEMENT_ID]) return 'free';
  const productId = active[ENTITLEMENT_ID]?.productIdentifier ?? '';
  if (productId.includes('annual')) return 'premium_annual';
  return 'premium_monthly';
}
```

#### `app/_layout.tsx` changes

```typescript
// Existing: font loading, error boundary
// Add after font load:
import { initPurchases } from '../src/lib/purchases/config';

// Inside RootLayout, after useFonts resolves:
React.useEffect(() => {
  initPurchases();
}, []);
```

`initPurchases` is called once, before any navigator renders.

#### `app/paywall.tsx` changes

The three async operations (getCustomerInfo, purchasePackage, restorePurchases) are each wrapped in try/catch. A shared `isLoading` state gates all purchase buttons. Error detection uses `PurchasesErrorCode.purchaseCancelledError` to distinguish user-cancellation from real errors.

```typescript
import Purchases, { PurchasesErrorCode } from 'react-native-purchases';
import { deriveSubscriptionPlan } from '../src/lib/purchases/customerInfo';

// On PaywallScreen mount:
useEffect(() => {
  const check = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setSubscriptionPlan(deriveSubscriptionPlan(info));
    } catch (e) {
      // Non-fatal: user stays on paywall with current cached plan
    }
  };
  check();
}, []);

// Purchase handler:
const handleSubscribe = async () => {
  setIsLoading(true);
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = billingCycle === 'annual'
      ? offerings.current?.annual
      : offerings.current?.monthly;
    if (!pkg) throw new Error('Package not found');
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    setSubscriptionPlan(deriveSubscriptionPlan(customerInfo));
    router.back();
  } catch (e: any) {
    if (e?.code === PurchasesErrorCode.purchaseCancelledError) {
      // No error shown — simply stop loading
    } else {
      setErrorMessage(e?.message ?? 'Purchase failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};
```

The Zustand store's `setSubscriptionPlan` action remains unchanged.

---

### 2. Color Tokens and Font Loading

#### Corrected `src/theme/colors.ts`

The following replaces the current terracotta/orange palette with the Ink/Parchment/Brass/Petrol/Seal/Moss palette from DESIGN_SYSTEM.md. Raw hex values shown are taken verbatim from the spec table.

```typescript
export const colors = {
  dark: {
    background:      '#12182B',          // Ink
    surface:         '#1A2138',
    surfaceElevated: '#1E293B',          // kept for backward compat
    surfaceSubtle:   '#161D33',
    primary:         '#C99A5B',          // Brass (lightened for dark bg)
    primaryDark:     '#A97C3D',
    primaryLight:    'rgba(201, 154, 91, 0.18)',
    secondary:       '#2D7A75',          // Petrol
    secondaryDark:   '#1E5C58',
    secondaryLight:  'rgba(45, 122, 117, 0.18)',
    accentPeach:     '#1E293B',
    accentTerracotta:'#C99A5B',          // remapped to Brass
    success:         '#5E9A64',          // Moss
    successLight:    'rgba(94, 154, 100, 0.18)',
    warning:         '#F59E0B',
    warningLight:    'rgba(245, 158, 11, 0.18)',
    danger:          '#C1503F',          // Seal / Sealing Red
    dangerLight:     'rgba(193, 80, 63, 0.18)',
    seal:            '#C1503F',          // Explicit seal alias
    textPrimary:     '#F3EEE2',
    textSecondary:   '#A9A08C',
    textMuted:       '#64748B',
    border:          'rgba(243, 238, 226, 0.10)',
    glassBorder:     'rgba(243, 238, 226, 0.12)',
    card:            '#1A2138',
    meterTrack:      '#1E293B',
    navBg:           'rgba(22, 29, 51, 0.96)'
  },
  light: {
    background:      '#F6EFDE',          // Parchment
    surface:         '#FFFFFF',
    surfaceElevated: '#F5F2EC',
    surfaceSubtle:   '#EFE7D4',
    primary:         '#A97C3D',          // Brass
    primaryDark:     '#8A6230',
    primaryLight:    'rgba(169, 124, 61, 0.10)',
    secondary:       '#1E5C58',          // Petrol
    secondaryDark:   '#164845',
    secondaryLight:  'rgba(30, 92, 88, 0.10)',
    accentPeach:     '#FFEDD5',
    accentTerracotta:'#A97C3D',          // remapped to Brass
    success:         '#4B7A51',          // Moss
    successLight:    'rgba(75, 122, 81, 0.10)',
    warning:         '#F59E0B',
    warningLight:    'rgba(245, 158, 11, 0.10)',
    danger:          '#A63D2F',          // Seal / Sealing Red
    dangerLight:     'rgba(166, 61, 47, 0.10)',
    seal:            '#A63D2F',          // Explicit seal alias
    textPrimary:     '#1E1A14',
    textSecondary:   '#5C5445',
    textMuted:       '#A8A29E',
    border:          '#E3D9C2',
    glassBorder:     'rgba(28, 25, 23, 0.06)',
    card:            '#FFFFFF',
    meterTrack:      '#E3D9C2',
    navBg:           'rgba(246, 239, 222, 0.96)'
  }
} as const;

// spacing, radius, shadows remain unchanged
```

**Key changes from current file:**
- `dark.background`: `#0B0F17` → `#12182B`
- `light.background`: `#FAF8F5` → `#F6EFDE`
- `dark.primary` / `light.primary`: `#EA580C` → `#C99A5B` / `#A97C3D`
- `dark.secondary` / `light.secondary`: `#F97316` → `#2D7A75` / `#1E5C58`
- `dark.success` / `light.success`: `#10B981` → `#5E9A64` / `#4B7A51`
- `dark.danger` / `light.danger`: `#EF4444` → `#C1503F` / `#A63D2F`
- New `seal` token (same value as `danger`) added to both themes

#### Font Loading in `app/_layout.tsx`

```typescript
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_700Bold
} from '@expo-google-fonts/fraunces';
import {
  Manrope_400Regular,
  Manrope_700Bold,
  Manrope_800ExtraBold
} from '@expo-google-fonts/manrope';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isDarkMode = useGatherlyStore((s) => s.isDarkMode);

  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_700Bold,
    Manrope_400Regular,
    Manrope_700Bold,
    Manrope_800ExtraBold
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      initPurchases();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null; // Splash stays visible

  return (
    <RootErrorBoundary isDarkMode={isDarkMode}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }} />
    </RootErrorBoundary>
  );
}
```

#### Typography Application Pattern

Two helper constants are defined in `src/theme/typography.ts`:

```typescript
export const fontDisplay = 'Fraunces_700Bold';   // Hero headlines, destination names, Trip Brief body
export const fontDisplayRegular = 'Fraunces_400Regular';
export const fontUI = 'Manrope_400Regular';      // Labels, descriptions, body copy
export const fontUIBold = 'Manrope_700Bold';     // Button labels, card titles
export const fontUIExtraBold = 'Manrope_800ExtraBold'; // Section headings, prominent UI labels
```

Usage rule: any `Text` element with `display` or `brief` content uses `fontFamily: fontDisplay`. All other `Text` elements use a Manrope variant. A single `Text` element never mixes the two.

Screens apply this via inline style references:
```typescript
// Display text
style={{ fontFamily: fontDisplay, fontSize: 21, color: theme.textPrimary }}

// UI text
style={{ fontFamily: fontUIExtraBold, fontSize: 14, color: theme.textPrimary }}
```

---

### 3. Shared Components: ScreenHeader and OverflowMenu

#### `src/components/ScreenHeader.tsx`

```typescript
interface ScreenHeaderProps {
  title: string;          // Center brand title (usually "PACT" or group name)
  subtitle?: string;      // Under title (usually "PLAN A CONSENSUS TRIP")
  onBack?: () => void;    // If provided, renders back button on the left
  rightSlot?: React.ReactNode; // If provided, renders instead of ThemeToggle
  isDarkMode: boolean;
}
```

Internal layout:
- Left: back button (32×32, `surfaceSubtle` bg, `border`) rendered only when `onBack` is provided; otherwise a 32px spacer for centering
- Center: logo circle + title + subtitle column (flex: 1, centered)
- Right: `rightSlot` if provided, otherwise `<ThemeToggle />`

All 10 screens replace their inline `View`-based brand header with `<ScreenHeader>`, eliminating ~60 lines of duplicated code per screen.

#### `src/components/OverflowMenu.tsx`

```typescript
interface OverflowMenuAction {
  label: string;
  icon?: React.ReactNode;
  isDestructive?: boolean;
  onPress: () => void;
}

interface OverflowMenuProps {
  actions: OverflowMenuAction[];
  isDarkMode: boolean;
}
```

Implementation:
- Trigger: 32×32 icon button with `•••` icon (uses `MoreHorizontal` from lucide-react-native)
- Presentation: React Native `Modal` with `transparent={true}` and a `TouchableWithoutFeedback` backdrop that closes it; content slides up as a bottom sheet via `Animated.timing`
- Destructive actions: label colored with `theme.danger`
- Before executing any destructive action: `Alert.alert()` confirmation dialog
- Closes on: backdrop tap, cancel option tap, or action completion

The Group Hub screen (`app/groups/[id]/index.tsx`) moves "Delete Trip Circle" and "Leave Circle" into an `OverflowMenu` placed in the `rightSlot` of `ScreenHeader`.

#### Scroll Padding Standardization

Every `ScrollView.contentContainerStyle` across all 10 screens is updated to:
```typescript
{
  paddingHorizontal: 20,
  paddingBottom: 90,
  maxWidth: 600,
  width: '100%',
  alignSelf: 'center'
}
```

`paddingTop` remains per-screen (typically 12–14).

---

### 4. Animation Components

#### `src/components/MapDriftBackground.tsx`

New file. Renders behind all other content on the Auth screen.

**Structure:**
```typescript
import Svg, { Path } from 'react-native-svg';
import { Animated, Dimensions } from 'react-native';

// ~8 topographic contour paths, each a closed SVG path string
// representing concentric elevation lines at different screen coordinates.
const TOPO_PATHS = [
  'M 20 80 Q 100 40 200 90 Q 300 130 380 70 ...',
  // ... 7 more paths
];

export function MapDriftBackground({ isDarkMode }: { isDarkMode: boolean }) {
  const theme = isDarkMode ? colors.dark : colors.light;
  const driftAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(driftAnim, { toValue: 1, duration: 35000, useNativeDriver: true }),
        Animated.timing(driftAnim, { toValue: 0, duration: 35000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const translateX = driftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12]  // subtle horizontal drift, ≤12px
  });
  const translateY = driftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6]   // subtle vertical drift, ≤6px
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFillObject,
        { transform: [{ translateX }, { translateY }] }
      ]}
      pointerEvents="none"
    >
      <Svg width="100%" height="100%" viewBox="0 0 400 800">
        {TOPO_PATHS.map((d, i) => (
          <Path
            key={i}
            d={d}
            stroke={theme.primary}
            strokeWidth={1}
            fill="none"
            opacity={0.07}  // ≤ 0.08 per spec
          />
        ))}
      </Svg>
    </Animated.View>
  );
}
```

- Full loop: `35000ms × 2 = 70000ms ≈ 70s`
- Path opacity: fixed at `0.07`, well within the ≤ 0.08 constraint
- `pointerEvents="none"`: doesn't intercept any touches
- Rendered only in `app/auth.tsx`, wrapped absolutely behind the KeyboardAvoidingView content

#### `src/components/SealStamp.tsx` (updated)

The existing component requires two changes:
1. Use `theme.seal` instead of `theme.danger` for the seal color, now that `seal` is an explicit token
2. Add a `hasPlayed` ref guard so the animation never replays without unmount

```typescript
export function SealStamp({ isDarkMode = false, onAnimationComplete, sealedDate = 'CONSENSUS PACT' }: SealStampProps) {
  const theme = isDarkMode ? colors.dark : colors.light;
  const sealColor = (theme as any).seal ?? theme.danger; // uses seal token

  const hasPlayed = useRef(false); // Guard: play only once

  useEffect(() => {
    if (hasPlayed.current) return;
    hasPlayed.current = true;

    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: -6, duration: 350, useNativeDriver: true })
    ]).start(() => {
      onAnimationComplete?.();
    });
  }, []);

  // ... rest unchanged except sealColor source
}
```

The `hasPlayed` ref ensures the animation fires exactly once per mount, satisfying Requirements 6.1 and 6.4.

---

### 5. Card Motifs — Screen-by-Screen Assignment

#### Ticket Card Motif

Used exclusively for "one option among several the group is choosing between":

| Screen | Component | Ticket Card Applied To |
|---|---|---|
| Ranked Options (`options.tsx`) | `RankedOptionCard` | Each ranked trip option |
| Silent Vote (`vote.tsx`) | Top-pick inline card | The one displayed top-pick |
| Dashboard (`index.tsx`) | `RankedOptionCard` | The single "Current Consensus Lead" card |

**Ticket Card structural properties (applied via StyleSheet):**
```typescript
ticketCard: {
  borderTopRightRadius: radius.md,   // 12 — the ONE rounded corner
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
  borderWidth: 1,                    // borderColor: theme.border (or theme.primary if winner)
  overflow: 'hidden'
  // NO shadow properties
}
```

The `RankedOptionCard` component is refactored to apply these styles instead of the current `radius.card` + `shadows.md` combination.

**Perforation line** (dashed horizontal rule at ~28% from left):
```typescript
perforationLine: {
  borderWidth: 1,
  borderStyle: 'dashed',
  borderColor: theme.border,
  width: '100%',
  marginVertical: 0
}
```

**Stub** (left of perforation, ~28% width):
```typescript
ticketStub: {
  width: '28%',
  backgroundColor: theme.surfaceSubtle,
  paddingVertical: 14,
  paddingHorizontal: 8,
  alignItems: 'center',
  justifyContent: 'center',
  borderRightWidth: 1,
  borderRightColor: theme.border
}

// Stub score text uses Fraunces + success/primary conditional color:
stubScoreText: {
  fontFamily: fontDisplay,  // Fraunces
  fontSize: 19,
  fontWeight: '900',
  color: consensusPercent >= 70 ? theme.success : theme.primary
}
```

#### Document Card Motif

Used for records of a decision or form sections:

| Screen | Card Applied To |
|---|---|
| Preferences (`preferences.tsx`) | Each form section (date, budget, vibes, dealbreakers) |
| Preferences (`preferences.tsx`) | Privacy shield banner |
| Trip Brief (`brief.tsx`) | Main finalized trip summary |
| Trip Brief (`brief.tsx`) | Celebration header |
| Paywall (`paywall.tsx`) | Hero card, each feature highlight |
| Group Hub (`index.tsx`) | Invite code card, responded tracker, action cards |
| Auth (`auth.tsx`) | Hero welcome banner, auth form card, pillar card |
| Dashboard (`index.tsx`) | Brand header box, constraint status card |
| Silent Vote (`vote.tsx`) | Voted confirmation banner, privacy note |
| Ranked Options (`options.tsx`) | AI banner card, deadlock alert card |

**Document Card structural properties:**
```typescript
documentCard: {
  borderRadius: radius.sm,           // 8 — square-ish corners
  backgroundColor: theme.surface,
  borderWidth: 1,
  borderColor: theme.border,
  padding: 24,                       // ≥24px padding
  // NO shadow properties
}
```

The current `radius.card` (18) value is not used on any new or reworked component.

---

### 6. Screen-by-Screen Restyle Summary

| Screen | File | Key Changes |
|---|---|---|
| Welcome / Auth | `app/auth.tsx` | Add `MapDriftBackground` behind content; loading skeleton while session checks; apply new color tokens + Manrope/Fraunces; replace inline header with `ScreenHeader` |
| Dashboard | `app/index.tsx` | Apply corrected tokens; `RankedOptionCard` gets Ticket motif; constraint status card becomes Document Card; replace inline header with `ScreenHeader` |
| Group Hub | `app/groups/[id]/index.tsx` | Move destructive actions to `OverflowMenu`; responded tracker and invite cards as Document Cards; `ScreenHeader` replaces inline header |
| Preferences | `app/groups/[id]/preferences.tsx` | Each form section as Document Card (padding 24px+); `ScreenHeader`; corrected tokens |
| Ranked Options | `app/groups/[id]/options.tsx` | `RankedOptionCard` uses Ticket motif; deadlock state uses `danger` border card; `ScreenHeader` |
| Silent Vote | `app/groups/[id]/vote.tsx` | Top-pick uses Ticket motif; vote confirmation banner; `ScreenHeader` |
| Trip Brief | `app/groups/[id]/brief.tsx` | `SealStamp` animation (updated); main brief uses Document Card with Fraunces destination name; `ScreenHeader` |
| Paywall | `app/paywall.tsx` | RevenueCat SDK wired; feature items as Document Cards; `ScreenHeader`; corrected tokens |
| Invite / Join | (existing join screen) | Error state for invalid code; preview group name; `ScreenHeader` |
| Root Index | `app/index.tsx` | See Dashboard row above |

---

### 7. Zustand Store Extensions

The existing store needs minor additions to support the new features. The core store structure is preserved.

#### New state fields

```typescript
interface GatherlyState {
  // ... existing fields ...

  // RevenueCat
  isCheckingEntitlement: boolean;   // true while getCustomerInfo() is in flight
  purchaseError: string | null;     // inline error for paywall

  // Actions
  setIsCheckingEntitlement: (v: boolean) => void;
  setPurchaseError: (msg: string | null) => void;
}
```

`isCheckingEntitlement` drives the loading indicator in `PaywallScreen`. `purchaseError` drives the inline error banner.

Both are straightforward setter actions with no side effects.

---

### 8. Data Models

No new data models are introduced. The existing `MemberPreference`, `TripOption`, `ScoredTripOption`, and `ConsensusResult` types remain unchanged.

The `TripBrief` type in the store already covers everything the Trip Brief screen needs.

The `SubscriptionPlan` type is moved from an inline union in the store to the named export in `src/lib/purchases/customerInfo.ts` and re-imported into the store.

---

### 9. Error Handling

| Scenario | Handling |
|---|---|
| `Purchases.configure()` called with empty key (Expo Go / web) | Guard in `initPurchases()`: early return, no SDK call |
| `getCustomerInfo()` fails on paywall mount | Catch, no error shown, current cached plan unchanged |
| `purchasePackage()` user cancellation | Catch `purchaseCancelledError`, dismiss loading, no error message |
| `purchasePackage()` other error | Catch, set `purchaseError` in store → renders inline error banner |
| `restorePurchases()` fails | Catch, show inline error via `purchaseError` |
| `useFonts` not yet loaded | `_layout.tsx` returns `null`, splash screen remains |
| Invalid group invite code | Existing `joinGroupByCode` already returns `{ success: false, message }` — invite screen renders error state |
| `SealStamp` called when not finalized | Component still renders, but `hasPlayed` guard prevents double animation |

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Subscription Plan Derivation from Entitlement

*For any* `CustomerInfo` object with an active entitlement for `pro_access`, calling `deriveSubscriptionPlan(info)` SHALL return `'premium_annual'` if the product identifier contains the substring `'annual'`, and `'premium_monthly'` otherwise. *For any* `CustomerInfo` where the `pro_access` entitlement is absent or inactive, the function SHALL return `'free'`.

**Validates: Requirements 1.4, 1.6, 1.9**

---

### Property 2: Ticket Card Stub Color is Threshold-Gated

*For any* `consensusPercent` value in the range [0, 100], the stub score text color applied by `RankedOptionCard` SHALL be `theme.success` when `consensusPercent >= 70` and `theme.primary` when `consensusPercent < 70`. No input in this range SHALL produce any other color value.

**Validates: Requirements 4.4, 4.5**

---

### Property 3: ScreenHeader Renders Back Button Iff onBack Provided

*For any* rendering of `ScreenHeader`, the back button element SHALL be present in the component tree if and only if the `onBack` prop is a non-null function. When `onBack` is `undefined` or `null`, the back button SHALL NOT appear — a spacer element of equal width SHALL be rendered instead to preserve centering.

**Validates: Requirements 3.3**

---

### Property 4: SealStamp Animation Fires Exactly Once Per Mount

*For any* number of re-renders of the `SealStamp` component without unmounting, the `Animated.parallel` sequence SHALL be started at most once. Calling any method that would trigger a re-render (prop change, parent state update) SHALL NOT restart the animation after the `hasPlayed` ref is set to `true`.

**Validates: Requirements 6.1, 6.4**

---

### Property 5: MapDriftBackground Path Opacity Never Exceeds 0.08

*For any* path rendered inside `MapDriftBackground`, the `opacity` prop passed to the `Path` SVG element SHALL be a value in the range [0, 0.08] at all times during the animation lifecycle, including while the drift animation is running.

**Validates: Requirements 7.4**

---

### Property 6: Screen Background Color Matches Theme Mode

*For any* screen component rendered with `isDarkMode = true`, the outermost `SafeAreaView` background SHALL equal `colors.dark.background` (`#12182B`). *For any* screen component rendered with `isDarkMode = false`, it SHALL equal `colors.light.background` (`#F6EFDE`). No other value is permitted.

**Validates: Requirements 8.2, 8.3**

---

### Property 7: Primary Action Buttons Use Primary Color Token

*For any* screen in the application, every button styled as a primary action (submit, upgrade, lock it in, cast vote) SHALL have its background color equal to `theme.primary` — `colors.dark.primary` or `colors.light.primary` depending on mode. No primary action button SHALL use a raw hex value or any other token as its background.

**Validates: Requirements 8.6**

---
