import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useGatherlyStore } from '../useGatherlyStore.js';
import { useCircleStore } from '../useCircleStore.ts';

describe('Task 2: Multi-Currency Selection and Structured Milestone Creation Wizard', () => {
  beforeEach(() => {
    useGatherlyStore.getState().setCurrency('USD');
  });

  test('creates group with specified currency code and group type', async () => {
    const store = useGatherlyStore.getState();
    const newGroup = await store.createGroup({
      name: 'Euro Mountain Trek 2026',
      totalMembersCount: 6,
      currencyCode: 'EUR',
      groupType: 'Best Friends'
    });

    assert.ok(newGroup.id);
    assert.equal(newGroup.name, 'Euro Mountain Trek 2026');
    assert.equal(newGroup.currencyCode, 'EUR');
    assert.equal(newGroup.groupType, 'Best Friends');

    // Store currency should be synced
    assert.equal(useGatherlyStore.getState().currency, 'EUR');
    assert.equal(useGatherlyStore.getState().currencySymbol, '€');
  });

  test('formatCurrency formats amounts correctly across USD, EUR, INR, and GBP', () => {
    const store = useGatherlyStore.getState();

    const usd = store.formatCurrency(100, 'USD');
    assert.ok(usd.includes('$100'));

    const eur = store.formatCurrency(100, 'EUR');
    assert.ok(eur.includes('€92'));

    const inr = store.formatCurrency(100, 'INR');
    assert.ok(inr.includes('₹8,350'));

    const gbp = store.formatCurrency(100, 'GBP');
    assert.ok(gbp.includes('£79'));
  });

  test('circle store persists currencyCode and groupType on addCircle', () => {
    const circleStore = useCircleStore.getState();
    const testCircleId = `circle-test-${Date.now()}`;

    circleStore.addCircle({
      id: testCircleId,
      name: 'Pune Weekend Escapade',
      inviteCode: 'PUNE-2026',
      organizerId: 'user-organizer-001',
      organizerName: 'Priya',
      status: 'collecting',
      totalMembersCount: 4,
      currencyCode: 'INR',
      groupType: 'College Friends',
      members: [],
      createdAt: new Date().toISOString()
    });

    const retrieved = circleStore.getCircle(testCircleId);
    assert.ok(retrieved);
    assert.equal(retrieved.currencyCode, 'INR');
    assert.equal(retrieved.groupType, 'College Friends');
  });
});
