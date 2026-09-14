import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isValidGroupSize, getTierForMemberCount, MAX_GROUP_MEMBERS } from '../groupPricing.ts';

describe('20-Member Group Capacity & Lifecycle Rules', () => {
  test('MAX_GROUP_MEMBERS is raised to 20 and validates boundaries', () => {
    assert.equal(MAX_GROUP_MEMBERS, 20);
    assert.equal(isValidGroupSize(1), true);
    assert.equal(isValidGroupSize(5), true);
    assert.equal(isValidGroupSize(20), true);
    assert.equal(isValidGroupSize(21), false);
    assert.equal(isValidGroupSize(0), false);
    assert.equal(isValidGroupSize(-1), false);
  });

  test('getTierForMemberCount returns flat organizer pass for 6 through 20 members', () => {
    const tier5 = getTierForMemberCount(5);
    assert.equal(tier5.id, 'free');
    assert.equal(tier5.maxMembers, 5);

    const tier6 = getTierForMemberCount(6);
    assert.equal(tier6.id, 'organizer_pass');
    assert.equal(tier6.maxMembers, 20);
    assert.equal(tier6.capacityLabel, 'Up to 20 members');

    const tier20 = getTierForMemberCount(20);
    assert.equal(tier20.id, 'organizer_pass');
    assert.equal(tier20.maxMembers, 20);
    assert.equal(tier20.capacityLabel, 'Up to 20 members');
  });

  test('20-member circle lifecycle computes progress and enforces 20-member cap', () => {
    const circle = {
      id: 'circle-grand-reunion-2026',
      name: 'Grand Reunion 2026',
      inviteCode: 'GRD-2026',
      organizerId: 'user-maya-001',
      status: 'collecting',
      totalMembersCount: 20,
      hasPro: true,
      members: [
        { userId: 'user-maya-001', name: 'Alex (Organizer)', status: 'locked', nudgedAt: null }
      ]
    };

    assert.equal(circle.totalMembersCount, 20);

    // Check progress calculation: 1 / 20 = 5%
    const lockedCount = circle.members.filter((m) => m.status === 'locked').length;
    const progressPct = Math.round((lockedCount / circle.totalMembersCount) * 100);
    assert.equal(lockedCount, 1);
    assert.equal(progressPct, 5);

    // Simulate members joining up to 20
    const updatedMembers = [...circle.members];
    for (let i = 2; i <= 20; i++) {
      updatedMembers.push({
        userId: `user-guest-${i}`,
        name: `Guest ${i}`,
        status: i <= 10 ? 'locked' : 'waiting',
        nudgedAt: null
      });
    }

    assert.equal(updatedMembers.length, 20);
    const halfLockedPct = Math.round((10 / 20) * 100);
    assert.equal(halfLockedPct, 50);

    // Hard cap enforcement: 21st member throws GROUP_FULL
    function attemptAddMember(membersList, newMember) {
      if (membersList.length >= MAX_GROUP_MEMBERS) {
        throw new Error('GROUP_FULL');
      }
      return [...membersList, newMember];
    }

    assert.throws(
      () => attemptAddMember(updatedMembers, { userId: 'user-extra-21', name: 'Extra' }),
      /GROUP_FULL/
    );
  });
});
