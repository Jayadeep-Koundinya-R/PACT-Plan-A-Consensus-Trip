export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'GBP';

export type GroupTierId = 'free' | 'tier_10' | 'tier_19' | 'tier_50' | 'tier_community';

export interface GroupTier {
  id: GroupTierId;
  name: string;
  capacityLabel: string;
  minMembers: number;
  maxMembers: number | null; // null for community (unlimited)
  badge?: string;
  recommendedFor: string;
  prices: {
    single: Record<CurrencyCode, { amount: number; formatted: string }>;
    annual: Record<CurrencyCode, { amount: number; formatted: string }>;
  };
  features: string[];
  isCustomQuote?: boolean;
}

export const GROUP_TIERS: Record<GroupTierId, GroupTier> = {
  free: {
    id: 'free',
    name: 'Starter Circle',
    capacityLabel: 'Up to 5 members',
    minMembers: 1,
    maxMembers: 5,
    badge: '100% Free',
    recommendedFor: 'Close friends, couples & weekend getaways',
    prices: {
      single: {
        USD: { amount: 0, formatted: '$0' },
        EUR: { amount: 0, formatted: '€0' },
        INR: { amount: 0, formatted: '₹0' },
        GBP: { amount: 0, formatted: '£0' }
      },
      annual: {
        USD: { amount: 0, formatted: '$0' },
        EUR: { amount: 0, formatted: '€0' },
        INR: { amount: 0, formatted: '₹0' },
        GBP: { amount: 0, formatted: '£0' }
      }
    },
    features: [
      'Up to 5 participants per circle',
      'Private budget & date constraint sealing',
      'Silent voting room with Pareto scoring',
      '1 active trip circle at a time',
      'Standard trip consensus brief'
    ]
  },
  tier_10: {
    id: 'tier_10',
    name: 'Small Circle',
    capacityLabel: '6 to 10 members',
    minMembers: 6,
    maxMembers: 10,
    badge: 'Most Popular',
    recommendedFor: 'Friend squads, bachelor trips & small teams',
    prices: {
      single: {
        USD: { amount: 9.99, formatted: '$9.99' },
        EUR: { amount: 9.49, formatted: '€9.49' },
        INR: { amount: 799, formatted: '₹799' },
        GBP: { amount: 7.99, formatted: '£7.99' }
      },
      annual: {
        USD: { amount: 29.99, formatted: '$29.99' },
        EUR: { amount: 27.99, formatted: '€27.99' },
        INR: { amount: 2499, formatted: '₹2,499' },
        GBP: { amount: 24.99, formatted: '£24.99' }
      }
    },
    features: [
      'Up to 10 participants per circle',
      'Only 1 person pays; 9 join 100% free',
      'AI Compromise Whisperer assistance',
      'Unlimited voting rounds & deadlock overrides',
      'Exportable iCal (.ICS) calendar sync'
    ]
  },
  tier_19: {
    id: 'tier_19',
    name: 'Extended Crew',
    capacityLabel: '11 to 19 members',
    minMembers: 11,
    maxMembers: 19,
    badge: 'Best Value',
    recommendedFor: 'College reunions, sports clubs & group travel',
    prices: {
      single: {
        USD: { amount: 19.99, formatted: '$19.99' },
        EUR: { amount: 18.99, formatted: '€18.99' },
        INR: { amount: 1499, formatted: '₹1,499' },
        GBP: { amount: 15.99, formatted: '£15.99' }
      },
      annual: {
        USD: { amount: 49.99, formatted: '$49.99' },
        EUR: { amount: 46.99, formatted: '€46.99' },
        INR: { amount: 3999, formatted: '₹3,999' },
        GBP: { amount: 39.99, formatted: '£39.99' }
      }
    },
    features: [
      'Up to 19 participants per circle',
      'Only 1 person pays; 18 join 100% free',
      'Multi-destination ranked matrix comparison',
      'Deep budget gap & lodging split analyzer',
      'Shared document vault & high-res album storage'
    ]
  },
  tier_50: {
    id: 'tier_50',
    name: 'Mega Group',
    capacityLabel: '20 to 50 members',
    minMembers: 20,
    maxMembers: 50,
    badge: 'Large Group',
    recommendedFor: 'Family reunions, destination weddings & retreats',
    prices: {
      single: {
        USD: { amount: 34.99, formatted: '$34.99' },
        EUR: { amount: 32.99, formatted: '€32.99' },
        INR: { amount: 2899, formatted: '₹2,899' },
        GBP: { amount: 28.99, formatted: '£28.99' }
      },
      annual: {
        USD: { amount: 79.99, formatted: '$79.99' },
        EUR: { amount: 74.99, formatted: '€74.99' },
        INR: { amount: 6499, formatted: '₹6,499' },
        GBP: { amount: 64.99, formatted: '£64.99' }
      }
    },
    features: [
      'Up to 50 participants per circle',
      'Only 1 person pays; 49 join 100% free',
      'Supermajority consensus algorithms (80% threshold)',
      'Bulk automated WhatsApp/SMS nudges',
      'Priority Gemini AI trip planning responses'
    ]
  },
  tier_community: {
    id: 'tier_community',
    name: 'Building & Community',
    capacityLabel: '50+ members / Residential Societies',
    minMembers: 51,
    maxMembers: null,
    badge: 'Concierge Assisted',
    recommendedFor: 'Apartment complexes, residential buildings & societies',
    isCustomQuote: true,
    prices: {
      single: {
        USD: { amount: 0, formatted: 'Custom Quote' },
        EUR: { amount: 0, formatted: 'Custom Quote' },
        INR: { amount: 0, formatted: 'Custom Quote' },
        GBP: { amount: 0, formatted: 'Custom Quote' }
      },
      annual: {
        USD: { amount: 0, formatted: 'Custom Quote' },
        EUR: { amount: 0, formatted: 'Custom Quote' },
        INR: { amount: 0, formatted: 'Custom Quote' },
        GBP: { amount: 0, formatted: 'Custom Quote' }
      }
    },
    features: [
      '50 to 500+ participants with zero lag',
      'Direct operator concierge coordination',
      'Multi-bus & wing-by-wing accommodation routing',
      'Community committee voting rules & quorum',
      'Direct billing, GST / tax invoices & operator hotline'
    ]
  }
};

