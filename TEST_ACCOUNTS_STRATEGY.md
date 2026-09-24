# PACT Test Accounts & Pro vs. Free Testing Strategy

This document contains verified credentials and a step-by-step testing strategy for evaluating PACT's Free and Pro (Premium) account tiers across Supabase, circle capacity limits, and Pro Circle Inheritance.

---

## 1. Test Account Credentials

| Account | Email / Username | Password | Role & Display Name | Subscription Plan | Supabase User ID |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Free Tier** | `tester.free@pact.travel` | `PactTest2026!` | Free Tier Tester | `free` | `50da717a-9575-40fd-b0f6-ae67d4617680` |
| **Pro / Premium** | `tester.pro@pact.travel` | `PactTest2026!` | Pro Tier Tester | `premium_annual` | `c57afb73-0639-4fbf-a968-2671f10a8949` |

> [!NOTE]
> Both accounts are registered in Supabase Auth. The client automatically syncs plan status from `public.subscriptions` and Supabase user metadata with local storage persistence across sessions.

---

## 2. Feature & Tier Limit Matrix

| Capability | Free Tier Account (`tester.free@pact.travel`) | Pro Tier Account (`tester.pro@pact.travel`) |
| :--- | :--- | :--- |
| **Max Travelers per Circle** | **Up to 8 members** (Default: 5) | **Up to 24 members** (Organizer Pass) |
| **Circle Overflow (9–24)** | ❌ Blocked (Requires Organizer Pass upgrade) | ✅ Fully unlocked (organize up to 24 travelers) |
| **Circle Overflow (25+)** | ❌ Blocked (Requires Enterprise Plan) | ❌ Blocked (Requires Enterprise Plan) |
| **Concurrent Active Circles** | **1 active circle** | **Unlimited active circles** |
| **Pro Circle Inheritance** | ❌ Guests stay on Free tier | ✅ **All invited guests in circle inherit Pro** |
| **App Header / Settings Badge** | `FREE ≤5` badge (Gray) | `PACT PRO` Gold Crown badge & `PASS` |
| **AI Compromise Whisperer** | Standard rate limit | Unlimited priority compromise prompts |
| **Trip Brief Export** | View on screen | Unlocked PDF & Calendar (.ics) export |

---

## 3. Step-by-Step Testing Strategy

### Scenario A: Testing the Free Tier Account (`tester.free@pact.travel`)

1. **Sign In**:
   - Open the app navigation bar or visit `/auth`.
   - Select **Sign In**.
   - Enter `tester.free@pact.travel` and `PactTest2026!`.
   - Tap **Sign In to Your Spaces**.
   - *Expected Result*: Lands on Home screen with profile name `Free Tier Tester` and badge `FREE ≤5`.

2. **Verify Settings Page**:
   - Navigate to `/settings`.
   - *Expected Result*:
     - Plan card displays `FREE TIER`.
     - Circle limit shows `1 active trip circle`.
     - Member limit shows `Up to 8 members per circle`.
     - CTA button displays `Buy a Group Pass`.

3. **Test Allowed Circle Creation (5 Members)**:
   - Tap **+ Create Trip Circle** or visit `/create-circle`.
   - Enter Trip Name: `Goa Weekend 2026`.
   - Set Member Count: `5` (or any number between 1 and 8).
   - Tap **Create Circle**.
   - *Expected Result*: Circle creates successfully and opens the Circle Hub.

4. **Test Blocked Capacity at 9+ Members**:
   - Navigate back to `/create-circle`.
   - Enter Member Count: `14` (or any number from 9 to 24).
   - *Expected Result*: Inline error appears:
     > *"The Free tier supports up to 8 members. This trip needs the PACT Organizer Pass (9–24 travelers)."*
   - Circle creation is prevented.

5. **Test Blocked Second Circle**:
   - Try to create a second circle while one active circle already exists.
   - *Expected Result*: Blocked with error:
     > *"The Free tier includes 1 active trip circle. Upgrade to a group pass to organize more circles."*

---

### Scenario B: Testing the Pro Tier Account (`tester.pro@pact.travel`)

1. **Sign In**:
   - In `/settings`, tap **Sign Out** (or clear account data).
   - Visit `/auth` and select **Sign In**.
   - Enter `tester.pro@pact.travel` and `PactTest2026!`.
   - Tap **Sign In to Your Spaces**.
   - *Expected Result*: Lands on Home screen with profile name `Pro Tier Tester` and Gold `PASS` badge.

2. **Verify Settings Page**:
   - Navigate to `/settings`.
   - *Expected Result*:
     - Plan card displays `PACT PRO` with a Gold Crown icon.
     - Circle limit shows `Unlimited trip circles`.
     - Member limit shows `Up to 24 members per circle`.
     - Status pill displays `PACT Pro organizer pass active`.

3. **Test Large Circle Creation (16 Members)**:
   - Navigate to `/create-circle`.
   - Enter Trip Name: `Alps Ski Expedition 2026`.
   - Set Member Count: `16`.
   - Tap **Create Circle**.
   - *Expected Result*:
     - Circle creates without any upgrade block.
     - Circle Hub opens displaying `16 Members` capacity.
     - Circle has `hasPro: true`.

4. **Test Unlimited Circles (Create 2nd Circle)**:
   - Navigate back to `/create-circle`.
   - Create a second circle: `Tokyo Food Tour 2026` with `10` members.
   - *Expected Result*:
     - Creates without restriction. Both circles appear in your active circles list.

5. **Test Pro Circle Inheritance**:
   - Copy the invite code of the Pro circle (e.g., `ALPS-XXXX`).
   - Open `/join/[code]` as a guest user.
   - Join the circle.
   - *Expected Result*:
     - The guest inherits the circle's Pro status (`has_pro: true`).
     - AI Compromise Whisperer, deadlock tools, and photo vaults are accessible without demanding the guest purchase an individual subscription.

6. **Test Enterprise Ceiling (25+ Members)**:
   - In `/create-circle`, enter `30` members.
   - *Expected Result*: Blocked with message:
     > *"Circles larger than 24 members require an Enterprise Custom Plan. Please contact the organizer / support team for pricing details."*

---

## 4. Automated Test Verification

This entire strategy is validated by the automated test suite:
- **Test File**: `src/lib/user/__tests__/proVsFreeAccounts.test.mjs`
- **Execution Command**:
  ```bash
  node --test src/lib/user/__tests__/proVsFreeAccounts.test.mjs
  ```
- **Coverage**:
  1. `Step 1`: Credential integrity for both accounts.
  2. `Step 2`: Free account login, 8-member cap, and 1-circle cap.
  3. `Step 3`: Pro account login, 24-member expansion, and unlimited circles.
  4. `Step 4`: Pro circle inheritance propagating to guest members.
