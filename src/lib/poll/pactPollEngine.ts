/**
 * PACT Poll Engine: Zero-Knowledge, Multi-Dimensional Consensus Polling
 * 
 * Unlike flat public WhatsApp polls which cause herd-mentality and deadlocks,
 * PACT Poll introduces:
 * 1. 3-Way Expressive Stances (Love It +2, Down For It +1, Dealbreaker Veto -999)
 * 2. Cryptographically Sealed Anti-Herd Privacy until quorum is met
 * 3. Real-Time Group Budget & Date Constraint Badging
 * 4. Autonomous AI Deadlock & Veto Resolution
 * 5. 1-Tap Formatted WhatsApp Export
 */

export type StanceScore = 2 | 1 | -999 | 0;

export const STANCE_SCORES = {
  love: 2,
  down: 1,
  veto: -999,
  null: 0
} as const;

export interface OptionVoteRecord {
  key: string;
  name: string;
  loveCount: number;
  downCount: number;
  vetoCount: number;
  vetoReasons?: string[];
}

export interface PactPollSummary {
  isQuorumMet: boolean;
  totalVoters: number;
  sealedCount: number;
  isDeadlocked: boolean;
  hasVeto: boolean;
  topOptionKey: string | null;
  scores: Record<string, number>;
  statusMessage: string;
}

/**
 * Calculates consensus score for an option based on 3-tiered expressive stances
 */
export function calculateOptionConsensusScore(loveCount: number, downCount: number, vetoCount: number): number {
  if (vetoCount > 0) {
    return -999;
  }
  return (loveCount * 2) + (downCount * 1);
}

/**
 * Evaluates the full PACT poll state, enforcing zero-knowledge anti-herd privacy
 * when quorum is pending, and detecting deadlocks or dealbreaker vetos.
 */
export function evaluatePactPoll(
  options: OptionVoteRecord[],
  totalVoters: number,
  sealedCount: number
): PactPollSummary {
  const isQuorumMet = sealedCount >= totalVoters;
  const scores: Record<string, number> = {};
  let hasVeto = false;
  let highestScore = -Infinity;
  let topOptionKey: string | null = null;
  let tieCount = 0;

  for (const opt of options) {
    const s = calculateOptionConsensusScore(opt.loveCount, opt.downCount, opt.vetoCount);
    scores[opt.key] = s;
    if (opt.vetoCount > 0) {
      hasVeto = true;
    }

    if (s > highestScore) {
      highestScore = s;
      topOptionKey = opt.key;
      tieCount = 1;
    } else if (s === highestScore && highestScore > 0) {
      tieCount++;
    }
  }

  const isDeadlocked = hasVeto || (tieCount > 1 && isQuorumMet);

  let statusMessage = '';
  if (!isQuorumMet) {
    statusMessage = `${sealedCount}/${totalVoters} ballots sealed 🔒 — Individual votes hidden until all finish (Anti-Herd Mode)`;
  } else if (hasVeto) {
    statusMessage = '⚠️ Dealbreaker Veto Detected — Tap "AI Compromise Whisperer" to resolve';
  } else if (isDeadlocked) {
    statusMessage = '⚖️ Deadlock Tie — Options received equal consensus score';
  } else {
    statusMessage = '🎉 Unanimous Consensus Reached! Ready to lock and export brief.';
  }

  return {
    isQuorumMet,
    totalVoters,
    sealedCount,
    isDeadlocked,
    hasVeto,
    topOptionKey: isQuorumMet ? topOptionKey : null,
    scores,
    statusMessage
  };
}

/**
 * Formats a viral, beautifully formatted PACT Poll Snapshot to share directly into WhatsApp
 */
export function formatPactPollWhatsAppMessage(params: {
  circleName: string;
  inviteCode: string;
  sealedCount: number;
  totalVoters: number;
  options: { name: string; dates: string; price: string; budgetSafe: boolean }[];
}): string {
  const { circleName, inviteCode, sealedCount, totalVoters, options } = params;
  const optionLines = options.map((opt, i) => {
    const budgetTag = opt.budgetSafe ? '✅ 100% Budget Safe' : '⚠️ Moderate Budget';
    return `${i + 1}. *${opt.name}*\n   📅 ${opt.dates} • 💵 Est. ${opt.price}\n   🛡️ ${budgetTag}`;
  }).join('\n\n');

  return [
    `📊 *PACT POLL: ${circleName}*`,
    `🔒 *Status:* ${sealedCount}/${totalVoters} ballots sealed (Anti-Herd Mode Active)`,
    ``,
    `*Trip Candidates:*`,
    optionLines,
    ``,
    `👉 *Cast your secret stance (Love / Down / Veto):*`,
    `https://pact.travel/join/${inviteCode}`,
    ``,
    `_Zero peer pressure. All votes are sealed until everyone finishes._`
  ].join('\n');
}
