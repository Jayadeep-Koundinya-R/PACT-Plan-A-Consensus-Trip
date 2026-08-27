import { generatePlainEnglishReason, generateDeadlockAdvice } from './templates.js';

export const WEIGHTS = {
  DATE: 0.35,
  BUDGET: 0.35,
  TAG: 0.25
};

export const CONSENSUS_THRESHOLD = 70;

export function dateStringToDays(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24));
}

export function calculateDateScore(memberRanges, tripStartStr, tripEndStr) {
  if (!memberRanges || memberRanges.length === 0) {
    return { score: 0, overlapDays: 0, tripDuration: 0 };
  }

  const tripStart = dateStringToDays(tripStartStr);
  const tripEnd = dateStringToDays(tripEndStr);
  const tripDuration = Math.max(1, tripEnd - tripStart + 1);

  let maxOverlapDays = 0;

  for (const range of memberRanges) {
    const rangeStart = dateStringToDays(range.start);
    const rangeEnd = dateStringToDays(range.end);

    const overlapStart = Math.max(rangeStart, tripStart);
    const overlapEnd = Math.min(rangeEnd, tripEnd);

    if (overlapEnd >= overlapStart) {
      const days = overlapEnd - overlapStart + 1;
      if (days > maxOverlapDays) {
        maxOverlapDays = days;
      }
    }
  }

  const score = Math.min(1.0, maxOverlapDays / tripDuration);
  return {
    score: Number(score.toFixed(4)),
    overlapDays: maxOverlapDays,
    tripDuration
  };
}

export function calculateBudgetScore(memberMin, memberMax, tripCost) {
  if (tripCost > memberMax) {
    return 0.0;
  }
  if (tripCost >= memberMin && tripCost <= memberMax) {
    return 1.0;
  }
  if (tripCost < memberMin) {
    if (memberMin <= 0) return 1.0;
    const ratio = tripCost / memberMin;
    return Number(Math.min(1.0, Math.max(0.1, ratio)).toFixed(4));
  }
  return 0.0;
}

export function calculateTagScore(memberTags, tripTags) {
  if (!memberTags || memberTags.length === 0) {
    return { score: 1.0, matchedTags: [] };
  }

  const tripTagSet = new Set(tripTags.map((t) => t.toLowerCase().trim()));
  const matchedTags = [];

  for (const tag of memberTags) {
    const cleanTag = tag.toLowerCase().trim();
    if (tripTagSet.has(cleanTag)) {
      matchedTags.push(tag);
    }
  }

  const score = matchedTags.length / memberTags.length;
  return {
    score: Number(score.toFixed(4)),
    matchedTags
  };
}

export function checkDealbreakers(dealbreakers, option) {
  if (!dealbreakers || dealbreakers.length === 0) {
    return { hit: false };
  }

  const searchableText = [
    option.name,
    option.destinationType,
    option.description || '',
    ...(option.tags || [])
  ]
    .join(' ')
    .toLowerCase();

  for (const rawDb of dealbreakers) {
    const items = rawDb.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    for (const item of items) {
      if (item.length > 0 && searchableText.includes(item)) {
        return {
          hit: true,
          reason: `Dealbreaker "${item}" matches trip characteristics`
        };
      }
    }
  }

  return { hit: false };
}

export function scoreMemberForOption(member, option) {
  const { score: dateScore, overlapDays, tripDuration } = calculateDateScore(
    member.dateRanges,
    option.dateStart,
    option.dateEnd
  );

  const budgetScore = calculateBudgetScore(
    member.budgetMin,
    member.budgetMax,
    option.budgetPerPerson
  );

  const { score: tagScore, matchedTags } = calculateTagScore(
    member.tags,
    option.tags
  );

  const dealbreakerResult = checkDealbreakers(member.dealbreakers, option);

  let memberScore = 0;
  if (!dealbreakerResult.hit) {
    memberScore =
      dateScore * WEIGHTS.DATE +
      budgetScore * WEIGHTS.BUDGET +
      tagScore * WEIGHTS.TAG;
  }

  const isViable = dateScore > 0 && budgetScore > 0 && !dealbreakerResult.hit;

  return {
    userId: member.userId,
    userName: member.userName,
    dateScore,
    dateOverlapDays: overlapDays,
    tripDurationDays: tripDuration,
    budgetScore,
    tagScore,
    matchedTags,
    dealbreakerHit: dealbreakerResult.hit,
    dealbreakerReason: dealbreakerResult.reason,
    memberScore: Number(memberScore.toFixed(4)),
    isViable
  };
}

