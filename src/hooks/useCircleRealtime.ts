import { useEffect, useState, useCallback } from 'react';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase/client';
import { useCircleStore } from '../store/useCircleStore';
import { useGatherlyStore } from '../store/useGatherlyStore';
import { usePactHaptics } from './usePactHaptics';

export interface RealtimeSyncStatus {
  isConnected: boolean;
  lastEvent: string | null;
  lastUpdated: string | null;
  simulateSecondDeviceSubmission: (memberName?: string) => void;
}

export function useCircleRealtime(circleId?: string): RealtimeSyncStatus {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    if (!lastEvent) return;
    const timer = setTimeout(() => {
      setLastEvent(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [lastEvent]);
  const haptics = usePactHaptics();

  const setMemberStatus = useCircleStore((s) => s.setMemberStatus);

  // Manual simulation helper for demos, judges, or single-device offline mode
  const simulateSecondDeviceSubmission = useCallback((memberName: string = 'Alex') => {
    if (!circleId) return;

    haptics.success();
    const eventDesc = `${memberName} locked in preferences from a second device`;
    setLastEvent(eventDesc);
    setLastUpdated(new Date().toLocaleTimeString());

    // Update store state
    const circle = useCircleStore.getState().getCircle(circleId);
    if (circle) {
      const pendingMember = circle.members.find((m) => m.status === 'waiting');
      if (pendingMember) {
        setMemberStatus(circleId, pendingMember.userId, 'locked');
      }
    }
  }, [circleId, setMemberStatus, haptics]);

  useEffect(() => {
    if (!circleId) return;

    // Connect to Supabase Realtime channel
    const channelName = `pact-realtime-${circleId}`;
    const channel = supabase.channel(channelName);

    // 1. Listen for new/updated preferences (member locked in budget/dates)
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'preferences',
        filter: `group_id=eq.${circleId}`
      },
      (payload) => {
        const newRecord = payload.new as any;
        const userId = newRecord?.user_id;
        if (userId) {
          setMemberStatus(circleId, userId, 'locked');
          useGatherlyStore.getState().fetchGroupDataFromCloud(circleId);
          haptics.action();
          setLastEvent('A member submitted preferences live via WebSocket');
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    );

    // 2. Listen for votes
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `group_id=eq.${circleId}`
      },
      (payload) => {
        const newVote = payload.new as any;
        if (newVote?.option_id && newVote?.user_id) {
          const key = `${newVote.option_id}_${newVote.user_id}`;
          useGatherlyStore.setState((state) => ({
            votes: {
              ...state.votes,
              [key]: Boolean(newVote.approved)
            }
          }));
          useGatherlyStore.getState().fetchGroupDataFromCloud(circleId);
          haptics.action();
          setLastEvent('Vote cast live on ballot');
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    );

    // 3. Listen for new members joining the circle
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'group_members',
        filter: `group_id=eq.${circleId}`
      },
      (payload) => {
        const newMember = payload.new as any;
        if (newMember?.user_id) {
          useGatherlyStore.getState().fetchGroupDataFromCloud(circleId);
          haptics.action();
          setLastEvent('New member joined circle live');
          setLastUpdated(new Date().toLocaleTimeString());
        }
      }
    );

    channel.subscribe((status) => {
      setIsConnected(status === 'SUBSCRIBED' || !isLiveSupabaseConfigured);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [circleId, setMemberStatus, haptics]);

  return {
    isConnected,
    lastEvent,
    lastUpdated,
    simulateSecondDeviceSubmission
  };
}
