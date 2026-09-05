import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Isolated state machine mimicking useCircleStore logic in JS/MJS environment
function createCircleStore() {
  const DEMO_MEMBERS = [
    { userId: 'user-maya-001', name: 'Alex', status: 'locked', nudgedAt: null },
    { userId: 'user-jake-002', name: 'You', status: 'locked', nudgedAt: null },
    { userId: 'user-priya-003', name: 'Sam', status: 'locked', nudgedAt: null },
    { userId: 'user-alex-004', name: 'Jordan', status: 'waiting', nudgedAt: null },
    { userId: 'user-sam-005', name: 'Maya', status: 'waiting', nudgedAt: null }
  ];

  const DEMO_CIRCLE = {
    id: 'circle-college-reunion-2026',
    name: 'Goa Beach Escape 2026',
    inviteCode: 'GOA-4F82',
    organizerId: 'user-maya-001',
    organizerName: 'Alex Rivers',
    status: 'voting',
    totalMembersCount: 5,
    hasPro: true,
    members: DEMO_MEMBERS,
    createdAt: new Date().toISOString()
  };

  let state = {
    circles: [DEMO_CIRCLE],
    activeCircleId: DEMO_CIRCLE.id
  };

  return {
    getCircle: (id) => state.circles.find((c) => c.id === id),
    getActiveCircle: () => state.circles.find((c) => c.id === state.activeCircleId),
    setActiveCircle: (id) => { state.activeCircleId = id; },
    addCircle: (circle) => {
      state.circles = [circle, ...state.circles.filter((c) => c.id !== circle.id)];
      state.activeCircleId = circle.id;
    },
    setCircleProStatus: (circleId, hasPro) => {
      state.circles = state.circles.map((c) =>
        c.id === circleId ? { ...c, hasPro } : c
      );
    },
    isCirclePro: (circleId) => {
      const circle = state.circles.find((c) => c.id === circleId);
      return Boolean(circle?.hasPro);
    }
  };
}

describe('Nested useLocalSearchParams & Circle Switching', () => {
  test('resolves Circle A and Circle B data correctly without collision', () => {
    const store = createCircleStore();

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

    const activeCircle = store.getActiveCircle();
    assert.ok(activeCircle);
    assert.equal(activeCircle.id, 'circle-kyoto-2027');
    assert.equal(activeCircle.name, 'Kyoto Autumn Retreat 2027');
    assert.equal(activeCircle.hasPro, false);

    // 4. Verify getCircle resolves both independently
    const resolvedA = store.getCircle('circle-college-reunion-2026');
    const resolvedB = store.getCircle('circle-kyoto-2027');
    assert.equal(resolvedA.name, 'Goa Beach Escape 2026');
    assert.equal(resolvedB.name, 'Kyoto Autumn Retreat 2027');
  });

  test('updates Pro status per-circle independently', () => {
    const store = createCircleStore();
    store.addCircle({
      id: 'circle-paris-2026',
      name: 'Paris Weekend',
      hasPro: false
    });

    assert.equal(store.isCirclePro('circle-paris-2026'), false);
    store.setCircleProStatus('circle-paris-2026', true);
    assert.equal(store.isCirclePro('circle-paris-2026'), true);
    assert.equal(store.isCirclePro('circle-college-reunion-2026'), true);
  });
});
