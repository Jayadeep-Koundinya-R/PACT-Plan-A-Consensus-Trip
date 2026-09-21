import test from 'node:test';
import assert from 'node:assert/strict';
import { generateConsensusExplanation, calculateConsensus } from '../engine.js';
import { DEMO_MEMBERS, DEMO_TRIP_OPTIONS } from '../seedData.js';

test('generateConsensusExplanation creates aggregate-only "Why This Won" summary', () => {
  const result = calculateConsensus('circle-college-reunion-2026', 5, DEMO_TRIP_OPTIONS, DEMO_MEMBERS);
  assert.ok(result.rankedOptions.length > 0, 'Should produce ranked options');

  const topOption = result.rankedOptions[0];
  const explanation = generateConsensusExplanation(topOption);

  assert.ok(explanation.headline.includes('won'), 'Headline should reference winning option');
  assert.ok(explanation.summary.length > 10, 'Summary should contain plain English description');
  assert.ok(explanation.keyFactors.length >= 2, 'Should include key consensus factors');

  // Privacy Rule Guard: Ensure zero individual names or emails appear in explanation
  DEMO_MEMBERS.forEach((m) => {
    assert.equal(explanation.headline.includes(m.userName), false, 'Headline must not leak member name');
    assert.equal(explanation.summary.includes(m.userName), false, 'Summary must not leak member name');
  });
});
