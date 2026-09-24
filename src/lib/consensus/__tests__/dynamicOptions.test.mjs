import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTripOptionsForCircle, extractDestinationAndVibe } from '../dynamicOptions.js';
import { DEMO_GROUP_ID } from '../seedData.js';

describe('Dynamic Trip Options Resolver (dynamicOptions.ts)', () => {
  test('extractDestinationAndVibe correctly parses custom group titles', () => {
    const res1 = extractDestinationAndVibe('Tokyo Tech Retreat 2026');
    assert.equal(res1.destination, 'Tokyo');
    assert.equal(res1.category, 'urban');

    const res2 = extractDestinationAndVibe('Paris Getaway');
    assert.equal(res2.destination, 'Paris');
    assert.equal(res2.category, 'cultural');

    const res3 = extractDestinationAndVibe('Swiss Alps Skiing');
    assert.equal(res3.destination, 'Swiss Alps');
    assert.equal(res3.category, 'mountains');

    const res4 = extractDestinationAndVibe('Bali Surf Trip 2026');
    assert.equal(res4.destination, 'Bali');
    assert.equal(res4.category, 'coastal');
  });

  test('returns canonical demo options for DEMO_GROUP_ID', () => {
    const demoResolved = resolveTripOptionsForCircle(DEMO_GROUP_ID);
    assert.ok(demoResolved.options.length >= 3, 'Demo circle returns canonical demo options');
    assert.ok(
      demoResolved.options.some((o) => o.name.includes('Goa')),
      'Demo options include Goa Beach Weekend'
    );
  });

  test('dynamically generates 3 custom candidates scaled to custom group title & budget', () => {
    const customId = 'circle-tokyo-tech-2026';
    const customName = 'Tokyo Tech Retreat 2026';
    const customMembers = [
      { userId: 'u1', name: 'Kenji', budgetMax: 1500 },
      { userId: 'u2', name: 'Aisha', budgetMax: 1800 }
    ];

    const resolved = resolveTripOptionsForCircle(customId, customName, customMembers);

    assert.ok(resolved.options.length === 3, 'Returns exactly 3 dynamic candidate options');
    assert.equal(
      resolved.options[0].name,
      'Tokyo Central Villa',
      'Option 1 name matches extracted destination'
    );
    assert.ok(
      resolved.scoredOptions.length === 3,
      'Scored options calculated via deterministic consensus engine'
    );
    assert.ok(
      !resolved.options.some((o) => o.name.includes('Goa')),
      'Custom circle options MUST NOT contain Goa'
    );
  });
});
