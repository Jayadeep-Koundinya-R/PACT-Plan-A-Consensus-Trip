import {
  DateRange,
  MemberPreference,
  TripOption,
  MemberScoreBreakdown,
  ScoredTripOption,
  DeadlockDiagnosis,
  ConsensusResult
} from './types';
import { generatePlainEnglishReason, generateDeadlockAdvice } from './templates';

export const WEIGHTS = {
  DATE: 0.35,
  BUDGET: 0.35,
  TAG: 0.25
} as const;

export const CONSENSUS_THRESHOLD = 70; // 70% consensus required

/**
 * Converts a "YYYY-MM-DD" date string to epoch day number (UTC).
 */
export function dateStringToDays(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24));
}

/**
 * Calculates date overlap score (0.0 to 1.0).
 * Score = max(overlap_days across member ranges) / trip_duration
 */
export function calculateDateScore(
  memberRanges: DateRange[],
  tripStartStr: string,
  tripEndStr: string
): { score: number; overlapDays: number; tripDuration: number } {
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

/**
 * Calculates budget score (0.0 to 1.0).
 * - Within min-max: 1.0
 * - Below min: tripCost / min (discounted perception)
 * - Above max: 0.0 (unaffordable)
 */
export function calculateBudgetScore(
  memberMin: number,
  memberMax: number,
  tripCost: number
): number {
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

/**
 * Calculates tag match score (0.0 to 1.0).
 * intersection / |member's tags|
 */
export function calculateTagScore(
  memberTags: string[],
  tripTags: string[]
): { score: number; matchedTags: string[] } {
  if (!memberTags || memberTags.length === 0) {
    return { score: 1.0, matchedTags: [] };
  }

  const tripTagSet = new Set(tripTags.map((t) => t.toLowerCase().trim()));
  const matchedTags: string[] = [];

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

/**
 * Checks if any dealbreaker keyword appears in trip metadata.
 */
export function checkDealbreakers(
  dealbreakers: string[] | undefined,
  option: TripOption
): { hit: boolean; reason?: string } {
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
    // Also split by commas if stored as a single comma-separated string
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

/**
 * Evaluates a single member's preference against a candidate trip option.
 */
export function scoreMemberForOption(
  member: MemberPreference,
  option: TripOption
): MemberScoreBreakdown {
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

/**
 * Scores a trip option across all submitted member preferences.
 */
export function scoreTripOption(
  option: TripOption,
  preferences: MemberPreference[]
): ScoredTripOption {
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

  // Flag if > 30% of responding members cannot afford it
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

/**
 * Ranks multiple trip options from highest to lowest score.
 */
export function rankTripOptions(
  options: TripOption[],
  preferences: MemberPreference[]
): ScoredTripOption[] {
  const scored = options.map((opt) => scoreTripOption(opt, preferences));

  // Sort primarily by totalScore descending, then by consensusPercent descending
  scored.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return b.consensusPercent - a.consensusPercent;
  });

  // Assign 1-indexed ranks
  return scored.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

/**
 * Detects if consensus is blocked and diagnoses the cause.
 */
export function detectDeadlock(
  rankedOptions: ScoredTripOption[]
): DeadlockDiagnosis {
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

  let primaryCause: 'budget_gap' | 'date_conflict' | 'dealbreakers' | 'split_support' = 'split_support';

  if (top.dealbreakerHitCount > 0) {
    primaryCause = 'dealbreakers';
  } else if (top.budgetGapFlag || top.budgetGapCount >= top.dateConflictCount && top.budgetGapCount > 0) {
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

/**
 * Main engine entrypoint: calculates complete consensus results for a group.
 */
export function calculateConsensus(
  groupId: string,
  totalGroupMembersCount: number,
  options: TripOption[],
  preferences: MemberPreference[]
): ConsensusResult {
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
