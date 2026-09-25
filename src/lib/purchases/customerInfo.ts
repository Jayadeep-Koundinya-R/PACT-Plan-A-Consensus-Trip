import type { CustomerInfo } from 'react-native-purchases';

export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_annual';

/**
 * The RevenueCat entitlement identifier — must match the dashboard configuration.
 */
export const ENTITLEMENT_ID = 'pro_access';
export const ALT_ENTITLEMENT_ID = 'pact_pro';

/**
 * Pure derivation of SubscriptionPlan from a RevenueCat CustomerInfo object.
 * No side effects, no store imports.
 *
 * Returns:
 *   'premium_annual'  — if pro_access or pact_pro entitlement is active and product ID contains 'annual'
 *   'premium_monthly' — if pro_access or pact_pro entitlement is active and product ID does not contain 'annual'
 *   'free'            — if pro entitlement is absent or inactive
 */
export function deriveSubscriptionPlan(info: CustomerInfo): SubscriptionPlan {
  const active = info?.entitlements?.active ?? {};
  const ent = active[ENTITLEMENT_ID] ?? active[ALT_ENTITLEMENT_ID];
  if (!ent) return 'free';
  const productId = ent?.productIdentifier ?? '';
  if (productId.includes('annual')) return 'premium_annual';
  return 'premium_monthly';
}