/**
 * Determine the appropriate GroupTier based on traveler count.
 */
export function getTierForMemberCount(count: number): GroupTier {
  const n = Math.max(1, Math.floor(count || 1));
  if (n <= 5) return GROUP_TIERS.free;
  if (n <= 10) return GROUP_TIERS.tier_10;
  if (n <= 19) return GROUP_TIERS.tier_19;
  if (n <= 50) return GROUP_TIERS.tier_50;
  return GROUP_TIERS.tier_community;
}

/**
 * Format the price for a tier given the active currency and billing option.
 */
export function formatTierPrice(
  tier: GroupTier,
  currency: CurrencyCode = 'USD',
  billingPeriod: 'single' | 'annual' = 'single'
): string {
  if (tier.isCustomQuote) {
    return 'Contact Operator';
  }
  const pricing = tier.prices[billingPeriod][currency] || tier.prices[billingPeriod].USD;
  if (tier.id === 'free') {
    return 'Free';
  }
  return pricing.formatted;
}

/**
 * Generate a pre-filled mailto: link for building/community operator inquiries.
 */
export function getOperatorEmailLink(tripName = '', memberCount = 50): string {
  const subject = encodeURIComponent(`Community / Building Trip Inquiry: ${tripName || 'Large Group Trip'} (${memberCount}+ Members)`);
  const body = encodeURIComponent(
`Hello PACT Concierge & Operator Team,

We are planning a large community / residential building trip and would like to request assisted onboarding and custom pricing.

Trip / Community Name: ${tripName || 'Residential Community'}
Estimated Traveler Count: ${memberCount}
Target Destination(s):
Planned Dates / Season:
Organizer Contact:

Please share the bespoke operator pass details and multi-accommodation consensus setup.

Thank you!`
  );
  return `mailto:concierge@pact.travel?subject=${subject}&body=${body}`;
}
