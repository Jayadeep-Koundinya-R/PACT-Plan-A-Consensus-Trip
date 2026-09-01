# PACT App - Full End-to-End Audit Report

> **Date**: 2026-09-01
> **Version**: 1.1.0 (APK PACT-app-v1.1.apk)
> **Status**: Multiple Critical and High issues found across icons, navigation, UX, and design consistency.

---

## Summary Dashboard

| Category | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| App Icon and Branding | 2 | 1 | 1 | 0 | **4** |
| Navigation and Routing | 1 | 3 | 1 | 0 | **5** |
| UX and Design Quality | 0 | 4 | 5 | 2 | **11** |
| Broken Content / Encoding | 1 | 2 | 0 | 0 | **3** |
| Code Quality and Consistency | 0 | 2 | 3 | 1 | **6** |
| **TOTAL** | **4** | **12** | **10** | **3** | **29** |

---

## CRITICAL ISSUES (Must Fix)

### C1: App Launcher Icon is Expo Default Placeholder
- **File**: `assets/icon.png`, `assets/adaptive-icon.png`, `assets/favicon.png`, `assets/splash.png`
- **Problem**: All 4 asset files are **70 bytes each** - these are Expo default transparent placeholder PNGs. The app shows no recognizable icon on the Android home screen.
- **Impact**: Users see a generic gray/transparent icon on their phone. First impression is terrible.
- **Solution**: Generate a proper PACT app icon (Compass logo on Sunset Coral #EA580C background) in multiple sizes.
- **Status**: `[ ]` TODO

### C2: Android Splash/Icon Background Color Mismatch
- **File**: `android/app/src/main/res/values/colors.xml`
- **Problem**: Splash screen background is #0EA5E9 (sky blue) and icon background is also #0EA5E9. Completely inconsistent with the app branding (Sunset Coral #EA580C / warm cream #FAF8F5).
- **Impact**: When app launches, users see a jarring blue splash that does not match anything in the app.
- **Solution**: Update splashscreen_background to #FAF8F5, iconBackground to #EA580C, colorPrimary to #EA580C, colorPrimaryDark to #C2410C. Also update app.json splash backgroundColor from #7C2D12 to #FAF8F5.
- **Status**: `[ ]` TODO

### C3: Broken Emojis in Preferences Screen (Encoding Corruption)
- **File**: `app/groups/[id]/preferences.tsx`
- **Problem**: The emoji constants in AVAILABLE_TAGS are corrupted/garbled. They display as broken ??? characters on Android.
- **Impact**: The tag selection UI looks broken and unprofessional.
- **Solution**: Replace emoji strings with proper Unicode escape sequences. Write file with proper UTF-8 encoding.
- **Status**: `[ ]` TODO

### C4: brief.tsx Share Text Contains Garbled Emoji Sequences
- **File**: `app/groups/[id]/brief.tsx`
- **Problem**: The briefText string template contains broken mojibake sequences instead of proper emojis.
- **Impact**: When users share the trip brief to WhatsApp, the message contains garbled characters.
- **Solution**: Replace all garbled sequences with proper Unicode emojis.
- **Status**: `[ ]` TODO

---

## HIGH ISSUES

### H1: groups/[id]/index.tsx - No Brand Header Frame (Inconsistent)
- **File**: `app/groups/[id]/index.tsx`
- **Problem**: Still uses old navBar pattern instead of PACT Brand Header Frame Box added to other screens.
- **Solution**: Replace navBar with brandHeaderBox containing Compass logo, PACT, Plan A Consensus Trip, and status badge.
- **Status**: `[ ]` TODO

### H2: groups/index.tsx - No Brand Header Frame
- **File**: `app/groups/index.tsx`
- **Problem**: Uses old plain navBar header. Inconsistent branding.
- **Solution**: Add branded header frame box.
- **Status**: `[ ]` TODO

### H3: paywall.tsx - No Brand Header Frame
- **File**: `app/paywall.tsx`
- **Problem**: Uses plain close button + text. No brand lockup frame.
- **Solution**: Add branded header frame with Crown icon + PACT Pro branding.
- **Status**: `[ ]` TODO

### H4: invite/index.tsx - No Brand Header or Consistent Styling
- **File**: `app/invite/index.tsx`
- **Problem**: Very basic screen. No top brand header frame. No bottom tab bar.
- **Solution**: Add brandHeaderBox, BottomTabBar, and topBorderLine.
- **Status**: `[ ]` TODO

### H5: groups/[id]/index.tsx - Broken Text with garbled emoji
- **File**: `app/groups/[id]/index.tsx`
- **Problem**: Contains garbled string in empty group state prompt.
- **Solution**: Fix to clean text without broken emoji.
- **Status**: `[ ]` TODO

### H6: groups/index.tsx - Broken Emoji in Circle Meta Text
- **File**: `app/groups/index.tsx`
- **Problem**: Circle card meta text separator appears garbled on Android.
- **Solution**: Replace with clean bullet separator.
- **Status**: `[ ]` TODO

### H7: paywall.tsx - Broken Emojis in Success Messages
- **File**: `app/paywall.tsx`
- **Problem**: handleSubscribe sets message with garbled emoji.
- **Solution**: Replace garbled emojis with proper Unicode or plain text.
- **Status**: `[ ]` TODO

### H8: groups/[id]/index.tsx Still Uses Old navBar Pattern
- Same fix as H1.

### H9: Bottom Tab Bar Home Route Does Not Highlight for /groups Path
- **File**: `src/components/BottomTabBar.tsx`
- **Problem**: Home tab isActive check does not match /groups/[id] paths.
- **Solution**: Improve isActive logic for Home tab.
- **Status**: `[ ]` TODO

### H10: brief.tsx Does NOT Wrap getConsensusResults() in Try-Catch
- **File**: `app/groups/[id]/brief.tsx`
- **Problem**: Direct call without try-catch. Will crash if store state is empty.
- **Solution**: Add try-catch defensive pattern.
- **Status**: `[ ]` TODO

### H11: brief.tsx Unsafe Property Access on consensus.rankedOptions[0]
- **File**: `app/groups/[id]/brief.tsx`
- **Problem**: If rankedOptions is empty, accessing properties will crash.
- **Solution**: Add null fallback and safe-chain all accesses.
- **Status**: `[ ]` TODO

### H12: groups/[id]/index.tsx - No Try-Catch on getConsensusResults()
- **File**: `app/groups/[id]/index.tsx`
- **Problem**: Same defensive issue.
- **Solution**: Add try-catch wrapper.
- **Status**: `[ ]` TODO

---

## MEDIUM ISSUES

- M1: app.json Splash Background Color #7C2D12 does not match cream #FAF8F5
- M2: No Custom Font (system defaults used everywhere) - PHASE 2
- M3: groups/[id]/index.tsx - topOption?.option.name missing safe-chain
- M4: ThemeToggle not present on inner screens - DESIGN DECISION
- M5: invite/[code].tsx not audited for crashes - PHASE 2
- M6-M10: Date picker, skeleton loading, unused modals, EmptyState, budget slider - PHASE 2

## LOW ISSUES

- L1: No Error Boundary in _layout.tsx - PHASE 2
- L2: No Accessibility Labels - PHASE 2
- L3: Hardcoded Demo User ID - PHASE 2

---

## PHASE 1 FIX ORDER (TODAY)

| # | Issue | Files | Effort |
|---|---|---|---|
| 1 | C1: Generate proper app icon | assets/ | 15 min |
| 2 | C2: Fix splash/icon colors | colors.xml, app.json | 5 min |
| 3 | C3: Fix broken emojis in preferences | preferences.tsx | 10 min |
| 4 | C4: Fix broken emojis in brief share | brief.tsx | 10 min |
| 5 | H5: Fix garbled text in group hub | groups/[id]/index.tsx | 2 min |
| 6 | H6: Fix garbled separator in groups list | groups/index.tsx | 2 min |
| 7 | H7: Fix garbled emoji in paywall | paywall.tsx | 2 min |
| 8 | H1/H8: Add Brand Header to Group Detail | groups/[id]/index.tsx | 15 min |
| 9 | H2: Add Brand Header to Groups List | groups/index.tsx | 10 min |
| 10 | H3: Add Brand Header to Paywall | paywall.tsx | 10 min |
| 11 | H4: Add Brand Header to Invite | invite/index.tsx | 10 min |
| 12 | H9: Fix Bottom Tab active state | BottomTabBar.tsx | 5 min |
| 13 | H10-H12: Add try-catch and safe-chain | brief.tsx, index.tsx | 15 min |
| 14 | M1+M3: Fix splash color and safe-chain | app.json, index.tsx | 3 min |

**Estimated Total**: Around 2 hours

---

> **Next Step**: Begin implementing Phase 1 fixes in priority order. After all code changes complete, run web export to verify 0 errors, then assembleRelease to build APK for tomorrow testing.
