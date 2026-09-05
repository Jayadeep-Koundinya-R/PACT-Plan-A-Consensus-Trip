import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { useCircleStore } from '../useCircleStore.js';

describe('Nested useLocalSearchParams & Circle Switching', () => {
  test('resolves Circle A and Circle B data correctly without collision', () => {
    const store = useCircleStore.getState();

    // 1. Initial Circle A
    const circleA = store.getCircle('circle-college-reunion-2026');
    assert.ok(circleA, 'Circle A should exist');
    assert.equal(circleA.name, 'Goa Beach Escape 2026');
    assert.equal(circleA.hasPro, true);

    // 2. Add Circle B
    const circleBData = {
      id: 'circle-kyoto-2027',
      name: 'Kyoto Autumn Retreat 2027',
      inviteCode: 'KYO-9921',
      organizerId: 'user-maya-001',
      status: 'collecting',
      totalMembersCount: 4,
      hasPro: false,
      members: [
        { userId: 'user-maya-001', name: 'Alex', status: 'locked', nudgedAt: null },
        { userId: 'user-ken-006', name: 'Ken', status: 'waiting', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    };

    store.addCircle(circleBData);

    // 3. Switch active circle to B without unmounting
    store.setActiveCircle('circle-kyoto-2027');

    const activeCircle = useCircleStore.getState().getActiveCircle();
    assert.ok(activeCircle);
    assert.equal(activeCircle.id, 'circle-kyoto-2027');
    assert.equal(activeCircle.name, 'Kyoto Autumn Retreat 2027');
    assert.equal(activeCircle.hasPro, false);

    // 4. Verify getCircle resolves both independently
    const resolvedA = useCircleStore.getState().getCircle('circle-college-reunion-2026');
    const resolvedB = useCircleStore.getState().getCircle('circle-kyoto-2027');
    assert.equal(resolvedA.name, 'Goa Beach Escape 2026');
    assert.equal(resolvedB.name, 'Kyoto Autumn Retreat 2027');
  });
});
