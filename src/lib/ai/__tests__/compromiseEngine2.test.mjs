import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateDeadlockBreakerPackages,
  synthesizeAICompromise,
} from '../compromiseEngine.ts';

describe('Autonomous AI Compromise Whisperer 2.0 (Deadlock Breaker)', () => {
  const members = [
    {
      userId: 'u1',
      userName: 'Alice',
      budgetMax: 500, // Lowest budget
      tags: ['beach', 'relaxed'],
      dealbreakers: ['extreme_nightlife'],
    },
    {
      userId: 'u2',
      userName: 'Bob',
      budgetMax: 1200,
      tags: ['beach', 'luxury'],
      dealbreakers: [],
    },
    {
      userId: 'u3',
      userName: 'Charlie',
      budgetMax: 700,
      tags: ['beach', 'surfing'],
      dealbreakers: ['cold_weather'],
    },
  ];

  it('generates 3 actionable deadlock breaker packages when standard consensus fails', () => {
    const packages = generateDeadlockBreakerPackages('circle-deadlock-1', members, []);

    assert.equal(packages.length, 3);

    const dateShift = packages.find((p) => p.type === 'date_shift');
    assert.ok(dateShift);
    assert.ok(dateShift.costPerPerson <= 500); // Must fit Alice's $500 ceiling
    assert.ok(dateShift.consensusScore >= 95);

    const adjacentGem = packages.find((p) => p.type === 'adjacent_gem');
    assert.ok(adjacentGem);
    assert.ok(adjacentGem.title.includes('Gokarna'));
    assert.ok(adjacentGem.costPerPerson <= 500);

    const tieredVilla = packages.find((p) => p.type === 'tiered_villa');
    assert.ok(tieredVilla);
    assert.equal(tieredVilla.costPerPerson, 500);
  });

  it('guarantees zero budget leak in compromise output text', () => {
    const packages = generateDeadlockBreakerPackages('c1', members, []);
    packages.forEach((pkg) => {
      assert.ok(!pkg.tradeOffText.includes('Alice'));
      assert.ok(!pkg.tradeOffText.includes('Bob'));
      assert.ok(!pkg.tradeOffText.includes('Charlie'));
    });
  });

  it('synthesizes single optimal compromise adhering to minimum group budget ceiling', () => {
    const comp = synthesizeAICompromise('c1', members, []);
    assert.ok(comp.option.budgetPerPerson <= 500);
    assert.equal(comp.memberSatisfactions.length, 3);
  });
});
