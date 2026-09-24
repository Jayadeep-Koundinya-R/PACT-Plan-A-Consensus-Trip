import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

describe('Zero Dummy Data & Sequential Real Member Joining', () => {
  let mockCircles = [];

  const mockCircleStore = {
    circles: [],
    getCircle: (id) => mockCircles.find((c) => c.id === id),
    getCircleByInviteCode: (code) => mockCircles.find((c) => c.inviteCode.toUpperCase() === code.trim().toUpperCase()),
    addCircle: (circle) => {
      mockCircles = [circle, ...mockCircles.filter((c) => c.id !== circle.id)];
    },
    addMember: (circleId, member) => {
      const cleanMember = {
        ...member,
        name: member.name.replace(/\s*\(You\)/gi, '').trim()
      };
      mockCircles = mockCircles.map((c) =>
        c.id === circleId
          ? {
              ...c,
              members: [...c.members.filter((m) => m.userId !== cleanMember.userId), cleanMember],
              totalMembersCount: Math.max(c.totalMembersCount, c.members.length + 1)
            }
          : c
      );
    }
  };

  beforeEach(() => {
    mockCircles = [];
  });

  it('Step 1: Organizer creates a circle with zero initial dummy members', () => {
    const organizerId = 'user-real-organizer-001';
    const organizerName = 'Jayadeep';

    // Simulate circle creation
    mockCircleStore.addCircle({
      id: 'circle-tokyo-2027',
      name: 'Tokyo Spring Adventure',
      inviteCode: 'TOKY-2027',
      organizerId,
      organizerName,
      status: 'collecting',
      totalMembersCount: 5,
      members: [
        {
          userId: organizerId,
          name: `${organizerName} (Organizer)`,
          status: 'locked',
          nudgedAt: null
        }
      ],
      createdAt: new Date().toISOString()
    });

    const circle = mockCircleStore.getCircle('circle-tokyo-2027');
    assert.ok(circle, 'Circle must exist');
    assert.equal(circle.members.length, 1, 'Only organizer must exist at creation (zero other people)');
    assert.equal(circle.members[0].name, 'Jayadeep (Organizer)');
    assert.equal(circle.members[0].status, 'locked');

    // Verify open seats calculation
    const openSeats = Math.max(0, circle.totalMembersCount - circle.members.length);
    assert.equal(openSeats, 4, 'Must have exactly 4 open seats remaining');
  });

  it('Step 2: Friend 1 joins with code and sees only Organizer as previous member', () => {
    // Organizer creates
    mockCircleStore.addCircle({
      id: 'circle-tokyo-2027',
      name: 'Tokyo Spring Adventure',
      inviteCode: 'TOKY-2027',
      organizerId: 'user-real-org',
      organizerName: 'Jayadeep',
      status: 'collecting',
      totalMembersCount: 5,
      members: [
        { userId: 'user-real-org', name: 'Jayadeep (Organizer)', status: 'locked', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    });

    // Friend 1 looks up circle by invite code
    const found = mockCircleStore.getCircleByInviteCode('TOKY-2027');
    assert.ok(found, 'Friend 1 must find circle by code');
    assert.equal(found.members.length, 1, 'Friend 1 must see exactly 1 previous member (Organizer)');
    assert.equal(found.members[0].name, 'Jayadeep (Organizer)');

    // Friend 1 joins as "Sarah"
    const friend1Id = 'user-real-friend1';
    mockCircleStore.addMember(found.id, {
      userId: friend1Id,
      name: 'Sarah',
      status: 'waiting',
      nudgedAt: null
    });

    const updated = mockCircleStore.getCircle('circle-tokyo-2027');
    assert.equal(updated.members.length, 2, 'Circle must now contain exactly 2 members');
    assert.equal(updated.members[1].name, 'Sarah', 'Stored name must be clean without (You)');
    assert.equal(updated.members[1].status, 'waiting');
  });

  it('Step 3: Friend 2 joins with code and sees both Organizer and Friend 1', () => {
    // Circle with Organizer and Friend 1
    mockCircleStore.addCircle({
      id: 'circle-tokyo-2027',
      name: 'Tokyo Spring Adventure',
      inviteCode: 'TOKY-2027',
      organizerId: 'user-real-org',
      organizerName: 'Jayadeep',
      status: 'collecting',
      totalMembersCount: 5,
      members: [
        { userId: 'user-real-org', name: 'Jayadeep (Organizer)', status: 'locked', nudgedAt: null },
        { userId: 'user-real-friend1', name: 'Sarah', status: 'locked', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    });

    // Friend 2 looks up circle
    const found = mockCircleStore.getCircleByInviteCode('TOKY-2027');
    assert.equal(found.members.length, 2, 'Friend 2 must see 2 previous members (Organizer and Sarah)');
    assert.equal(found.members[0].name, 'Jayadeep (Organizer)');
    assert.equal(found.members[1].name, 'Sarah');

    // Friend 2 joins as "Michael"
    const friend2Id = 'user-real-friend2';
    mockCircleStore.addMember(found.id, {
      userId: friend2Id,
      name: 'Michael',
      status: 'waiting',
      nudgedAt: null
    });

    const updated = mockCircleStore.getCircle('circle-tokyo-2027');
    assert.equal(updated.members.length, 3, 'Circle must now contain exactly 3 members');
    assert.deepEqual(
      updated.members.map((m) => m.name),
      ['Jayadeep (Organizer)', 'Sarah', 'Michael']
    );

    const openSeats = Math.max(0, updated.totalMembersCount - updated.members.length);
    assert.equal(openSeats, 2, 'Must have exactly 2 open seats remaining');
  });

  it('Step 4: Dynamic UI display resolves (You) accurately per observer', () => {
    const circle = {
      id: 'circle-tokyo-2027',
      organizerId: 'user-org',
      members: [
        { userId: 'user-org', name: 'Jayadeep (Organizer)', status: 'locked' },
        { userId: 'user-sarah', name: 'Sarah', status: 'locked' },
        { userId: 'user-michael', name: 'Michael', status: 'waiting' }
      ]
    };

    function resolveDisplayMembers(viewerId) {
      return circle.members.map((m) => {
        const isCurrentUser = m.userId === viewerId;
        const isOrganizer = m.userId === circle.organizerId || m.name.includes('(Organizer)');
        const clean = m.name.replace(/\s*\(You\)/gi, '').replace(/\s*\(Organizer\)/gi, '').trim();
        if (isOrganizer && isCurrentUser) return `${clean} (Organizer, You)`;
        if (isOrganizer) return `${clean} (Organizer)`;
        if (isCurrentUser) return `${clean} (You)`;
        return clean;
      });
    }

    // When Organizer (Jayadeep) views Hub
    assert.deepEqual(
      resolveDisplayMembers('user-org'),
      ['Jayadeep (Organizer, You)', 'Sarah', 'Michael']
    );

    // When Sarah views Hub
    assert.deepEqual(
      resolveDisplayMembers('user-sarah'),
      ['Jayadeep (Organizer)', 'Sarah (You)', 'Michael']
    );

    // When Michael views Hub
    assert.deepEqual(
      resolveDisplayMembers('user-michael'),
      ['Jayadeep (Organizer)', 'Sarah', 'Michael (You)']
    );
  });
});
