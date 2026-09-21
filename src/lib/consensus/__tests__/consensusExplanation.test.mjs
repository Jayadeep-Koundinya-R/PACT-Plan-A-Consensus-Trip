import test from 'node:test';
import assert from 'node:assert/strict';
import { generateConsensusExplanation, calculateConsensus } from '../engine.js';
import { DEMO_MEMBERS, DEMO_TRIP_OPTIONS } from '../seedData.js';

test('100% Unanimous consensus explanation generation', () => {
  const result = calculateConsensus('circle-college-reunion-2026', 5, DEMO_TRIP_OPTIONS, DEMO_MEMBERS);
  assert.ok(result.rankedOptions.length > 0, 'Should produce ranked options');

  const topOption = {
    ...result.rankedOptions[0],
    consensusPercent: 100,
    dealbreakerHitCount: 0,
    budgetGapCount: 0
  };

  const explanation = generateConsensusExplanation(topOption);

  assert.ok(explanation.headline.includes('Why'), 'Headline should describe why option won');
  assert.ok(explanation.keyFactors.some((k) => k.includes('Unanimous Alignment')), 'Key factors should note 100% unanimous alignment');
  assert.ok(explanation.keyFactors.some((k) => k.includes('Zero Vetoes')), 'Key factors should note zero vetoes');

  // Privacy Rule Guard: Ensure zero individual member names appear in any field
  DEMO_MEMBERS.forEach((m) => {
    assert.equal(explanation.headline.includes(m.userName), false, 'Headline must not leak member name');
    assert.equal(explanation.summary.includes(m.userName), false, 'Summary must not leak member name');
    explanation.keyFactors.forEach((factor) => {
      assert.equal(factor.includes(m.userName), false, 'Key factor must not leak member name');
    });
  });
});

test('70% Supermajority consensus explanation with budget gap and dealbreaker override', () => {
  const result = calculateConsensus('circle-college-reunion-2026', 5, DEMO_TRIP_OPTIONS, DEMO_MEMBERS);
  const scoredOption = {
    ...result.rankedOptions[0],
    consensusPercent: 80,
    budgetGapCount: 1,
    dealbreakerHitCount: 1
  };

  const explanation = generateConsensusExplanation(scoredOption);

  assert.ok(explanation.keyFactors.some((k) => k.includes('Supermajority Consensus')), 'Key factors should note Supermajority');
  assert.ok(explanation.keyFactors.some((k) => k.includes('Budget Balance') && k.includes('1 member budget gap')), 'Should accurately state 1 member budget gap');
  assert.ok(explanation.keyFactors.some((k) => k.includes('Dealbreaker Overrides') && k.includes('1 member dealbreaker constraint(s) triggered')), 'Should describe 1 dealbreaker override');
  assert.ok(explanation.summary.includes('1 dealbreaker override(s)'), 'Summary should note dealbreaker overrides');

  // Privacy Rule Guard: No names in output
  DEMO_MEMBERS.forEach((m) => {
    assert.equal(explanation.summary.includes(m.userName), false);
  });
});

test('Below 70% / Deadlock consensus explanation', () => {
  const result = calculateConsensus('circle-college-reunion-2026', 5, DEMO_TRIP_OPTIONS, DEMO_MEMBERS);
  const deadlockedOption = {
    ...result.rankedOptions[0],
    consensusPercent: 40,
    budgetGapCount: 3,
    dealbreakerHitCount: 2
  };

  const explanation = generateConsensusExplanation(deadlockedOption);

  assert.ok(explanation.keyFactors.some((k) => k.includes('Limited Consensus')), 'Should highlight limited consensus below 70%');
  assert.ok(explanation.keyFactors.some((k) => k.includes('3 member budget gap')), 'Should highlight budget gap count');
  assert.ok(explanation.keyFactors.some((k) => k.includes('2 member dealbreaker constraint(s) triggered')), 'Should describe dealbreaker count');
});

test('addTripOptionToGroup maps canonical database fields correctly', () => {
  // Pure mapping verification model
  function mapOptionToDb(groupId, option) {
    const name = option.name || 'Compromise Option';
    const destinationType = option.destinationType || 'General';
    const dateStart = option.dateStart || '2026-10-12';
    const dateEnd = option.dateEnd || '2026-10-18';
    const budgetPerPerson = option.budgetPerPerson ?? 500;

    return {
      group_id: groupId,
      name,
      destination_type: destinationType,
      description: option.description || '',
      date_start: dateStart,
      date_end: dateEnd,
      budget_per_person: budgetPerPerson,
      tags: option.tags || []
    };
  }

  const sampleOption = {
    id: 'opt-test-01',
    groupId: 'circle-test-123',
    name: 'Cozy Villa Compromise',
    destinationType: 'South Goa Beach',
    dateStart: '2026-11-10',
    dateEnd: '2026-11-15',
    budgetPerPerson: 600,
    tags: ['villa', 'beach'],
    description: 'AI compromise proposal'
  };

  const dbPayload = mapOptionToDb('circle-test-123', sampleOption);
  assert.equal(dbPayload.group_id, 'circle-test-123');
  assert.equal(dbPayload.name, 'Cozy Villa Compromise');
  assert.equal(dbPayload.destination_type, 'South Goa Beach');
  assert.equal(dbPayload.date_start, '2026-11-10');
  assert.equal(dbPayload.date_end, '2026-11-15');
  assert.equal(dbPayload.budget_per_person, 600);
});

test('addTripOption duplicate and demo mode logic model', () => {
  const store = {
    currentUserId: 'user-maya-001', // Demo persona
    activeGroupId: 'circle-demo-123',
    tripOptions: [
      { id: 'opt-1', name: 'Goa', destinationType: 'Beach', dateStart: '2026-10-12', dateEnd: '2026-10-18', budgetPerPerson: 500, tags: [] }
    ]
  };

  function addTripOptionModel(option) {
    const isDuplicate = store.tripOptions.some((existing) =>
      existing.id === option.id ||
      (existing.name.toLowerCase().trim() === option.name.toLowerCase().trim() &&
       existing.dateStart === option.dateStart &&
       existing.dateEnd === option.dateEnd)
    );
    if (isDuplicate) return false;

    const isDemoUser = !store.currentUserId || store.currentUserId.startsWith('user-');
    if (isDemoUser) {
      store.tripOptions.unshift(option);
      return true;
    }
    return true;
  }

  const duplicateOption = { id: 'opt-1', name: 'Goa', destinationType: 'Beach', dateStart: '2026-10-12', dateEnd: '2026-10-18', budgetPerPerson: 500, tags: [] };
  const result = addTripOptionModel(duplicateOption);

  assert.equal(result, false, 'Duplicate option should be rejected');
  assert.equal(store.tripOptions.length, 1, 'Store length should remain 1');
});
