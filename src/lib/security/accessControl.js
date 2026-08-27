export class SecurityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SecurityError';
  }
}

export class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export function fetchMemberPreferenceSecure(currentUserId, targetUserId, allPreferences) {
  if (currentUserId !== targetUserId) {
    throw new SecurityError(
      `Access Denied: User "${currentUserId}" is not authorized to read private preferences of user "${targetUserId}".`
    );
  }

  const preference = allPreferences.find((p) => p.userId === targetUserId);
  return preference || null;
}

export function getOptionVoteAggregateSecure(optionId, rawVoteStore) {
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

export function assertOrganizerCanFinalize(callerUserId, organizerUserId, consensusPercent) {
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
