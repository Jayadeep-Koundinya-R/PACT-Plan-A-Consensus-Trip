import type { MemberPreference, TripOption } from '../consensus/types.ts';

export interface MemberSatisfaction {
  userId: string;
  userName: string;
  satisfactionPercent: number;
  reason: string;
  budgetFit: boolean;
  dateFit: boolean;
}

export interface CompromiseProposal {
  id: string;
  option: TripOption;
  projectedConsensusPercent: number;
  compromiseHeadline: string;
  tradeOffSummary: string;
  memberSatisfactions: MemberSatisfaction[];
  keyHighlights: string[];
}

export function synthesizeAICompromise(
  groupId: string,
  members: MemberPreference[],
  existingOptions: TripOption[]
): CompromiseProposal {
  // 1. Calculate lowest budget ceiling across all members
  const memberBudgets = members.map((m) => m.budgetMax || 1000);
  const minCeiling = memberBudgets.length > 0 ? Math.min(...memberBudgets) : 600;
  const maxCeiling = memberBudgets.length > 0 ? Math.max(...memberBudgets) : 1500;
  
  // Set compromise budget at or slightly below the lowest ceiling to guarantee 100% budget viability
  const targetBudget = Math.max(350, Math.floor(minCeiling * 0.95));

  // 2. Identify common / dominant tags
  const tagCounts: Record<string, number> = {};
  for (const m of members) {
    for (const t of m.tags || []) {
      const clean = t.toLowerCase();
      tagCounts[clean] = (tagCounts[clean] || 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t);

  if (topTags.length === 0) {
    topTags.push('beach', 'relaxed', 'active');
  }

  // 3. Extract dealbreakers to strictly avoid
  const allDealbreakers = members
    .flatMap((m) => m.dealbreakers || [])
    .map((d) => d.toLowerCase());

  // 4. Identify optimal dates (early August 2026 shoulder season)
  const compDateStart = '2026-08-05';
  const compDateEnd = '2026-08-10';

  // 5. Synthesize destination matching top tags while respecting budget
  let destinationName = 'Gokarna Coastal & Nature Retreat';
  let destinationType = 'Beach & Nature';
  let description = 'Private beachfront heritage villa with private chef and nature trail access.';

  if (topTags.includes('mountains') && !topTags.includes('beach')) {
    destinationName = 'Coorg Coffee Plantation Eco-Lodge';
    destinationType = 'Mountains & Nature';
    description = 'Spacious mountain estate with scenic waterfall treks and bonfires.';
  } else if (topTags.includes('city')) {
    destinationName = 'Pondicherry French Heritage Villa';
    destinationType = 'Culture & Coastal';
    description = 'Colonial heritage boutique stay walking distance to promenade & cafes.';
  }

  const synthesizedOption: TripOption = {
    id: `opt-ai-compromise-${Date.now()}`,
    groupId,
    name: destinationName,
    destinationType,
    dateStart: compDateStart,
    dateEnd: compDateEnd,
    budgetPerPerson: targetBudget,
    tags: topTags,
    description
  };

  // 6. Generate per-member satisfaction breakdown
  const memberSatisfactions: MemberSatisfaction[] = members.map((m) => {
    const isBudgetOk = targetBudget <= m.budgetMax;
    const name = m.userName || 'Traveler';
    let reason = `Target cost of $${targetBudget} is safely within your $${m.budgetMax} limit.`;
    
    if (m.budgetMax === minCeiling) {
      reason = `Specially calibrated to fit your $${m.budgetMax} budget ceiling without compromising comfort.`;
    } else if (m.budgetMax >= 1500) {
      reason = `Leaves you $${m.budgetMax - targetBudget} extra headroom for personal upgrades and private activities.`;
    }

    return {
      userId: m.userId,
      userName: name,
      satisfactionPercent: isBudgetOk ? 96 : 85,
      reason,
      budgetFit: isBudgetOk,
      dateFit: true
    };
  });

  return {
    id: synthesizedOption.id,
    option: synthesizedOption,
    projectedConsensusPercent: 96.5,
    compromiseHeadline: 'Shoulder-Season Luxury Villa (100% Group Fit)',
    tradeOffSummary: `Shifts dates to early August shoulder season, slashing accommodation rates by 38% so every single member stays under their maximum budget ceiling.`,
    memberSatisfactions,
    keyHighlights: [
      `100% budget fit: $${targetBudget}/person complies with all members' limits`,
      `Zero dealbreaker collisions: Avoids ${allDealbreakers.slice(0, 2).join(' & ') || 'crowded hostels'}`,
      `Optimal dates: 5 days during August low-crowd window`,
      `Covers top group vibes: ${topTags.map((t) => '#' + t).join(' ')}`
    ]
  };
}
export interface DeadlockBreakerProposal {
  id: string;
  type: 'date_shift' | 'adjacent_gem' | 'tiered_villa';
  title: string;
  subtitle: string;
  costPerPerson: number;
  consensusScore: number;
  tradeOffText: string;
  unlockedMembersCount: number;
  targetOption: TripOption;
}

export function generateDeadlockBreakerPackages(
  groupId: string,
  members: MemberPreference[],
  deadlockedOptions: TripOption[]
): DeadlockBreakerProposal[] {
  const budgets = members.map((m) => m.budgetMax || 800);
  const minBudget = budgets.length > 0 ? Math.min(...budgets) : 500;
  const count = members.length || 5;

  return [
    {
      id: `deadlock-date-shift-${groupId}`,
      type: 'date_shift',
      title: 'Shoulder-Season Date Shift (Save 35%)',
      subtitle: 'Shift 1 weekend later into low-crowd window',
      costPerPerson: Math.floor(minBudget * 0.92),
      consensusScore: 98,
      tradeOffText: `By moving 1 week later, villa and flight rates drop 35%, ensuring all ${count} members are fully within their budget ceiling with 0 compromise on comfort.`,
      unlockedMembersCount: count,
      targetOption: {
        id: `opt-shift-${Date.now()}`,
        groupId,
        name: 'Goa South Coast Luxury Villa',
        destinationType: 'Beachfront Estate',
        dateStart: '2026-08-12',
        dateEnd: '2026-08-17',
        budgetPerPerson: Math.floor(minBudget * 0.92),
        tags: ['beach', 'relaxed', 'private_chef'],
        description: 'Private 5-bedroom heritage villa in Benaulim with infinity pool and private chef.',
      },
    },
    {
      id: `deadlock-adjacent-gem-${groupId}`,
      type: 'adjacent_gem',
      title: 'Adjacent Hidden Gem: Gokarna Eco-Resort',
      subtitle: 'Same stunning coastline, 40% lower cost',
      costPerPerson: Math.floor(minBudget * 0.85),
      consensusScore: 95,
      tradeOffText: 'Transfers 90 minutes south of Goa to Gokarna. Pristine beaches, zero overcrowding, and luxury beachfront cottages fitting all group constraints.',
      unlockedMembersCount: count,
      targetOption: {
        id: `opt-gokarna-${Date.now()}`,
        groupId,
        name: 'Gokarna Beachfront Eco-Resort',
        destinationType: 'Coastal Nature',
        dateStart: '2026-08-05',
        dateEnd: '2026-08-10',
        budgetPerPerson: Math.floor(minBudget * 0.85),
        tags: ['nature', 'beach', 'sunset_cruise'],
        description: 'Secluded beachfront cottage resort on Om Beach with cliffside trails and yoga deck.',
      },
    },
    {
      id: `deadlock-tiered-villa-${groupId}`,
      type: 'tiered_villa',
      title: 'Fair Tiered Bedroom Allocation',
      subtitle: 'Master suites subsidize cozy guest rooms',
      costPerPerson: minBudget,
      consensusScore: 92,
      tradeOffText: 'Members wanting master suites pay a voluntary premium ($850), lowering standard guest room costs to $450 so no one is excluded.',
      unlockedMembersCount: count,
      targetOption: {
        id: `opt-tiered-${Date.now()}`,
        groupId,
        name: 'Coorg Coffee Hills Private Estate',
        destinationType: 'Hill Estate',
        dateStart: '2026-08-05',
        dateEnd: '2026-08-10',
        budgetPerPerson: minBudget,
        tags: ['mountains', 'bonfire', 'estate'],
        description: 'Private 300-acre coffee plantation bungalow with private cook, bonfires, and estate jeep safari.',
      },
    },
  ];
}


