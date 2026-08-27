export type SubscriptionPlan = 'free' | 'premium_monthly' | 'premium_annual';

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  priceFormatted: string;
  billingPeriod: string;
  badge?: string;
  features: string[];
}

export const REVENUECAT_PRODUCTS: Record<SubscriptionPlan, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Standard',
    priceFormatted: '$0',
    billingPeriod: 'Forever Free',
    features: [
      '1 Active Trip Circle',
      '1 Active Consensus Decision',
      'Deterministic Math Scoring',
      'Silent Voting Room & Aggregate Counts',
      'Standard Trip Brief Export'
    ]
  },
  premium_monthly: {
    id: 'premium_monthly',
    name: 'PACT Pro Monthly',
    priceFormatted: '$4.99',
    billingPeriod: 'per month',
    badge: 'Popular',
    features: [
      'Unlimited Active Circles & Trips',
      'AI-Powered Conflict Explanation Layer',
      'Deep Schedule & Budget Conflict Diagnosis',
      'Custom Styled Trip Brief Themes',
      'Priority Support for Group Organizers'
    ]
  },
  premium_annual: {
    id: 'premium_annual',
    name: 'PACT Pro Annual',
    priceFormatted: '$39.99',
    billingPeriod: 'per year ($3.33/mo)',
    badge: 'Save 33%',
    features: [
      'Everything in Pro Monthly',
      '33% Annual Discount',
      'Exportable Calendar (.ICS) Generation',
      'Early Access to New Consensus Models'
    ]
  }
};

export function isProMember(plan: SubscriptionPlan): boolean {
  return plan === 'premium_monthly' || plan === 'premium_annual';
}

export function canCreateCircle(plan: SubscriptionPlan, existingCount: number): boolean {
  if (isProMember(plan)) return true;
  return existingCount < 1;
}

export function generateAIEnhancedExplanation(
  optionName: string,
  totalScore: number,
  consensusPercent: number,
  plainReason: string
): string {
  if (consensusPercent >= 100) {
    return `🤖 PACT AI Analysis: "${optionName}" achieved absolute Pareto efficiency. All 5 participants' constraints align without date collisions or budget pressure. Recommended organizer action: Finalize reservations immediately.`;
  }
  if (totalScore >= 70) {
    return `🤖 PACT AI Analysis: Strong group compromise (${totalScore}% compatibility). While not everyone's #1 personal style choice, it preserves inclusion for 100% of participants without triggering any non-negotiable dealbreakers.`;
  }
  return `🤖 PACT AI Analysis: Conflict breakdown detected. ${plainReason}. Recommendation: If considering this destination, the group organizer should propose splitting into two mini-itineraries or adjusting departure by 2 days.`;
}
