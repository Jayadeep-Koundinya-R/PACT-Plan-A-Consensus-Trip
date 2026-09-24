import { DEMO_GROUP_ID, DEMO_TRIP_OPTIONS, DEMO_MEMBERS } from './seedData.js';
import { calculateConsensus } from './engine.js';

export function extractDestinationAndVibe(groupName) {
  if (!groupName || !groupName.trim()) {
    return { destination: 'Destination', vibe: 'Getaway', category: 'getaway' };
  }

  const clean = groupName.replace(/\b(202\d|203\d|trip|circle|group|reunion|escape|vacation|tour|travel|retreat|getaway|tech|skiing|ski|surf|surfing|walk|walking)\b/gi, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);

  const raw = words.length > 0 ? words.join(' ') : groupName.trim();

  const nameLower = groupName.toLowerCase();
  let category = 'getaway';

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

export function resolveTripOptionsForCircle(circleId, groupName, members) {
  if (circleId === DEMO_GROUP_ID || circleId === 'circle-college-reunion-2026') {
    const consensus = calculateConsensus(DEMO_GROUP_ID, DEMO_MEMBERS.length, DEMO_TRIP_OPTIONS, DEMO_MEMBERS);
    return {
      options: DEMO_TRIP_OPTIONS,
      consensus,
      scoredOptions: consensus.rankedOptions
    };
  }

  const { destination, vibe, category } = extractDestinationAndVibe(groupName);

  let targetBudget = 750;
  if (members && members.length > 0) {
    const budgets = members
      .map((m) => m.budgetMax || m.budget_max)
      .filter((b) => typeof b === 'number' && b > 0);
    if (budgets.length > 0) {
      targetBudget = Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length);
    }
  }

  const opt1Budget = Math.round(targetBudget * 0.9);
  const opt2Budget = Math.round(targetBudget * 0.75);
  const opt3Budget = Math.round(targetBudget * 1.15);

  const dynamicCandidates = [
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

  const formattedPreferences = (members && members.length > 0
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
