import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useCircleStore } from '../useCircleStore.ts';

describe('Organizer Leave Safety', () => {
  beforeEach(() => {
    useCircleStore.getState().clearCircles();
  });

  test('Organizer cannot leave a circle that still has other members', () => {
    const organizerId = 'org-user-001';
    const circleId = 'circle-leave-test-01';

    useCircleStore.getState().addCircle({
      id: circleId,
      name: 'Test Trip',
      inviteCode: 'TST-0001',
      organizerId,
      organizerName: 'Organizer',
      status: 'collecting',
      totalMembersCount: 5,
      hasPro: false,
      members: [
        { userId: organizerId, name: 'Organizer', status: 'locked', nudgedAt: null },
        { userId: 'guest-001', name: 'Guest 1', status: 'waiting', nudgedAt: null },
      ],
      createdAt: new Date().toISOString(),
    });

    const result = useCircleStore.getState().safeRemoveMember(circleId, organizerId);

    assert.equal(result.ok, false, 'Must block organizer from leaving');
    assert.equal(result.reason, 'Transfer organizer role before leaving');

    // Members should remain unchanged
    const circle = useCircleStore.getState().getCircle(circleId);
    assert.equal(circle.members.length, 2, 'Circle must still have 2 members');
  });

  test('Organizer can leave a circle when they are the only member (self-delete)', () => {
    const organizerId = 'org-user-002';
    const circleId = 'circle-leave-test-02';

    useCircleStore.getState().addCircle({
      id: circleId,
      name: 'Solo Circle',
      inviteCode: 'TST-0002',
      organizerId,
      organizerName: 'Solo Organizer',
      status: 'collecting',
      totalMembersCount: 5,
      hasPro: false,
      members: [
        { userId: organizerId, name: 'Solo Organizer', status: 'locked', nudgedAt: null },
      ],
      createdAt: new Date().toISOString(),
    });

    const result = useCircleStore.getState().safeRemoveMember(circleId, organizerId);

    assert.equal(result.ok, true, 'Solo organizer must be able to leave');
    assert.equal(result.reason, undefined, 'No reason should be provided on success');

    const circle = useCircleStore.getState().getCircle(circleId);
    assert.equal(circle.members.length, 0, 'Circle should have 0 members');
  });

  test('Non-organizer can leave a circle with other members freely', () => {
    const organizerId = 'org-user-003';
    const guestId = 'guest-003';
    const circleId = 'circle-leave-test-03';

    useCircleStore.getState().addCircle({
      id: circleId,
      name: 'Group Trip',
      inviteCode: 'TST-0003',
      organizerId,
      organizerName: 'Organizer',
      status: 'collecting',
      totalMembersCount: 5,
      hasPro: false,
      members: [
        { userId: organizerId, name: 'Organizer', status: 'locked', nudgedAt: null },
        { userId: guestId, name: 'Guest', status: 'waiting', nudgedAt: null },
        { userId: 'guest-004', name: 'Guest 2', status: 'waiting', nudgedAt: null },
      ],
      createdAt: new Date().toISOString(),
    });

    const result = useCircleStore.getState().safeRemoveMember(circleId, guestId);

    assert.equal(result.ok, true, 'Non-organizer guest must be able to leave');
    const circle = useCircleStore.getState().getCircle(circleId);
    assert.equal(circle.members.length, 2, 'Circle should have 2 remaining members');
  });

  test('safeRemoveMember returns error for non-existent circle', () => {
    const result = useCircleStore.getState().safeRemoveMember('nonexistent', 'user-1');

    assert.equal(result.ok, false);
    assert.equal(result.reason, 'Circle not found');
  });
});
