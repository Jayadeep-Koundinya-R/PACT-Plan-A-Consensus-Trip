/**
 * PACT Pricing — Single flat USD Organizer Pass.
 * Free: 1–8 members | Organizer Pass: 9–24 members | Enterprise: 25+ members
 */

export type GroupTierId = 'free' | 'organizer_pass';

export const MAX_FREE_MEMBERS = 8;
export const MAX_GROUP_MEMBERS = 24;

export function isValidGroupSize(count: number): boolean {
  return count >= 1 && count <= MAX_GROUP_MEMBERS;
}

export interface GroupTier {
  id: GroupTierId;
  name: string;
  maxMembers: number;
  capacityLabel: string;
  recommendedFor: string;
  price: { amount: number; formatted: string };
  features: string[];
}

export const GROUP_TIERS: Record<GroupTierId, GroupTier> = {
  free: {
    id: 'free',
    name: 'Free',
    maxMembers: 8,
    capacityLabel: 'Up to 8 members',
    recommendedFor: 'Close friends & small group trips',
    price: { amount: 0, formatted: 'Free' },
    features: [
      'Up to 8 members',
      'Consensus engine with match %',
      'Silent sealed ballot',
      'Trip Brief with WhatsApp share'
    ]
  },
  organizer_pass: {
    id: 'organizer_pass',
    name: 'PACT Organizer Pass',
    maxMembers: 24,
    capacityLabel: 'Up to 24 members',
    recommendedFor: 'Full friend circles & larger group trips',
    price: { amount: 9.99, formatted: '$9.99' },
    features: [
      'Up to 24 members',
      'AI Compromise Whisperer',
      'Priority support',
      'Custom Trip Brief themes'
    ]
  }
};

export function getTierForMemberCount(count: number): GroupTier {
  return count <= 8 ? GROUP_TIERS.free : GROUP_TIERS.organizer_pass;
}

export function formatTierPrice(tier: GroupTier): string {
  return tier.price.formatted;
}
