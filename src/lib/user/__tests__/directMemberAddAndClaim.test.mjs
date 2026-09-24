import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { useCircleStore } from '../../../store/useCircleStore.ts';

describe('Direct Member Add, Claim Slot & Zero-Dummy Member Life Cycle', () => {
  const testCircleId = `circle-test-${Date.now()}`;
  const inviteCode = 'TEST-9921';

  test('Step 1: Organizer creates a clean circle with ZERO non-organizer members', () => {
    useCircleStore.getState().addCircle({
      id: testCircleId,
      name: 'Kyoto Autumn Walk 2026',
      inviteCode,
      organizerId: 'org-user-100',
      organizerName: 'Kenji',
      status: 'collecting',
      totalMembersCount: 5,
      members: [
        { userId: 'org-user-100', name: 'Kenji (Organizer)', status: 'locked', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    });

    const circle = useCircleStore.getState().getCircle(testCircleId);
    assert.ok(circle, 'Circle must exist in store');
    assert.equal(circle.members.length, 1, 'Circle must have exactly 1 member (Organizer)');
    assert.equal(circle.members[0].name, 'Kenji (Organizer)', 'First member must be the organizer');

    const nonOrganizerMembers = circle.members.filter(m => !m.name.includes('(Organizer)'));
    assert.equal(nonOrganizerMembers.length, 0, 'Non-organizer member count must start at ZERO');
  });

  test('Step 2: Organizer directly adds Friend 1 by name in Add People modal', () => {
    const newGuestId = `user-guest-direct-1`;
    useCircleStore.getState().addMember(testCircleId, {
      userId: newGuestId,
      name: 'Aisha',
      status: 'waiting',
      nudgedAt: null
    });

    const circle = useCircleStore.getState().getCircle(testCircleId);
    assert.equal(circle.members.length, 2, 'Circle must now have exactly 2 members');
    assert.equal(circle.members[1].name, 'Aisha', 'Friend 1 name must be Aisha');
    assert.equal(circle.members[1].status, 'waiting', 'Friend 1 status must be waiting for inputs');
  });

  test('Step 3: Other user (Friend 1) opens join link and claims their reserved slot', () => {
    const realFriendUserId = 'friend-aisha-device-99';
    const claimed = useCircleStore.getState().claimMemberSlot(testCircleId, 'Aisha', realFriendUserId);

    assert.equal(claimed, true, 'claimMemberSlot must return true for matching name');

    const circle = useCircleStore.getState().getCircle(testCircleId);
    assert.equal(circle.members.length, 2, 'Claiming slot must not duplicate members');
    const claimedMember = circle.members.find(m => m.name === 'Aisha');
    assert.equal(claimedMember.userId, realFriendUserId, 'Slot userId must be updated to real device userId');
  });

  test('Step 4: Friend 2 joins with a new name and sees previously added persons', () => {
    const circleBefore = useCircleStore.getState().getCircle(testCircleId);
    // Friend 2 sees Organizer + Aisha
    const previouslyAdded = circleBefore.members.map(m => m.name);
    assert.deepEqual(previouslyAdded, ['Kenji (Organizer)', 'Aisha'], 'Friend 2 must see all previously added persons');

    // Friend 2 joins as Liam
    const friend2Id = 'friend-liam-device-101';
    useCircleStore.getState().addMember(testCircleId, {
      userId: friend2Id,
      name: 'Liam',
      status: 'waiting',
      nudgedAt: null
    });

    const circleAfter = useCircleStore.getState().getCircle(testCircleId);
    assert.equal(circleAfter.members.length, 3, 'Circle must now contain 3 travelers');
    assert.deepEqual(
      circleAfter.members.map(m => m.name),
      ['Kenji (Organizer)', 'Aisha', 'Liam'],
      'Circle must cleanly contain Organizer and both joined friends'
    );
  });

  test('Step 5: Organizer can remove a member if added by mistake', () => {
    useCircleStore.getState().removeMember(testCircleId, 'friend-liam-device-101');
    const circle = useCircleStore.getState().getCircle(testCircleId);
    assert.equal(circle.members.length, 2, 'Circle must now have 2 members after removal');
    assert.equal(circle.members.some(m => m.userId === 'friend-liam-device-101'), false, 'Removed member must be gone');
  });

  test('Step 6: fetchGroupMembersFromSupabase is defined and exported with proper group_members query', () => {
    const serviceContent = fs.readFileSync(path.join(process.cwd(), 'src/lib/supabase/service.ts'), 'utf8');
    assert.ok(
      serviceContent.includes('export async function fetchGroupMembersFromSupabase'),
      'fetchGroupMembersFromSupabase must be an exported function in service.ts'
    );
    assert.ok(
      serviceContent.includes("from('group_members')"),
      'fetchGroupMembersFromSupabase must query public.group_members'
    );
    assert.ok(
      serviceContent.includes("from('profiles')"),
      'fetchGroupMembersFromSupabase must query public.profiles for display names'
    );
  });
});
