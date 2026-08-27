import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDateScore,
  calculateBudgetScore,
  calculateTagScore,
  checkDealbreakers,
  scoreTripOption,
  rankTripOptions,
  detectDeadlock,
  calculateConsensus
} from '../engine.js';
import { DEMO_MEMBERS, DEMO_TRIP_OPTIONS, DEMO_GROUP_ID } from '../seedData.js';

test('1. Date Overlap Scoring', (t) => {
  // Trip: July 12 to July 15 (4 days: 12, 13, 14, 15)
  // Maya: July 10-15 (covers 12-15 = 4 days / 4 = 1.0)
  const mayaDate = calculateDateScore(DEMO_MEMBERS[0].dateRanges, '2026-07-12', '2026-07-15');
  assert.equal(mayaDate.score, 1.0);
  assert.equal(mayaDate.overlapDays, 4);

  // Priya: July 8-14 (covers 12, 13, 14 = 3 days / 4 = 0.75)
  const priyaDate = calculateDateScore(DEMO_MEMBERS[2].dateRanges, '2026-07-12', '2026-07-15');
  assert.equal(priyaDate.score, 0.75);
  assert.equal(priyaDate.overlapDays, 3);

  // Sam: July 15-28 (covers July 15 = 1 day / 4 = 0.25)
  const samDate = calculateDateScore(DEMO_MEMBERS[4].dateRanges, '2026-07-12', '2026-07-15');
  assert.equal(samDate.score, 0.25);
  assert.equal(samDate.overlapDays, 1);
});

test('2. Budget Scoring', (t) => {
  // Goa cost $650
  // Maya ($400-900) -> in range -> 1.0
  assert.equal(calculateBudgetScore(400, 900, 650), 1.0);

  // Jake ($1000-2500) -> below min -> 650/1000 = 0.65
  assert.equal(calculateBudgetScore(1000, 2500, 650), 0.65);

  // Manali cost $1200
  // Priya ($300-700) -> above max -> 0.0
  assert.equal(calculateBudgetScore(300, 700, 1200), 0.0);
});

test('3. Tag Matching', (t) => {
  // Maya wants ['beach', 'relaxed'], Goa has ['beach', 'relaxed', 'budget-conscious']
  const tagResult = calculateTagScore(['beach', 'relaxed'], ['beach', 'relaxed', 'budget-conscious']);
  assert.equal(tagResult.score, 1.0);
  assert.equal(tagResult.matchedTags.length, 2);

  // Alex wants ['city', 'culture', 'active'], Goa has ['beach', 'relaxed', 'budget-conscious']
  const alexTag = calculateTagScore(['city', 'culture', 'active'], ['beach', 'relaxed', 'budget-conscious']);
  assert.equal(alexTag.score, 0.0);
});

test('4. Dealbreaker Detection', (t) => {
  const manaliOption = DEMO_TRIP_OPTIONS[1]; // Manali: hiking, cold
  // Maya has ['hiking', 'cold'] dealbreakers
  const mayaDb = checkDealbreakers(['hiking', 'cold'], manaliOption);
  assert.equal(mayaDb.hit, true);

  // Goa has no dealbreaker for Maya
  const goaOption = DEMO_TRIP_OPTIONS[0];
  const goaDb = checkDealbreakers(['hiking', 'cold'], goaOption);
  assert.equal(goaDb.hit, false);
});

test('5. Complete Demo Story Validation (Expected Winner: Goa Beach Weekend)', (t) => {
  const consensusResult = calculateConsensus(
    DEMO_GROUP_ID,
    5,
    DEMO_TRIP_OPTIONS,
    DEMO_MEMBERS
  );

  assert.equal(consensusResult.totalMembersCount, 5);
  assert.equal(consensusResult.respondedMembersCount, 5);
  assert.equal(consensusResult.consensusReached, true);

  const ranked = consensusResult.rankedOptions;
  assert.equal(ranked.length, 4);

  // Winner must be Goa Beach Weekend
  const winner = ranked[0];
  assert.equal(winner.option.name, 'Goa Beach Weekend');
  assert.ok(winner.totalScore >= 70 && winner.totalScore <= 76, `Expected ~74 score, got ${winner.totalScore}`);
  assert.equal(winner.consensusPercent, 100);
  assert.equal(winner.budgetGapFlag, false);
  assert.equal(winner.dealbreakerHitCount, 0);

  // Verify Manali Trek has dealbreaker hit for Maya
  const manali = ranked.find((r) => r.option.name === 'Manali Mountain Trek');
  assert.ok(manali, 'Manali option should exist');
  assert.ok(manali.dealbreakerHitCount >= 1, 'Manali must hit Maya dealbreaker');
  const mayaBreakdown = manali.memberBreakdowns.find((m) => m.userName === 'Maya');
  assert.equal(mayaBreakdown?.dealbreakerHit, true);
  assert.equal(mayaBreakdown?.memberScore, 0);

  // Verify Kerala Backwaters flags over budget for 2 (Priya max 700, Maya max 900 vs 1100 cost)
  const kerala = ranked.find((r) => r.option.name === 'Kerala Backwaters Chill');
  assert.ok(kerala, 'Kerala option should exist');
  assert.equal(kerala.budgetGapCount, 2);
});
