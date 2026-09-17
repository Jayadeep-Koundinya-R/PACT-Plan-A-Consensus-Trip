import { create } from 'zustand';

export interface CircleMessage {
  id: string;
  groupId: string;
  userId: string;
  userDisplayName: string;
  content: string;
  createdAt: string;
  isOptimistic?: boolean;
}

export const EMPTY_MESSAGES: CircleMessage[] = [];

export interface ArchivedChatLog {
  groupId: string;
  archivedAt: string;
  messageCount: number;
  transcript: string;
  messages: CircleMessage[];
}

interface CircleChatState {
  // Messages per circleId
  messagesByCircle: Record<string, CircleMessage[]>;

  // Archived chat logs per circleId (populated upon trip finalization)
  archivedLogs: Record<string, ArchivedChatLog>;

  // Actions
  getMessages: (circleId: string) => CircleMessage[];
  setMessages: (circleId: string, messages: CircleMessage[]) => void;
  addMessage: (circleId: string, message: CircleMessage) => void;
  archiveChatLog: (circleId: string) => ArchivedChatLog;
  getArchivedChatLog: (circleId: string) => ArchivedChatLog | null;
}

// Initial demo seed conversation for seamless offline / test demo
const INITIAL_DEMO_MESSAGES: Record<string, CircleMessage[]> = {
  'circle-college-reunion-2026': [
    {
      id: 'msg-seed-001',
      groupId: 'circle-college-reunion-2026',
      userId: 'user-maya-001',
      userDisplayName: 'Alex (You)',
      content: 'Hey everyone! Excited to get this trip locked in. Remember to set your private dealbreakers.',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'msg-seed-002',
      groupId: 'circle-college-reunion-2026',
      userId: 'user-jordan-002',
      userDisplayName: 'Jordan Lee',
      content: 'Oct 14 – 19 works best for me! I saw flight rates are good right now.',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'msg-seed-003',
      groupId: 'circle-college-reunion-2026',
      userId: 'user-sam-003',
      userDisplayName: 'Sam Patel',
      content: 'Count me in. Just locked in my budget and vibes on the constraints form.',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ]
};

export const useCircleChatStore = create<CircleChatState>((set, get) => ({
  messagesByCircle: { ...INITIAL_DEMO_MESSAGES },
  archivedLogs: {},

  getMessages: (circleId: string) => {
    const existing = get().messagesByCircle[circleId];
    if (existing) return existing;
    return INITIAL_DEMO_MESSAGES[circleId] || EMPTY_MESSAGES;
  },

  setMessages: (circleId: string, messages: CircleMessage[]) => {
    set((state) => ({
      messagesByCircle: {
        ...state.messagesByCircle,
        [circleId]: messages
      }
    }));
  },

  addMessage: (circleId: string, message: CircleMessage) => {
    set((state) => {
      const current = state.messagesByCircle[circleId] || [];
      // Prevent duplicate messages by ID
      if (current.some((m) => m.id === message.id)) {
        return state;
      }
      return {
        messagesByCircle: {
          ...state.messagesByCircle,
          [circleId]: [...current, message]
        }
      };
    });
  },

  archiveChatLog: (circleId: string) => {
    const msgs = get().getMessages(circleId);
    const transcript = msgs
      .map((m) => `[${new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}] ${m.userDisplayName}: ${m.content}`)
      .join('\n');

    const archivedLog: ArchivedChatLog = {
      groupId: circleId,
      archivedAt: new Date().toISOString(),
      messageCount: msgs.length,
      transcript,
      messages: [...msgs]
    };

    set((state) => ({
      archivedLogs: {
        ...state.archivedLogs,
        [circleId]: archivedLog
      }
    }));

    return archivedLog;
  },

  getArchivedChatLog: (circleId: string) => {
    return get().archivedLogs[circleId] || null;
  }
}));