export function scoreTripOption(option, preferences) {
  if (!preferences || preferences.length === 0) {
    return {
      option,
      rank: 0,
      totalScore: 0,
      consensusPercent: 0,
      budgetGapFlag: false,
      budgetGapCount: 0,
      dateConflictCount: 0,
      dealbreakerHitCount: 0,
      memberBreakdowns: [],
      plainEnglishReason: 'No member preferences submitted yet.'
    };
  }

  const memberBreakdowns = preferences.map((p) => scoreMemberForOption(p, option));
  const totalMembers = preferences.length;

  const totalScoreSum = memberBreakdowns.reduce((acc, m) => acc + m.memberScore, 0);
  const totalScore = Number(((totalScoreSum / totalMembers) * 100).toFixed(2));

  const viableCount = memberBreakdowns.filter((m) => m.isViable).length;
  const consensusPercent = Number(((viableCount / totalMembers) * 100).toFixed(1));

  const budgetGapCount = memberBreakdowns.filter((m) => m.budgetScore === 0).length;
  const dateConflictCount = memberBreakdowns.filter((m) => m.dateScore === 0).length;
  const dealbreakerHitCount = memberBreakdowns.filter((m) => m.dealbreakerHit).length;

  const budgetGapFlag = budgetGapCount / totalMembers > 0.3;

  const plainEnglishReason = generatePlainEnglishReason(
    option,
    memberBreakdowns,
    totalMembers
  );

  return {
    option,
    rank: 1,
    totalScore,
    consensusPercent,
    budgetGapFlag,
    budgetGapCount,
    dateConflictCount,
    dealbreakerHitCount,
    memberBreakdowns,
    plainEnglishReason
  };
}

export function rankTripOptions(options, preferences) {
  const scored = options.map((opt) => scoreTripOption(opt, preferences));

  scored.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.consensusPercent - a.consensusPercent;
  });

  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

export function detectDeadlock(rankedOptions) {
  if (rankedOptions.length === 0) {
    return {
      isDeadlocked: false,
      topOptionConsensus: 0,
      primaryCause: 'none',
      diagnosisText: 'No trip options available to evaluate.',
      organizerSuggestions: []
    };
  }

  const top = rankedOptions[0];
  const isDeadlocked = top.consensusPercent < CONSENSUS_THRESHOLD;

  if (!isDeadlocked) {
    const advice = generateDeadlockAdvice('none', 0, 0, 0);
    return {
      isDeadlocked: false,
      topOptionConsensus: top.consensusPercent,
      primaryCause: 'none',
      diagnosisText: advice.diagnosisText,
      organizerSuggestions: advice.organizerSuggestions
    };
  }

  let primaryCause = 'split_support';

  if (top.dealbreakerHitCount > 0) {
    primaryCause = 'dealbreakers';
  } else if (top.budgetGapFlag || (top.budgetGapCount >= top.dateConflictCount && top.budgetGapCount > 0)) {
    primaryCause = 'budget_gap';
  } else if (top.dateConflictCount > 0) {
    primaryCause = 'date_conflict';
  }

  const advice = generateDeadlockAdvice(
    primaryCause,
    top.budgetGapCount,
    top.dateConflictCount,
    top.dealbreakerHitCount
  );

  return {
    isDeadlocked: true,
    topOptionConsensus: top.consensusPercent,
    primaryCause,
    diagnosisText: advice.diagnosisText,
    organizerSuggestions: advice.organizerSuggestions
  };
}

export function calculateConsensus(groupId, totalGroupMembersCount, options, preferences) {
  const rankedOptions = rankTripOptions(options, preferences);
  const deadlockDiagnosis = detectDeadlock(rankedOptions);
  const winningOption =
    rankedOptions.length > 0 && !deadlockDiagnosis.isDeadlocked
      ? rankedOptions[0]
      : undefined;

  return {
    groupId,
    totalMembersCount: totalGroupMembersCount,
    respondedMembersCount: preferences.length,
    rankedOptions,
    winningOption,
    deadlockDiagnosis,
    consensusReached: !deadlockDiagnosis.isDeadlocked && rankedOptions.length > 0
  };
}
