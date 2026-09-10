/**
 * PACT Local P2P Consensus Engine
 * Enables zero-cloud, peer-to-peer ballot exchange and consensus scoring for in-person groups.
 */

export interface OfflineBallotPayload {
  circleId: string;
  circleName: string;
  voterId: string;
  voterName: string;
  budget: number;
  dates: string[];
  dealbreakers: string[];
  approvals: Record<string, boolean>;
  timestamp: number;
  checksum?: string;
}

export interface LocalConsensusCandidate {
  id: string;
  name: string;
  estimatedCost: number;
  availableDates: string[];
  tags: string[];
}

export interface LocalScoredCandidate {
  candidate: LocalConsensusCandidate;
  approvalScore: number;
  approvalRate: number;
  isParetoOptimal: boolean;
  vetoCount: number;
  budgetFit: boolean;
  dateOverlap: string[];
}

export interface LocalConsensusResult {
  winner: LocalConsensusCandidate | null;
  rankings: LocalScoredCandidate[];
  commonDates: string[];
  effectiveBudgetCeiling: number;
  totalBallots: number;
  isDeadlocked: boolean;
  status: 'consensus_reached' | 'deadlocked' | 'insufficient_ballots';
}

const P2P_PREFIX = 'PACT-P2P:v1:';

/**
 * Generate a deterministic checksum for ballot integrity
 */
export function generateBallotChecksum(voterId: string, budget: number, timestamp: number): string {
  let hash = 0;
  const str = `${voterId}:${budget}:${timestamp}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Encodes an offline ballot payload into a compact string suitable for QR exchange.
 */
export function encodeOfflineBallot(ballot: OfflineBallotPayload): string {
  const checksum = generateBallotChecksum(ballot.voterId, ballot.budget, ballot.timestamp);
  const payloadWithChecksum = { ...ballot, checksum };
  const jsonStr = JSON.stringify(payloadWithChecksum);

  // Cross-platform Base64 encoding
  let base64 = '';
  if (typeof btoa === 'function') {
    base64 = btoa(unescape(encodeURIComponent(jsonStr)));
  } else if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(jsonStr, 'utf-8').toString('base64');
  } else {
    base64 = jsonStr;
  }

  return `${P2P_PREFIX}${base64}`;
}

/**
 * Decodes and validates a raw offline ballot string.
 */
export function decodeOfflineBallot(raw: string): OfflineBallotPayload | null {
  if (!raw || typeof raw !== 'string' || !raw.startsWith(P2P_PREFIX)) {
    return null;
  }

  try {
    const encoded = raw.slice(P2P_PREFIX.length);
    let jsonStr = '';
    if (typeof atob === 'function') {
      jsonStr = decodeURIComponent(escape(atob(encoded)));
    } else if (typeof Buffer !== 'undefined') {
      jsonStr = Buffer.from(encoded, 'base64').toString('utf-8');
    } else {
      jsonStr = encoded;
    }

    const parsed = JSON.parse(jsonStr);
    if (!parsed.voterId || typeof parsed.budget !== 'number' || !parsed.circleId) {
      return null;
    }

    return parsed as OfflineBallotPayload;
  } catch (_err) {
    return null;
  }
}

/**
 * Computes deterministic Pareto Consensus across an arbitrary set of offline peer ballots.
 */
export function computeLocalConsensus(
  ballots: OfflineBallotPayload[],
  candidates: LocalConsensusCandidate[]
): LocalConsensusResult {
  if (!ballots || ballots.length === 0 || !candidates || candidates.length === 0) {
    return {
      winner: null,
      rankings: [],
      commonDates: [],
      effectiveBudgetCeiling: 0,
      totalBallots: ballots?.length || 0,
      isDeadlocked: true,
      status: 'insufficient_ballots',
    };
  }

  const totalBallots = ballots.length;

  // 1. Effective Budget Ceiling: Lowest budget of all members (Zero-Knowledge: only minimum ceiling is kept)
  const effectiveBudgetCeiling = Math.min(...ballots.map((b) => b.budget));

  // 2. Compute Common Dates Intersection
  let commonDates = [...ballots[0].dates];
  for (let i = 1; i < ballots.length; i++) {
    const memberDates = new Set(ballots[i].dates);
    commonDates = commonDates.filter((d) => memberDates.has(d));
  }

  // 3. Score each candidate destination
  const scored: LocalScoredCandidate[] = candidates.map((candidate) => {
    let approvalCount = 0;
    let vetoCount = 0;

    ballots.forEach((ballot) => {
      // Check explicit ballot approval
      if (ballot.approvals && ballot.approvals[candidate.id] === true) {
        approvalCount++;
      } else if (ballot.approvals && ballot.approvals[candidate.id] === false) {
        vetoCount++;
      }

      // Check dealbreaker tag conflict
      const hasDealbreakerConflict = ballot.dealbreakers.some((db) =>
        candidate.tags.map((t) => t.toLowerCase()).includes(db.toLowerCase())
      );
      if (hasDealbreakerConflict) {
        vetoCount++;
      }
    });

    // Budget condition: Cost <= effective ceiling
    const budgetFit = candidate.estimatedCost <= effectiveBudgetCeiling;

    // Date overlap with this candidate
    const candidateDates = new Set(candidate.availableDates);
    const dateOverlap = commonDates.filter((d) => candidateDates.has(d));

    // Pareto Optimal condition: Zero vetoes AND budget fits
    const isParetoOptimal = vetoCount === 0 && budgetFit;
    const approvalRate = totalBallots > 0 ? approvalCount / totalBallots : 0;

    return {
      candidate,
      approvalScore: approvalCount,
      approvalRate,
      isParetoOptimal,
      vetoCount,
      budgetFit,
      dateOverlap,
    };
  });

  // 4. Rank candidates:
  // First: Pareto optimal items sorted by approval score descending
  // Second: Non-Pareto items sorted by approval score descending, then least vetoes
  scored.sort((a, b) => {
    if (a.isParetoOptimal && !b.isParetoOptimal) return -1;
    if (!a.isParetoOptimal && b.isParetoOptimal) return 1;
    if (b.approvalScore !== a.approvalScore) return b.approvalScore - a.approvalScore;
    return a.vetoCount - b.vetoCount;
  });

  const winner = scored.length > 0 && scored[0].isParetoOptimal ? scored[0].candidate : (scored[0]?.candidate || null);
  const isDeadlocked = scored.every((s) => !s.isParetoOptimal && s.vetoCount >= totalBallots);

  return {
    winner,
    rankings: scored,
    commonDates,
    effectiveBudgetCeiling,
    totalBallots,
    isDeadlocked,
    status: isDeadlocked ? 'deadlocked' : 'consensus_reached',
  };
}
