import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getActiveUserName,
  getActiveUserId,
  updateActiveUserName,
  resolveActiveUserName,
  resolveActiveUserId,
  isDemoPersona,
  registerUserStore,
  registerGatherlyStore,
  registerCircleStore,
  DEMO_PERSONA_NAMES,
  DEMO_PERSONA_IDS
} from '../identity.ts';

describe('Unified Identity Resolver (src/lib/user/identity.ts)', () => {
  let mockUserState;
  let mockGatherlyState;
  let mockCircleState;

  const mockUserStore = {
    getState: () => mockUserState,
    setState: (fnOrObj) => {
      mockUserState = typeof fnOrObj === 'function' ? fnOrObj(mockUserState) : { ...mockUserState, ...fnOrObj };
    }
  };

  const mockGatherlyStore = {
    getState: () => mockGatherlyState,
    setState: (fnOrObj) => {
      mockGatherlyState = typeof fnOrObj === 'function' ? fnOrObj(mockGatherlyState) : { ...mockGatherlyState, ...fnOrObj };
    }
  };

  const mockCircleStore = {
    getState: () => mockCircleState,
    setState: (fnOrObj) => {
      mockCircleState = typeof fnOrObj === 'function' ? fnOrObj(mockCircleState) : { ...mockCircleState, ...fnOrObj };
    }
  };

  beforeEach(() => {
    mockUserState = {
      profile: {
        userId: 'user-maya-001',
        email: 'traveler@pact.app',
        displayName: null,
        avatarUrl: null,
        createdAt: new Date().toISOString()
      },
      setProfile: (partial) => {
        mockUserState.profile = { ...mockUserState.profile, ...partial };
      }
    };

    mockGatherlyState = {
      currentUserId: 'user-maya-001',
      userName: null,
      userEmail: null,
      groups: [
        {
          id: 'test-group-1',
          name: 'Goa Trip',
          inviteCode: 'GOA-1234',
          organizerId: 'user-maya-001',
          organizerName: 'Old Name',
          status: 'voting',
          totalMembersCount: 5
        }
      ],
      members: [
        {
          userId: 'user-maya-001',
          userName: 'Old Name'
        }
      ]
    };

    mockCircleState = {
      circles: [
        {
          id: 'circle-1',
          organizerId: 'user-maya-001',
          organizerName: 'Old Name',
          members: [
            { userId: 'user-maya-001', name: 'Old Name' },
            { userId: 'user-jake-002', name: 'Jake' }
          ]
        }
      ]
    };

    registerUserStore(mockUserStore);
    registerGatherlyStore(mockGatherlyStore);
    registerCircleStore(mockCircleStore);
  });

  it('identifies demo personas accurately', () => {
    assert.equal(isDemoPersona('user-maya-001'), true);
    assert.equal(isDemoPersona('user-jake-002'), true);
    assert.equal(isDemoPersona('user-priya-003'), true);
    assert.equal(isDemoPersona('user-alex-004'), true);
    assert.equal(isDemoPersona('user-sam-005'), true);
    assert.equal(isDemoPersona('user-custom-999'), false);
    assert.equal(isDemoPersona(null), false);
  });

  it('resolves demo persona name when no custom display name exists', () => {
    assert.equal(getActiveUserId(), 'user-maya-001');
    assert.equal(getActiveUserName(), 'Maya');
  });

  it('prioritizes explicit user display name over demo persona', () => {
    mockUserState.setProfile({ displayName: 'Jayadeep Koundinya' });
    assert.equal(getActiveUserName(), 'Jayadeep Koundinya');
  });

  it('pure resolveActiveUserName ignores legacy Alex Rivers fallback and falls back cleanly', () => {
    const res = resolveActiveUserName({
      displayName: 'Alex Rivers', // Legacy default
      gatherlyUserName: null,
      currentUserId: 'user-maya-001',
      email: 'alex@pact.travel'
    });
    // Should resolve to Maya because currentUserId is user-maya-001 and Alex Rivers is ignored
    assert.equal(res, 'Maya');
  });

  it('pure resolveActiveUserName falls back to email prefix when no name is provided', () => {
    const res = resolveActiveUserName({
      displayName: null,
      gatherlyUserName: null,
      currentUserId: 'user-custom-888',
      email: 'traveler.pact@gmail.com'
    });
    assert.equal(res, 'Traveler pact');
  });

  it('updateActiveUserName syncs across useUserStore, useGatherlyStore, and useCircleStore', () => {
    updateActiveUserName('Koundinya Explorer');
    assert.equal(mockUserState.profile.displayName, 'Koundinya Explorer');
    assert.equal(mockGatherlyState.userName, 'Koundinya Explorer');
    assert.equal(getActiveUserName(), 'Koundinya Explorer');

    // Verify group organizer was updated
    const updatedGroup = mockGatherlyState.groups.find(g => g.id === 'test-group-1');
    assert.equal(updatedGroup.organizerName, 'Koundinya Explorer');

    // Verify circle store was updated
    const updatedCircle = mockCircleState.circles.find(c => c.id === 'circle-1');
    assert.equal(updatedCircle.organizerName, 'Koundinya Explorer');
    assert.equal(updatedCircle.members[0].name, 'Koundinya Explorer');
  });

  it('updateActiveUserName ignores blank or whitespace-only inputs', () => {
    updateActiveUserName('Valid User');
    assert.equal(getActiveUserName(), 'Valid User');

    updateActiveUserName('   ');
    assert.equal(getActiveUserName(), 'Valid User');
  });

  it('resolveActiveUserId resolves gatherlyId, profileId, or fallback', () => {
    assert.equal(resolveActiveUserId({ gatherlyId: 'usr-123', profileId: 'usr-456' }), 'usr-123');
    assert.equal(resolveActiveUserId({ gatherlyId: null, profileId: 'usr-456' }), 'usr-456');
    assert.equal(resolveActiveUserId({ gatherlyId: '', profileId: null }), 'user-maya-001');
  });

  it('falls back to window.localStorage persisted name when store has Traveler placeholder', () => {
    mockUserState.profile.displayName = 'Traveler';
    globalThis.window = {
      localStorage: {
        getItem: (k) => k === 'pact_user_display_name' ? 'Persisted Jayadeep' : null
      }
    };

    assert.equal(getActiveUserName(), 'Persisted Jayadeep');

    // Clean up mock
    delete globalThis.window;
  });
});
