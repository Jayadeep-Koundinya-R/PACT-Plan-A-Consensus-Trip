import { TripOption, MemberPreference, ScoredTripOption, ConsensusResult } from './types';
import { DEMO_GROUP_ID, DEMO_TRIP_OPTIONS, DEMO_MEMBERS } from './seedData';
import { calculateConsensus } from './engine';

/**
 * Cleanly extracts destination name and vibe keywords from a circle group title.
 * E.g., "Tokyo Tech Retreat 2026" -> { destination: "Tokyo", vibe: "Tech Retreat", category: "urban" }
 * "Paris Getaway" -> { destination: "Paris", vibe: "Getaway", category: "culture" }
 * "Swiss Alps Skiing" -> { destination: "Swiss Alps", vibe: "Skiing", category: "mountains" }
 */
export function extractDestinationAndVibe(groupName?: string): {
  destination: string;
  vibe: string;
  category: 'coastal' | 'mountains' | 'urban' | 'cultural' | 'getaway';
} {
  if (!groupName || !groupName.trim()) {
    return { destination: 'Destination', vibe: 'Getaway', category: 'getaway' };
  }

  const clean = groupName.replace(/\b(202\d|203\d|trip|circle|group|reunion|escape|vacation|tour|travel|retreat|getaway|tech|skiing|ski|surf|surfing|walk|walking)\b/gi, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);

  const raw = words.length > 0 ? words.join(' ') : groupName.trim();

  const nameLower = groupName.toLowerCase();
  let category: 'coastal' | 'mountains' | 'urban' | 'cultural' | 'getaway' = 'getaway';

  if (nameLower.includes('beach') || nameLower.includes('surf') || nameLower.includes('coastal') || nameLower.includes('island') || nameLower.includes('bali') || nameLower.includes('goa') || nameLower.includes('hawaii')) {
    category = 'coastal';
  } else if (nameLower.includes('ski') || nameLower.includes('mountain') || nameLower.includes('alps') || nameLower.includes('trek') || nameLower.includes('snow') || nameLower.includes('manali')) {
    category = 'mountains';
  } else if (nameLower.includes('tech') || nameLower.includes('city') || nameLower.includes('tokyo') || nameLower.includes('new york') || nameLower.includes('london')) {
    category = 'urban';
  } else if (nameLower.includes('culture') || nameLower.includes('heritage') || nameLower.includes('paris') || nameLower.includes('kyoto') || nameLower.includes('rome')) {
    category = 'cultural';
  }

  const destination = raw || 'Destination';
  const vibe = category === 'coastal' ? 'Beach & Coastal' : category === 'mountains' ? 'Alpine Adventure' : category === 'urban' ? 'Urban Culture' : category === 'cultural' ? 'Heritage & Cafes' : 'Retreat & Leisure';

  return { destination, vibe, category };
}

/**
 * Resolves candidate trip options dynamically for any circle.
 * For `circle-college-reunion-2026`, strictly returns canonical Goa/Manali demo options.
 * For custom circles, generates 3 dynamically scaled candidate options based on circle title, budget caps & dates.
 */
export function resolveTripOptionsForCircle(
  circleId: string,
  groupName?: string,
  members?: any[]
): {
  options: TripOption[];
  consensus: ConsensusResult;
  scoredOptions: ScoredTripOption[];
} {
  if (circleId === DEMO_GROUP_ID || circleId === 'circle-college-reunion-2026') {
    const consensus = calculateConsensus(DEMO_GROUP_ID, DEMO_MEMBERS.length, DEMO_TRIP_OPTIONS, DEMO_MEMBERS);
    return {
      options: DEMO_TRIP_OPTIONS,
      consensus,
      scoredOptions: consensus.rankedOptions
    };
  }

  const { destination, vibe, category } = extractDestinationAndVibe(groupName);

  // Derive target budget from member caps or default to $750
  let targetBudget = 750;
  if (members && members.length > 0) {
    const budgets = members
      .map((m) => m.budgetMax || m.budget_max)
      .filter((b): b is number => typeof b === 'number' && b > 0);
    if (budgets.length > 0) {
      targetBudget = Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length);
    }
  }

  // Construct 3 dynamic candidate options tailored to the destination
  const opt1Budget = Math.round(targetBudget * 0.9);
  const opt2Budget = Math.round(targetBudget * 0.75);
  const opt3Budget = Math.round(targetBudget * 1.15);

  const dynamicCandidates: TripOption[] = [
    {
      id: `opt-${circleId}-001`,
      groupId: circleId,
      name: `${destination} Central Villa`,
      destinationType: `${vibe} Core`,
      dateStart: '2026-10-14',
      dateEnd: '2026-10-19',
      budgetPerPerson: opt1Budget,
      tags: ['top-choice', category, 'central', 'relaxed'],
      description: `Premium centrally located accommodation in ${destination} matching group date windows and budget caps.`
    },
    {
      id: `opt-${circleId}-002`,
      groupId: circleId,
      name: `${destination} Heritage Loft`,
      destinationType: `${vibe} Alternative`,
      dateStart: '2026-10-12',
      dateEnd: '2026-10-17',
      budgetPerPerson: opt2Budget,
      tags: ['heritage', category, 'budget-friendly'],
      description: `Boutique heritage stay in ${destination} with flexible date overlap and budget-friendly rates.`
    },
    {
      id: `opt-${circleId}-003`,
      groupId: circleId,
      name: `${destination} Scenic Retreat`,
      destinationType: `${vibe} Premium`,
      dateStart: '2026-10-15',
      dateEnd: '2026-10-20',
      budgetPerPerson: opt3Budget,
      tags: ['scenic', category, 'luxury'],
      description: `Scenic luxury retreat on the outskirts of ${destination} with spacious amenities.`
    }
  ];

  // Map circle member inputs to engine MemberPreference structure
  const formattedPreferences: MemberPreference[] = (members && members.length > 0
    ? members.map((m, idx) => ({
        userId: m.userId || m.user_id || `user-${idx}`,
        userName: m.userName || m.name || `Traveler ${idx + 1}`,
        dateRanges: m.dateRanges || [{ start: '2026-10-12', end: '2026-10-20' }],
        budgetMin: m.budgetMin || Math.round(targetBudget * 0.5),
        budgetMax: m.budgetMax || targetBudget,
        tags: m.tags || ['relaxed', category]
      }))
    : DEMO_MEMBERS.map((m) => ({
        ...m,
        groupId: circleId
      })));

  const consensus = calculateConsensus(
    circleId,
    formattedPreferences.length,
    dynamicCandidates,
    formattedPreferences
  );

  return {
    options: dynamicCandidates,
    consensus,
    scoredOptions: consensus.rankedOptions
  };
}
