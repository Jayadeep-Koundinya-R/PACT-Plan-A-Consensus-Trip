import { useEffect, useState, useCallback, useRef } from 'react';
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

  const haptics = usePactHaptics();
  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;

  const lastFetchTs = useRef<number>(0);

  // Auto-dismiss transient live event banner after 4 seconds
  useEffect(() => {
    if (!lastEvent) return;
    const timer = setTimeout(() => {
      setLastEvent(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [lastEvent]);

  // Throttled helper to sync latest circle data without spamming cloud calls
  const throttledFetch = useCallback((cid: string) => {
    const now = Date.now();
    if (now - lastFetchTs.current > 4000) {
      lastFetchTs.current = now;
      try {
        useGatherlyStore.getState().fetchGroupDataFromCloud(cid);
      } catch (e) {
        // Silently handle any network errors in background sync
      }
    }
  }, []);

  // Manual simulation helper for demos, judges, or single-device offline mode
  const simulateSecondDeviceSubmission = useCallback((memberName: string = 'Alex') => {
    if (!circleId) return;

    hapticsRef.current.success();
    const eventDesc = `${memberName} locked in preferences from a second device`;
    setLastEvent(eventDesc);
    setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Update store state directly without triggering channel re-subscriptions
    const circle = useCircleStore.getState().getCircle(circleId);
    if (circle) {
      const pendingMember = circle.members.find((m) => m.status === 'waiting');
      if (pendingMember) {
        useCircleStore.getState().setMemberStatus(circleId, pendingMember.userId, 'locked');
      }
    }
  }, [circleId]);

  useEffect(() => {
    if (!circleId) return;

    // Connect to Supabase Realtime channel once per circleId
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
          useCircleStore.getState().setMemberStatus(circleId, userId, 'locked');
          throttledFetch(circleId);
          hapticsRef.current.action();
          setLastEvent('A member submitted preferences live via WebSocket');
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
          throttledFetch(circleId);
          hapticsRef.current.action();
          setLastEvent('Vote cast live on ballot');
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
          throttledFetch(circleId);
          hapticsRef.current.action();
          setLastEvent('New member joined circle live');
          setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      }
    );

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED' || !isLiveSupabaseConfigured) {
        setIsConnected(true);
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        if (isLiveSupabaseConfigured) {
          setIsConnected(false);
        }
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [circleId, throttledFetch]);

  return {
    isConnected,
    lastEvent,
    lastUpdated,
    simulateSecondDeviceSubmission
  };
}
