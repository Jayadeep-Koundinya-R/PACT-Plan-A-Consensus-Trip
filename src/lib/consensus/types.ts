export interface DateRange {
  start: string; // ISO format "YYYY-MM-DD"
  end: string;   // ISO format "YYYY-MM-DD"
}

export interface MemberPreference {
  userId: string;
  userName: string;
  avatarUrl?: string;
  dateRanges: DateRange[];
  budgetMin: number;
  budgetMax: number;
  tags: string[];
  dealbreakers?: string[];
  submittedAt?: string;
}

export interface TripOption {
  id: string;
  groupId: string;
  name: string;
  destinationType: string;
  dateStart: string; // ISO format "YYYY-MM-DD"
  dateEnd: string;   // ISO format "YYYY-MM-DD"
  budgetPerPerson: number;
  tags: string[];
  description?: string;
}

export interface MemberScoreBreakdown {
  userId: string;
  userName: string;
  dateScore: number;       // 0.0 - 1.0
  dateOverlapDays: number;
  tripDurationDays: number;
  budgetScore: number;     // 0.0 - 1.0
  tagScore: number;        // 0.0 - 1.0
  matchedTags: string[];
  dealbreakerHit: boolean;
  dealbreakerReason?: string;
  memberScore: number;     // 0.0 - 1.0 (weighted sum or 0 if dealbreaker)
  isViable: boolean;       // dateScore > 0 && budgetScore > 0 && !dealbreakerHit
}

export interface ScoredTripOption {
  option: TripOption;
  rank: number;
  totalScore: number;            // 0 - 100
  consensusPercent: number;      // 0 - 100 (% of members where isViable = true)
  budgetGapFlag: boolean;        // true if >30% cannot afford (budgetScore == 0)
  budgetGapCount: number;
  dateConflictCount: number;
  dealbreakerHitCount: number;
  memberBreakdowns: MemberScoreBreakdown[];
  plainEnglishReason: string;
  aiExplanation?: string;
}

export interface DeadlockDiagnosis {
  isDeadlocked: boolean;
  topOptionConsensus: number;
  primaryCause: 'budget_gap' | 'date_conflict' | 'dealbreakers' | 'split_support' | 'none';
  diagnosisText: string;
  organizerSuggestions: string[];
}

export interface ConsensusResult {
  groupId: string;
  totalMembersCount: number;
  respondedMembersCount: number;
  rankedOptions: ScoredTripOption[];
  winningOption?: ScoredTripOption;
  deadlockDiagnosis: DeadlockDiagnosis;
  consensusReached: boolean;
}
