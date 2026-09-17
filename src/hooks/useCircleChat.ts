import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, isLiveSupabaseConfigured } from '../lib/supabase/client';
import { useCircleChatStore, CircleMessage } from '../store/useCircleChatStore';
import { usePactHaptics } from './usePactHaptics';

/**
 * useCircleChat — Real-time group conversation hook for PACT V2.
 *
 * IMPORTANT PRIVACY/SECURITY NOTE:
 * Unlike preferences and votes which are strictly private-by-default (own-row only),
 * circle_messages is the ONE deliberate exception where all verified members of a circle
 * can read all messages within that circle. This is intentional for collaborative trip chat.
 * Do NOT restrict this policy to author-only; and do NOT use this as a precedent for
 * relaxing preferences/votes privacy.
 */
export function useCircleChat(
  circleId: string,
  currentUserId: string = 'user-maya-001',
  currentUserDisplayName: string = 'Alex (You)'
) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false);

  const haptics = usePactHaptics();
  const hapticsRef = useRef(haptics);
  hapticsRef.current = haptics;

  const messagesSelector = useCallback((s: any): CircleMessage[] => s.getMessages(circleId), [circleId]);
  const messages = useCircleChatStore(messagesSelector);
  const addMessage = useCircleChatStore((s) => s.addMessage);
  const setMessages = useCircleChatStore((s) => s.setMessages);

  // 1. Initial fetch from Supabase if configured
  useEffect(() => {
    if (!circleId || !isLiveSupabaseConfigured) return;

    let isMounted = true;
    async function loadCloudMessages() {
      try {
        const { data, error } = await supabase
          .from('circle_messages')
          .select('*')
          .eq('group_id', circleId)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0 && isMounted) {
          const mapped: CircleMessage[] = data.map((d: any) => ({
            id: d.id,
            groupId: d.group_id,
            userId: d.user_id,
            userDisplayName: d.user_display_name,
            content: d.content,
            createdAt: d.created_at
          }));
          setMessages(circleId, mapped);
        }
      } catch (e) {
        // Fall back gracefully to local store on network errors
      }
    }

    loadCloudMessages();
    return () => {
      isMounted = false;
    };
  }, [circleId, setMessages]);

  // 2. Realtime WebSocket subscription for incoming messages
  useEffect(() => {
    if (!circleId) return;

    const channelName = `pact-chat-${circleId}`;
    const channel = supabase.channel(channelName);

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'circle_messages',
        filter: `group_id=eq.${circleId}`
      },
      (payload) => {
        const newRecord = payload.new as any;
        if (newRecord?.id && newRecord?.content) {
          const incoming: CircleMessage = {
            id: newRecord.id,
            groupId: newRecord.group_id,
            userId: newRecord.user_id,
            userDisplayName: newRecord.user_display_name,
            content: newRecord.content,
            createdAt: newRecord.created_at
          };
          addMessage(circleId, incoming);
          hapticsRef.current.action();
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
  }, [circleId, addMessage]);

  // 3. Send message action
  const sendMessage = useCallback(
    async (
      content: string,
      customSenderId?: string,
      customSenderName?: string
    ): Promise<CircleMessage | null> => {
      const clean = content.trim();
      if (!clean) return null;

      const senderId = customSenderId || currentUserId;
      const senderName = customSenderName || currentUserDisplayName;

      const optimisticMsg: CircleMessage = {
        id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        groupId: circleId,
        userId: senderId,
        userDisplayName: senderName,
        content: clean,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      // Optimistic update
      addMessage(circleId, optimisticMsg);
      hapticsRef.current.tap();

      setIsSending(true);
      try {
        if (isLiveSupabaseConfigured) {
          const { data, error } = await supabase
            .from('circle_messages')
            .insert({
              group_id: circleId,
              user_id: senderId,
              user_display_name: senderName,
              content: clean
            })
            .select()
            .single();

          if (!error && data) {
            // Replace optimistic with real DB record
            const confirmedMsg: CircleMessage = {
              id: data.id,
              groupId: data.group_id,
              userId: data.user_id,
              userDisplayName: data.user_display_name,
              content: data.content,
              createdAt: data.created_at
            };
            return confirmedMsg;
          }
        }
      } catch (e) {
        // Silently preserve optimistic message in store
      } finally {
        setIsSending(false);
      }

      return optimisticMsg;
    },
    [circleId, currentUserId, currentUserDisplayName, addMessage]
  );

  // 4. Simulate a message from a peer account (for 2-account live testing)
  const simulatePeerMessage = useCallback(
    async (
      peerName: string = 'Jordan Lee',
      peerId: string = 'user-jordan-002',
      content: string = 'Sounds good, let me check the flight fares!'
    ) => {
      return sendMessage(content, peerId, peerName);
    },
    [sendMessage]
  );

  return {
    messages,
    sendMessage,
    simulatePeerMessage,
    isConnected,
    isSending
  };
}
