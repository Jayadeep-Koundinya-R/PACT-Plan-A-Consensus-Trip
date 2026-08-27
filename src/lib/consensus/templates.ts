import { MemberScoreBreakdown, TripOption } from './types';

/**
 * Deterministically constructs a human-friendly plain English explanation for a trip option's score.
 */
export function generatePlainEnglishReason(
  option: TripOption,
  breakdowns: MemberScoreBreakdown[],
  totalMembers: number
): string {
  if (totalMembers === 0) return 'No member preferences submitted yet.';

  const viableCount = breakdowns.filter((b) => b.isViable).length;
  const budgetFitCount = breakdowns.filter((b) => b.budgetScore > 0).length;
  const dateFitCount = breakdowns.filter((b) => b.dateScore > 0).length;
  const dealbreakerHits = breakdowns.filter((b) => b.dealbreakerHit);
  const overBudgetMembers = breakdowns.filter((b) => b.budgetScore === 0);
  const dateConflictMembers = breakdowns.filter((b) => b.dateScore === 0);

  // Perfect 100% consensus
  if (viableCount === totalMembers) {
    if (budgetFitCount === totalMembers && dateFitCount === totalMembers) {
      return `Works for everyone! Fits all ${totalMembers} member budgets & dates with great preference match.`;
    }
    return `Dates and budget work for all ${totalMembers} responding members with no dealbreakers.`;
  }

  // Dealbreaker cases
  if (dealbreakerHits.length > 0) {
    const names = dealbreakerHits.map((d) => d.userName).join(', ');
    const reasons = dealbreakerHits
      .map((d) => `"${d.dealbreakerReason}" for ${d.userName}`)
      .join('; ');
    if (dealbreakerHits.length === 1) {
      return `Dealbreaker triggered: ${reasons}. Overrides other preferences for ${names}.`;
    }
    return `Dealbreakers triggered for ${dealbreakerHits.length} members (${names}): ${reasons}.`;
  }

  // Budget and Date mismatch combinations
  if (overBudgetMembers.length > 0 && dateConflictMembers.length > 0) {
    return `Over budget for ${overBudgetMembers.length} members (${overBudgetMembers.map(m => m.userName).join(', ')}), dates don't fit for ${dateConflictMembers.length} members (${dateConflictMembers.map(m => m.userName).join(', ')}).`;
  }

  if (overBudgetMembers.length > 0) {
    return `Matches dates for everyone, but exceeds max budget ($${option.budgetPerPerson}/person) for ${overBudgetMembers.length} members.`;
  }

  if (dateConflictMembers.length > 0) {
    const names = dateConflictMembers.map((m) => m.userName).join(', ');
    return `Fits everyone's budget, but dates have no overlap for ${names}.`;
  }

  return `Matches ${viableCount}/${totalMembers} members' constraints with moderate preference alignment.`;
}

/**
 * Diagnostic advice generator for deadlock situations.
 */
export function generateDeadlockAdvice(
  primaryCause: 'budget_gap' | 'date_conflict' | 'dealbreakers' | 'split_support' | 'none',
  budgetGapCount: number,
  dateConflictCount: number,
  dealbreakerHitCount: number
): { diagnosisText: string; organizerSuggestions: string[] } {
  switch (primaryCause) {
    case 'budget_gap':
      return {
        diagnosisText: `Significant budget division: ${budgetGapCount} members cannot afford the current top options.`,
        organizerSuggestions: [
          'Filter for lower-cost accommodation or destinations under budget caps.',
          'Consider subsidized group booking or tiered lodging options.',
          'Ask members with higher budgets if they are open to compromise on lodging tier.'
        ]
      };
    case 'date_conflict':
      return {
        diagnosisText: `Date schedule bottleneck: ${dateConflictCount} members have zero calendar overlap with current dates.`,
        organizerSuggestions: [
          'Shift dates into long weekend windows (e.g. Fri-Mon) to minimize PTO requirements.',
          'Propose a split schedule where some members arrive 1-2 days early/late.',
          'Poll group to expand allowable date windows by 1 week.'
        ]
      };
    case 'dealbreakers':
      return {
        diagnosisText: `Explicit dealbreakers triggered for ${dealbreakerHitCount} members.`,
        organizerSuggestions: [
          'Review flagged dealbreakers in private to see if itinerary adjustments can resolve them.',
          'Choose an alternative destination category that satisfies non-negotiable constraints.'
        ]
      };
    case 'split_support':
      return {
        diagnosisText: 'Group preferences are split evenly across different trip styles (e.g., Beach vs Mountains).',
        organizerSuggestions: [
          'Hold a quick 24-hour runoff vote between top 2 viable candidates.',
          'Organizer selects the final destination based on secondary factors (ease of transit, weather).'
        ]
      };
    default:
      return {
        diagnosisText: 'Consensus has been successfully reached!',
        organizerSuggestions: ['Proceed to Trip Brief generation and finalize reservations.']
      };
  }
}
