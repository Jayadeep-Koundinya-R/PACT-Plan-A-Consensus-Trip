import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreTripOption, generateConsensusExplanation } from '../engine.js';
import { generatePlainEnglishReason } from '../templates.js';

test('Bug Fix Verification: Zero member preferences in scoreTripOption does not output NaN', (t) => {
  const dummyOption = {
    id: 'opt-1',
    name: 'Goa Villa',
    destinationType: 'beach',
    budgetPerPerson: 500,
    dateStart: '2026-10-12',
    dateEnd: '2026-10-18',
    tags: ['beach', 'relax']
  };

  const result = scoreTripOption(dummyOption, []);
  assert.equal(result.totalScore, 0);
  assert.equal(result.consensusPercent, 0);
  assert.equal(result.plainEnglishReason, 'No member preferences submitted yet.');
});

test('Bug Fix Verification: generatePlainEnglishReason with 0 members returns safe message', (t) => {
  const dummyOption = {
    id: 'opt-1',
    name: 'Kyoto Sanctuary',
    destinationType: 'cultural',
    budgetPerPerson: 1000,
    dateStart: '2027-04-01',
    dateEnd: '2027-04-07',
    tags: ['temple']
  };

  const reason = generatePlainEnglishReason(dummyOption, [], 0);
  assert.equal(reason, 'No member preferences submitted yet.');
});

test('Bug Fix Verification: generateConsensusExplanation with empty member breakdowns defaults gracefully', (t) => {
  const dummyScoredOption = {
    option: {
      id: 'opt-1',
      name: 'Bali Retreat',
      destinationType: 'island',
      budgetPerPerson: 800,
      dateStart: '2026-11-01',
      dateEnd: '2026-11-07',
      tags: ['beach']
    },
    rank: 1,
    totalScore: 85,
    consensusPercent: 80,
    budgetGapFlag: false,
    budgetGapCount: 0,
    dateConflictCount: 0,
    dealbreakerHitCount: 0,
    memberBreakdowns: [],
    plainEnglishReason: 'Great fit'
  };

  const explanation = generateConsensusExplanation(dummyScoredOption);
  assert.ok(explanation.headline.includes('Why Bali Retreat won'));
  assert.ok(explanation.summary.includes('Bali Retreat reached 80% consensus'));
});
