export type CurrencyCode = 'USD' | 'EUR' | 'INR' | 'GBP';
export type GroupTierId = 'free' | 'tier_10';

export interface GroupTier {
  id: GroupTierId;
  name: string;
  capacityLabel: string;
  minMembers: number;
  maxMembers: number;
  badge?: string;
  recommendedFor: string;
  prices: {
    single: Record<CurrencyCode, { amount: number; formatted: string }>;
  };
  features: string[];
}

export const MAX_GROUP_MEMBERS = 10;

export const GROUP_TIERS: Record<GroupTierId, GroupTier> = {
  free: {
    id: 'free',
    name: 'Starter Circle',
    capacityLabel: 'Up to 5 members',
    minMembers: 1,
    maxMembers: 5,
    badge: '100% Free',
    recommendedFor: 'Small trips and weekend getaways',
    prices: {
      single: {
        USD: { amount: 0, formatted: '$0' },
        EUR: { amount: 0, formatted: '€0' },
        INR: { amount: 0, formatted: '₹0' },
        GBP: { amount: 0, formatted: '£0' }
      }
    },
    features: [
      'Up to 5 participants per circle',
      'Private constraint collection',
      'Silent voting and consensus brief'
    ]
  },
  tier_10: {
    id: 'tier_10',
    name: 'PACT Organizer Pass',
    capacityLabel: 'Up to 10 members',
    minMembers: 6,
    maxMembers: MAX_GROUP_MEMBERS,
    badge: 'One flat pass',
    recommendedFor: 'Friend groups, reunions, and small teams',
    prices: {
      single: {
        USD: { amount: 9.99, formatted: '$9.99' },
        EUR: { amount: 9.49, formatted: '€9.49' },
        INR: { amount: 799, formatted: '₹799' },
        GBP: { amount: 7.99, formatted: '£7.99' }
      }
    },
    features: [
      'Up to 10 participants per circle',
      'Only the organizer pays; invited members join free',
      'AI compromise assistance and unlimited voting rounds',
      'Exportable Trip Brief and calendar file'
    ]
  }
};

export function getTierForMemberCount(count: number): GroupTier {
  const n = Math.max(1, Math.floor(count || 1));
  return n <= 5 ? GROUP_TIERS.free : GROUP_TIERS.tier_10;
}

export function isValidGroupSize(count: number): boolean {
  return Number.isFinite(count) && count >= 1 && count <= MAX_GROUP_MEMBERS;
}

export function formatTierPrice(tier: GroupTier, currency: CurrencyCode): string {
  return tier.prices.single[currency].formatted;
}

export function getOperatorEmailLink(tripName = '', memberCount = MAX_GROUP_MEMBERS): string {
  const subject = encodeURIComponent(`PACT Organizer Pass Inquiry: ${tripName || 'Group Trip'} (${memberCount} Members)`);
  return `mailto:concierge@pact.travel?subject=${subject}`;
}
