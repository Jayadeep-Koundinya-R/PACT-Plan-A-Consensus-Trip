import { CustomerInfo } from 'react-native-purchases';

export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_annual';

/**
 * The RevenueCat entitlement identifier — must match the dashboard configuration.
 */
export const ENTITLEMENT_ID = 'pro_access';

/**
 * Pure derivation of SubscriptionPlan from a RevenueCat CustomerInfo object.
 * No side effects, no store imports.
 *
 * Returns:
 *   'premium_annual'  — if pro_access entitlement is active and product ID contains 'annual'
 *   'premium_monthly' — if pro_access entitlement is active and product ID does not contain 'annual'
 *   'free'            — if pro_access entitlement is absent or inactive
 */
export function deriveSubscriptionPlan(info: CustomerInfo): SubscriptionPlan {
  const active = info?.entitlements?.active ?? {};
  if (!active[ENTITLEMENT_ID]) return 'free';
  const productId = active[ENTITLEMENT_ID]?.productIdentifier ?? '';
  if (productId.includes('annual')) return 'premium_annual';
  return 'premium_monthly';
}
