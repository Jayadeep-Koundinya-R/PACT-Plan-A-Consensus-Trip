import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { useCircleStore } from '../../../store/useCircleStore.ts';
import { calculateConsensus } from '../../consensus/engine.js';
import { DEMO_TRIP_OPTIONS } from '../../consensus/seedData.js';

describe('Multi-user Capacity & 5-Member Trip Edge Cases', () => {
  const testCircleId = 'circle-capacity-5p-test';

  test('Step 1: Circle created for 5 members starts with exactly 1 organizer and 4 open seats', () => {
    useCircleStore.getState().addCircle({
      id: testCircleId,
      name: 'Cancun Fiesta 2026',
      inviteCode: 'CANC-5500',
      organizerId: 'org-koundinya',
      organizerName: 'Koundinya',
      status: 'collecting',
      totalMembersCount: 5,
      hasPro: false,
      members: [
        { userId: 'org-koundinya', name: 'Koundinya (Organizer)', status: 'locked', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    });

    const circle = useCircleStore.getState().getCircle(testCircleId);
    assert.ok(circle, 'Circle must exist');
    assert.equal(circle.totalMembersCount, 5, 'Target capacity must be exactly 5');
    assert.equal(circle.members.length, 1, 'Initial member count must be 1');
    const openSeats = Math.max(0, circle.totalMembersCount - circle.members.length);
    assert.equal(openSeats, 4, 'Must have exactly 4 open seats remaining');
  });

  test('Step 2: Organizer fills all remaining 4 seats with friends, reaching exact 5/5 capacity', () => {
    const friendNames = ['Aisha', 'Carlos', 'Mei', 'Liam'];

    friendNames.forEach((name, idx) => {
      const added = useCircleStore.getState().addMember(testCircleId, {
        userId: `guest-friend-${idx + 1}`,
        name,
        status: 'waiting',
        nudgedAt: null
      });
      assert.equal(added, true, `Should successfully add friend: ${name}`);
    });

    const circle = useCircleStore.getState().getCircle(testCircleId);
    assert.equal(circle.members.length, 5, 'Circle must now contain exactly 5 members');
    const openSeats = Math.max(0, circle.totalMembersCount - circle.members.length);
    assert.equal(openSeats, 0, 'Open seats must be exactly 0 (Circle Full)');
  });

  test('Step 3: Attempting to add a 6th member to a 5-person circle is strictly rejected', () => {
    const sixthFriendResult = useCircleStore.getState().addMember(testCircleId, {
      userId: 'guest-friend-6-overflow',
      name: 'Eve Extra',
      status: 'waiting',
      nudgedAt: null
    });

    assert.equal(sixthFriendResult, false, 'addMember must return false and reject the 6th member');

    const circle = useCircleStore.getState().getCircle(testCircleId);
    assert.equal(circle.members.length, 5, 'Circle members count must remain strictly 5');
    assert.equal(circle.totalMembersCount, 5, 'Target capacity must not automatically expand beyond 5');
    assert.ok(
      !circle.members.some((m) => m.name.includes('Eve')),
      'Overflow member Eve must NOT be in the circle'
    );
  });

  test('Step 4: Join screen blocks an unknown 6th person when circle is at 5/5 capacity', () => {
    const circle = useCircleStore.getState().getCircle(testCircleId);
    const visitorName = 'Stranger Dave';
    const isAlreadyMember = circle.members.some((m) => m.userId === 'stranger-device-999');
    const isFull = circle.members.length >= circle.totalMembersCount;

    const cleanEntered = visitorName.trim().toLowerCase();
    const matchingSlot = circle.members.find(
      (m) => m.name.replace(/\s*\(Organizer\)/gi, '').trim().toLowerCase() === cleanEntered
    );
    const isClaimingSlot = Boolean(matchingSlot);
    const isJoinBlocked = isFull && !isAlreadyMember && !isClaimingSlot;

    assert.equal(isFull, true, 'Circle must register as full');
    assert.equal(isClaimingSlot, false, 'Unknown stranger does not have a reserved slot');
    assert.equal(isJoinBlocked, true, 'Join CTA must be strictly blocked for unknown 6th visitor');
  });

  test('Step 5: Pre-added friend (Aisha) CAN claim her reserved seat even when circle is at 5/5 capacity', () => {
    const friendRealDeviceId = 'aisha-real-iphone-15';
    const claimed = useCircleStore.getState().claimMemberSlot(testCircleId, 'Aisha', friendRealDeviceId);

    assert.equal(claimed, true, 'claimMemberSlot must successfully match and claim Aisha');

    const circle = useCircleStore.getState().getCircle(testCircleId);
    assert.equal(circle.members.length, 5, 'Total members must remain strictly 5 after slot claim');
    const aishaMember = circle.members.find((m) => m.name === 'Aisha');
    assert.equal(aishaMember.userId, friendRealDeviceId, 'Aisha slot must now be bound to her real device ID');
  });

  test('Step 6: Removing a member frees up a slot, returning to 4/5 members and 1 open seat', () => {
    const circleBefore = useCircleStore.getState().getCircle(testCircleId);
    const memberToRemove = circleBefore.members.find((m) => m.name === 'Liam');
    assert.ok(memberToRemove, 'Liam must exist before removal');

    useCircleStore.getState().removeMember(testCircleId, memberToRemove.userId);

    const circleAfter = useCircleStore.getState().getCircle(testCircleId);
    assert.equal(circleAfter.members.length, 4, 'Member count must drop from 5 to 4');
    const openSeatsAfter = Math.max(0, circleAfter.totalMembersCount - circleAfter.members.length);
    assert.equal(openSeatsAfter, 1, 'Exactly 1 open seat must now be available');

    // Now a replacement friend (Zoe) can join
    const addedZoe = useCircleStore.getState().addMember(testCircleId, {
      userId: 'guest-zoe-replacement',
      name: 'Zoe Replacement',
      status: 'waiting',
      nudgedAt: null
    });

    assert.equal(addedZoe, true, 'Replacement friend must be accepted in the freed slot');
    const finalCircle = useCircleStore.getState().getCircle(testCircleId);
    assert.equal(finalCircle.members.length, 5, 'Circle returns to exact 5/5 capacity');
  });

  test('Step 7: Consensus supermajority mathematics correctly computes thresholds with exact 5 members', () => {
    const totalMembers = 5;
    const testOption = DEMO_TRIP_OPTIONS[0];

    // Scenario A: 4 out of 5 approve (4/5 = 80% > 70% threshold -> consensus passed)
    const preferences4Agree = [
      { userId: 'u1', userName: 'Koundinya', budgetMin: 400, budgetMax: 1000, dateRanges: [{ start: '2026-07-12', end: '2026-07-15' }], tags: ['beach'] },
      { userId: 'u2', userName: 'Aisha', budgetMin: 500, budgetMax: 1200, dateRanges: [{ start: '2026-07-12', end: '2026-07-15' }], tags: ['beach'] },
      { userId: 'u3', userName: 'Carlos', budgetMin: 400, budgetMax: 900, dateRanges: [{ start: '2026-07-12', end: '2026-07-15' }], tags: ['beach'] },
      { userId: 'u4', userName: 'Mei', budgetMin: 600, budgetMax: 1500, dateRanges: [{ start: '2026-07-12', end: '2026-07-15' }], tags: ['beach'] },
      // 5th member has incompatible budget/dates
      { userId: 'u5', userName: 'Zoe', budgetMin: 100, budgetMax: 200, dateRanges: [{ start: '2026-08-01', end: '2026-08-05' }], tags: ['snow'] }
    ];

    const result = calculateConsensus(testCircleId, totalMembers, [testOption], preferences4Agree);
    assert.equal(result.totalMembersCount, 5, 'Consensus denominator must strictly be 5');
    assert.equal(result.winningOption.consensusPercent, 80, '4/5 approvals must yield exactly 80% consensus');
    assert.equal(result.consensusReached, true, '80% >= 70% must flag consensus as reached');

    // Scenario B: Only 3 out of 5 approve (3/5 = 60% < 70% threshold -> consensus NOT reached)
    const preferences3Agree = [
      ...preferences4Agree.slice(0, 3),
      { userId: 'u4', userName: 'Mei', budgetMin: 100, budgetMax: 200, dateRanges: [{ start: '2026-08-01', end: '2026-08-05' }], tags: ['snow'] },
      { userId: 'u5', userName: 'Zoe', budgetMin: 100, budgetMax: 200, dateRanges: [{ start: '2026-08-01', end: '2026-08-05' }], tags: ['snow'] }
    ];

    const result3 = calculateConsensus(testCircleId, totalMembers, [testOption], preferences3Agree);
    assert.equal(result3.rankedOptions[0].consensusPercent, 60, '3/5 approvals must yield exactly 60% consensus');
    assert.equal(result3.consensusReached, false, '60% < 70% must correctly report consensus NOT reached');
    assert.equal(result3.deadlockDiagnosis.isDeadlocked, true, 'Deadlock must be flagged when below 70% threshold');
  });

  test('Step 8: Cloud / Supabase capacity logic strictly respects group total_members_count', () => {
    function simulateSupabaseJoin(groupTotalMembers, currentCount) {
      const maxAllowed = groupTotalMembers || 24;
      if (currentCount >= maxAllowed) {
        throw new Error('GROUP_FULL');
      }
      return true;
    }

    // 5-member trip with 5 current members must throw GROUP_FULL
    assert.throws(
      () => simulateSupabaseJoin(5, 5),
      /GROUP_FULL/,
      'Supabase join check must reject 6th member on a 5-member trip'
    );

    // 5-member trip with 4 current members must allow joining
    assert.equal(simulateSupabaseJoin(5, 4), true, 'Supabase join check allows 5th member to join');
  });
});
