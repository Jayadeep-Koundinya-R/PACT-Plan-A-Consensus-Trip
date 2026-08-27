import { MemberPreference } from '../consensus/types';

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

/**
 * Enforces Row Level Security (RLS) rule:
 * Users can only read their own private preferences.
 */
export function fetchMemberPreferenceSecure(
  currentUserId: string,
  targetUserId: string,
  allPreferences: MemberPreference[]
): MemberPreference | null {
  if (currentUserId !== targetUserId) {
    throw new SecurityError(
      `Access Denied: User "${currentUserId}" is not authorized to read private preferences of user "${targetUserId}".`
    );
  }

  const preference = allPreferences.find((p) => p.userId === targetUserId);
  return preference || null;
}

/**
 * Enforces Silent Voting privacy rule:
 * Reader queries on votes NEVER expose individual member ballots or user IDs.
 * Only aggregate counts and percentages are returned.
 */
export function getOptionVoteAggregateSecure(
  optionId: string,
  rawVoteStore: Record<string, boolean>
): { optionId: string; totalVotes: number; approvedVotes: number; approvalPercentage: number } {
  const matchingKeys = Object.keys(rawVoteStore).filter((k) => k.startsWith(`${optionId}_`));
  const totalVotes = matchingKeys.length;
  const approvedVotes = matchingKeys.filter((k) => rawVoteStore[k] === true).length;
  const approvalPercentage = totalVotes > 0 ? Math.round((approvedVotes / totalVotes) * 100) : 0;

  return {
    optionId,
    totalVotes,
    approvedVotes,
    approvalPercentage
  };
}

/**
 * Enforces Organizer-Only Finalization rule:
 * Only the group organizer can finalize the trip decision.
 */
export function assertOrganizerCanFinalize(
  callerUserId: string,
  organizerUserId: string,
  consensusPercent: number
): boolean {
  if (callerUserId !== organizerUserId) {
    throw new AuthorizationError(
      `Permission Denied: User "${callerUserId}" is not the group organizer ("${organizerUserId}"). Only the organizer can finalize the trip.`
    );
  }

  if (consensusPercent < 70) {
    throw new AuthorizationError(
      `Cannot finalize trip: Consensus is at ${consensusPercent}%, which is below the required 70% threshold.`
    );
  }

  return true;
}
