import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useCircleStore } from '../../../store/useCircleStore.ts';

describe('Duplicate Member Join Prevention', () => {
  beforeEach(() => {
    useCircleStore.getState().clearCircles();
  });

  test('Adding the same userId twice does not create duplicate members', () => {
    const circleId = 'circle-dedup-01';
    const userId = 'user-dup-001';

    useCircleStore.getState().addCircle({
      id: circleId,
      name: 'Dedup Test',
      inviteCode: 'DDP-0001',
      organizerId: 'org-001',
      organizerName: 'Organizer',
      status: 'collecting',
      totalMembersCount: 5,
      hasPro: false,
      members: [
        { userId: 'org-001', name: 'Organizer', status: 'locked', nudgedAt: null },
      ],
      createdAt: new Date().toISOString(),
    });

    // First join — should succeed
    const first = useCircleStore.getState().addMember(circleId, {
      userId,
      name: 'Alice',
      status: 'waiting',
      nudgedAt: null,
    });
    assert.equal(first, true, 'First join must succeed');

    // Second join with same userId — should update, not duplicate
    const second = useCircleStore.getState().addMember(circleId, {
      userId,
      name: 'Alice Updated',
      status: 'locked',
      nudgedAt: null,
    });
    assert.equal(second, true, 'Duplicate userId must be handled (update, not crash)');

    // Verify no duplicates
    const circle = useCircleStore.getState().getCircle(circleId);
    const aliceEntries = circle.members.filter((m) => m.userId === userId);
    assert.equal(aliceEntries.length, 1, 'Must have exactly 1 entry for this userId');
    assert.equal(aliceEntries[0].name, 'Alice Updated', 'Name should be updated');
  });

  test('Adding different userIds does create separate members', () => {
    const circleId = 'circle-dedup-02';

    useCircleStore.getState().addCircle({
      id: circleId,
      name: 'Multi Join Test',
      inviteCode: 'MJT-0001',
      organizerId: 'org-002',
      organizerName: 'Organizer',
      status: 'collecting',
      totalMembersCount: 5,
      hasPro: false,
      members: [
        { userId: 'org-002', name: 'Organizer', status: 'locked', nudgedAt: null },
      ],
      createdAt: new Date().toISOString(),
    });

    const result1 = useCircleStore.getState().addMember(circleId, {
      userId: 'guest-a',
      name: 'Alice',
      status: 'waiting',
      nudgedAt: null,
    });
    const result2 = useCircleStore.getState().addMember(circleId, {
      userId: 'guest-b',
      name: 'Bob',
      status: 'waiting',
      nudgedAt: null,
    });

    assert.equal(result1, true);
    assert.equal(result2, true);

    const circle = useCircleStore.getState().getCircle(circleId);
    assert.equal(circle.members.length, 3, 'Must have 3 unique members (org + 2 guests)');
  });

  test('Duplicate join at capacity does not exceed totalMembersCount', () => {
    const circleId = 'circle-dedup-03';

    useCircleStore.getState().addCircle({
      id: circleId,
      name: 'Capacity Dedup Test',
      inviteCode: 'CDT-0001',
      organizerId: 'org-003',
      organizerName: 'Organizer',
      status: 'collecting',
      totalMembersCount: 2,
      hasPro: false,
      members: [
        { userId: 'org-003', name: 'Organizer', status: 'locked', nudgedAt: null },
        { userId: 'guest-c', name: 'Guest C', status: 'waiting', nudgedAt: null },
      ],
      createdAt: new Date().toISOString(),
    });

    // Circle is full. A new user should be rejected.
    const result = useCircleStore.getState().addMember(circleId, {
      userId: 'guest-d',
      name: 'Guest D',
      status: 'waiting',
      nudgedAt: null,
    });
    assert.equal(result, false, 'New user must be rejected when circle is full');

    // But existing user can re-join (update) even at capacity
    const resultExisting = useCircleStore.getState().addMember(circleId, {
      userId: 'guest-c',
      name: 'Guest C Updated',
      status: 'locked',
      nudgedAt: null,
    });
    assert.equal(resultExisting, true, 'Existing user must be able to update at capacity');

    const circle = useCircleStore.getState().getCircle(circleId);
    assert.equal(circle.members.length, 2, 'Total members must still be 2');
  });
});
