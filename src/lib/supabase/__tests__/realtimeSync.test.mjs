import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Realtime Event Reducer & Dispatch Logic
function createRealtimeEventReducer() {
  const state = {
    circleId: 'circle-goa-2026',
    members: [
      { userId: 'u-1', name: 'Alex', status: 'locked' },
      { userId: 'u-2', name: 'You', status: 'locked' },
      { userId: 'u-3', name: 'Sam', status: 'waiting' },
      { userId: 'u-4', name: 'Jordan', status: 'waiting' },
      { userId: 'u-5', name: 'Maya', status: 'waiting' }
    ],
    votes: {},
    lastEvent: null
  };

  return {
    getState: () => state,
    getRespondedCount: () => state.members.filter(m => m.status === 'locked').length,
    handlePreferenceEvent: (payload) => {
      const { user_id, group_id } = payload.new || {};
      if (group_id !== state.circleId) return;

      const member = state.members.find(m => m.userId === user_id);
      if (member) {
        member.status = 'locked';
        state.lastEvent = `Member ${member.name} locked preferences live`;
      }
    },
    handleVoteEvent: (payload) => {
      const { option_id, user_id, approved, group_id } = payload.new || {};
      if (group_id !== state.circleId) return;

      const key = `${option_id}_${user_id}`;
      state.votes[key] = Boolean(approved);
      state.lastEvent = `Vote ${approved ? 'approved' : 'rejected'} live`;
    }
  };
}

describe('Supabase Realtime Multi-Device Event Sync', () => {
  test('initial state has 2 of 5 members locked (Early Bird state)', () => {
    const reducer = createRealtimeEventReducer();
    assert.equal(reducer.getRespondedCount(), 2);
  });

  test('incoming preferences event from second device increments locked count to 3/5', () => {
    const reducer = createRealtimeEventReducer();
    assert.equal(reducer.getRespondedCount(), 2);

    // Second device (Sam) submits private preferences via WebSocket
    reducer.handlePreferenceEvent({
      eventType: 'INSERT',
      new: {
        id: 'pref-99',
        group_id: 'circle-goa-2026',
        user_id: 'u-3',
        budget_min: 500,
        budget_max: 900
      }
    });

    assert.equal(reducer.getRespondedCount(), 3);
    assert.equal(reducer.getState().members[2].status, 'locked');
    assert.ok(reducer.getState().lastEvent.includes('Sam'));
  });

  test('incoming vote event from peer device registers vote in real-time', () => {
    const reducer = createRealtimeEventReducer();

    reducer.handleVoteEvent({
      eventType: 'INSERT',
      new: {
        group_id: 'circle-goa-2026',
        option_id: 'opt-goa-1',
        user_id: 'u-3',
        approved: true
      }
    });

    assert.equal(reducer.getState().votes['opt-goa-1_u-3'], true);
    assert.ok(reducer.getState().lastEvent.includes('Vote approved'));
  });

  test('ignores events belonging to different circles', () => {
    const reducer = createRealtimeEventReducer();

    reducer.handlePreferenceEvent({
      eventType: 'INSERT',
      new: {
        group_id: 'circle-other-999',
        user_id: 'u-4'
      }
    });

    assert.equal(reducer.getRespondedCount(), 2);
    assert.equal(reducer.getState().members[3].status, 'waiting');
  });
});
