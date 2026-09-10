import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOptionConsensusScore,
  evaluatePactPoll,
  formatPactPollWhatsAppMessage,
  STANCE_SCORES
} from '../pactPollEngine.ts';

describe('PACT Poll Engine: Multi-Dimensional Consensus & Anti-Herd Polling', () => {
  it('assigns correct expressive weights: Love (+2), Down (+1), Veto (-999)', () => {
    assert.equal(STANCE_SCORES.love, 2);
    assert.equal(STANCE_SCORES.down, 1);
    assert.equal(STANCE_SCORES.veto, -999);
  });

  it('calculates option consensus score accurately without vetoes', () => {
    // 3 Love (+6), 2 Down (+2) = 8
    const score = calculateOptionConsensusScore(3, 2, 0);
    assert.equal(score, 8);
  });

  it('hard-blocks option score to -999 if even a single veto is registered', () => {
    // 4 Love (+8), 1 Veto = -999
    const score = calculateOptionConsensusScore(4, 0, 1);
    assert.equal(score, -999);
  });

  it('enforces Anti-Herd sealed state when quorum is pending (sealedCount < totalVoters)', () => {
    const options = [
      { key: 'goa', name: 'Goa', loveCount: 2, downCount: 1, vetoCount: 0 },
      { key: 'pondy', name: 'Puducherry', loveCount: 1, downCount: 2, vetoCount: 0 }
    ];

    const result = evaluatePactPoll(options, 5, 3);
    assert.equal(result.isQuorumMet, false);
    assert.equal(result.topOptionKey, null, 'Top option must be sealed while voting');
    assert.match(result.statusMessage, /Anti-Herd Mode/);
    assert.match(result.statusMessage, /3\/5 ballots sealed/);
  });

  it('detects dealbreaker veto and triggers AI Compromise recommendation', () => {
    const options = [
      { key: 'goa', name: 'Goa', loveCount: 3, downCount: 1, vetoCount: 1 },
      { key: 'pondy', name: 'Puducherry', loveCount: 2, downCount: 3, vetoCount: 0 }
    ];

    const result = evaluatePactPoll(options, 5, 5);
    assert.equal(result.isQuorumMet, true);
    assert.equal(result.hasVeto, true);
    assert.equal(result.isDeadlocked, true);
    assert.match(result.statusMessage, /Dealbreaker Veto Detected/);
  });

  it('detects deadlock tie when multiple options share highest positive score', () => {
    const options = [
      { key: 'goa', name: 'Goa', loveCount: 2, downCount: 1, vetoCount: 0 }, // 2*2 + 1 = 5
      { key: 'pondy', name: 'Puducherry', loveCount: 2, downCount: 1, vetoCount: 0 } // 2*2 + 1 = 5
    ];

    const result = evaluatePactPoll(options, 5, 5);
    assert.equal(result.isQuorumMet, true);
    assert.equal(result.isDeadlocked, true);
    assert.match(result.statusMessage, /Deadlock Tie/);
  });

  it('unanimous winner unlocked when quorum is met with no vetos and clear leader', () => {
    const options = [
      { key: 'goa', name: 'Goa', loveCount: 4, downCount: 1, vetoCount: 0 }, // 4*2 + 1 = 9
      { key: 'pondy', name: 'Puducherry', loveCount: 1, downCount: 4, vetoCount: 0 } // 1*2 + 4 = 6
    ];

    const result = evaluatePactPoll(options, 5, 5);
    assert.equal(result.isQuorumMet, true);
    assert.equal(result.isDeadlocked, false);
    assert.equal(result.topOptionKey, 'goa');
    assert.match(result.statusMessage, /Unanimous Consensus Reached/);
  });

  it('generates compliant, anti-herd WhatsApp poll snapshot message', () => {
    const msg = formatPactPollWhatsAppMessage({
      circleName: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82',
      sealedCount: 3,
      totalVoters: 5,
      options: [
        { name: 'Goa Beach Resort', dates: 'Oct 14-19', price: '$540', budgetSafe: true },
        { name: 'Puducherry Heritage', dates: 'Oct 12-17', price: '$480', budgetSafe: true }
      ]
    });

    assert.match(msg, /PACT POLL: Goa Beach Escape 2026/);
    assert.match(msg, /3\/5 ballots sealed \(Anti-Herd Mode Active\)/);
    assert.match(msg, /100% Budget Safe/);
    assert.match(msg, /https:\/\/pact\.travel\/join\/GOA-4F82/);
    assert.match(msg, /Zero peer pressure/);
  });
});
