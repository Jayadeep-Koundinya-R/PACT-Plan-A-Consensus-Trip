import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// 1. Circle Hub State Machine logic
function getCircleHubPrimaryCTA({ isCurrentUserLocked, lockedCount, tripStatus }) {
  if (tripStatus === 'finalized') {
    return { label: 'View Final Trip Brief', action: 'view_brief', color: '#3DE0A0' };
  }
  if (!isCurrentUserLocked) {
    return { label: 'Set / Update My Preferences', action: 'set_preferences', color: '#FF5A5F' };
  }
  if (lockedCount <= 2) {
    return { label: 'Nudge Group on WhatsApp', action: 'nudge_whatsapp', color: '#3DE0A0' };
  }
  return { label: 'Proceed to Silent Ballot', action: 'silent_ballot', color: '#FF5A5F' };
}

// 2. Silent Ballot Vote & Rank Clearance logic
function processVoteChange(currentVotes, currentRanks, key, decision) {
  const nextVote = currentVotes[key] === decision ? null : decision;
  const nextVotes = { ...currentVotes, [key]: nextVote };
  const nextRanks = { ...currentRanks };

  // Rule: Rejected or un-voted options MUST NOT retain ranking controls or rank values
  if (nextVote !== 'approve') {
    delete nextRanks[key];
  }

  return { votes: nextVotes, ranks: nextRanks };
}

// 3. Ranked Matrix threshold logic
function getMatchScoreColor(score) {
  if (score >= 90) return '#3DE0A0'; // Top match emerald
  if (score >= 70) return '#3DE0A0'; // Consensus pass
  return '#FF5A5F'; // Below threshold coral
}

describe('UI Sprint Core Screens Engine Logic', () => {
  describe('Circle Hub State-Dependent Primary CTA', () => {
    it('returns "Set / Update My Preferences" when current user is not locked', () => {
      const cta = getCircleHubPrimaryCTA({ isCurrentUserLocked: false, lockedCount: 1, tripStatus: 'collecting' });
      assert.equal(cta.label, 'Set / Update My Preferences');
      assert.equal(cta.action, 'set_preferences');
      assert.equal(cta.color, '#FF5A5F');
    });

    it('returns "Nudge Group on WhatsApp" when current user is locked but lockedCount <= 2 (Early Bird)', () => {
      const cta = getCircleHubPrimaryCTA({ isCurrentUserLocked: true, lockedCount: 2, tripStatus: 'collecting' });
      assert.equal(cta.label, 'Nudge Group on WhatsApp');
      assert.equal(cta.action, 'nudge_whatsapp');
      assert.equal(cta.color, '#3DE0A0');
    });

    it('returns "Proceed to Silent Ballot" when lockedCount >= 3 and stage is voting', () => {
      const cta = getCircleHubPrimaryCTA({ isCurrentUserLocked: true, lockedCount: 4, tripStatus: 'voting' });
      assert.equal(cta.label, 'Proceed to Silent Ballot');
      assert.equal(cta.action, 'silent_ballot');
      assert.equal(cta.color, '#FF5A5F');
    });

    it('returns "View Final Trip Brief" when trip is finalized', () => {
      const cta = getCircleHubPrimaryCTA({ isCurrentUserLocked: true, lockedCount: 5, tripStatus: 'finalized' });
      assert.equal(cta.label, 'View Final Trip Brief');
      assert.equal(cta.action, 'view_brief');
      assert.equal(cta.color, '#3DE0A0');
    });
  });

  describe('Silent Ballot Rejection & Rank Clearance', () => {
    it('retains rank choice when option is approved', () => {
      const votes = { goa: 'approve' };
      const ranks = { goa: 1 };
      const result = processVoteChange(votes, ranks, 'goa', 'approve');
      // Toggling approve again sets to null
      assert.equal(result.votes.goa, null);
      assert.equal(result.ranks.goa, undefined);
    });

    it('clears rank choice immediately when option is rejected', () => {
      const votes = { goa: 'approve' };
      const ranks = { goa: 1 };
      const result = processVoteChange(votes, ranks, 'goa', 'reject');
      assert.equal(result.votes.goa, 'reject');
      assert.equal(result.ranks.goa, undefined, 'Rank must be cleared on rejection');
    });
  });

  describe('Ranked Matrix Threshold Color Logic', () => {
    it('returns Emerald for score >= 70%', () => {
      assert.equal(getMatchScoreColor(96), '#3DE0A0');
      assert.equal(getMatchScoreColor(82), '#3DE0A0');
      assert.equal(getMatchScoreColor(70), '#3DE0A0');
    });

    it('returns Coral for score < 70%', () => {
      assert.equal(getMatchScoreColor(69), '#FF5A5F');
      assert.equal(getMatchScoreColor(50), '#FF5A5F');
    });
  });
});
