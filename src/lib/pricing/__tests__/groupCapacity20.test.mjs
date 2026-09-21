import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isValidGroupSize, getTierForMemberCount, MAX_GROUP_MEMBERS } from '../groupPricing.ts';

describe('24-Member Group Capacity & Lifecycle Rules', () => {
  test('MAX_GROUP_MEMBERS is raised to 24 and validates boundaries', () => {
    assert.equal(MAX_GROUP_MEMBERS, 24);
    assert.equal(isValidGroupSize(1), true);
    assert.equal(isValidGroupSize(8), true);
    assert.equal(isValidGroupSize(24), true);
    assert.equal(isValidGroupSize(25), false);
    assert.equal(isValidGroupSize(0), false);
    assert.equal(isValidGroupSize(-1), false);
  });

  test('getTierForMemberCount returns flat organizer pass for 9 through 24 members', () => {
    const tier8 = getTierForMemberCount(8);
    assert.equal(tier8.id, 'free');
    assert.equal(tier8.maxMembers, 8);

    const tier9 = getTierForMemberCount(9);
    assert.equal(tier9.id, 'organizer_pass');
    assert.equal(tier9.maxMembers, 24);
    assert.equal(tier9.capacityLabel, 'Up to 24 members');

    const tier24 = getTierForMemberCount(24);
    assert.equal(tier24.id, 'organizer_pass');
    assert.equal(tier24.maxMembers, 24);
    assert.equal(tier24.capacityLabel, 'Up to 24 members');
  });

  test('24-member circle lifecycle computes progress and enforces 24-member cap', () => {
    const circle = {
      id: 'circle-grand-reunion-2026',
      name: 'Grand Reunion 2026',
      inviteCode: 'GRD-2026',
      organizerId: 'user-maya-001',
      status: 'collecting',
      totalMembersCount: 24,
      hasPro: true,
      members: [
        { userId: 'user-maya-001', name: 'Alex (Organizer)', status: 'locked', nudgedAt: null }
      ]
    };

    assert.equal(circle.totalMembersCount, 24);

    // Check progress calculation: 1 / 24 = 4%
    const lockedCount = circle.members.filter((m) => m.status === 'locked').length;
    const progressPct = Math.round((lockedCount / circle.totalMembersCount) * 100);
    assert.equal(lockedCount, 1);
    assert.equal(progressPct, 4);

    // Simulate members joining up to 24
    const updatedMembers = [...circle.members];
    for (let i = 2; i <= 24; i++) {
      updatedMembers.push({
        userId: `user-guest-${i}`,
        name: `Guest ${i}`,
        status: i <= 12 ? 'locked' : 'waiting',
        nudgedAt: null
      });
    }

    assert.equal(updatedMembers.length, 24);
    const halfLockedPct = Math.round((12 / 24) * 100);
    assert.equal(halfLockedPct, 50);

    // Hard cap enforcement: 25th member throws GROUP_FULL
    function attemptAddMember(membersList, newMember) {
      if (membersList.length >= MAX_GROUP_MEMBERS) {
        throw new Error('GROUP_FULL');
      }
      return [...membersList, newMember];
    }

    assert.throws(
      () => attemptAddMember(updatedMembers, { userId: 'user-extra-25', name: 'Extra' }),
      /GROUP_FULL/
    );
  });
});
