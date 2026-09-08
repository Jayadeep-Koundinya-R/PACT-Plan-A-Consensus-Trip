import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { askGemini } from '../lib/ai/aiChatClient';
import { FREE_DAILY_PROMPT_LIMIT, getDayKey, hasRemainingPrompts } from '../lib/ai/dailyQuota';
import { useGatherlyStore } from './useGatherlyStore';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  /** True when this message is an AI failure/error (styled distinctly). */
  isError?: boolean;
  /** True when this message is the free-quota-block notice. */
  quotaBlocked?: boolean;
  /** True when the model reply was cut off mid-answer (not counted against quota). */
  truncated?: boolean;
}

const INITIAL_WELCOME: ChatMessage = {
  id: 'msg-welcome',
  role: 'model',
  text: "Hello! 👋 I'm your **PACT Travel Advisor** powered by **Google Gemini**.\\n\\nAsk me anything about destination budgets, day-by-day itineraries, packing tips, or how to resolve group travel disagreements diplomatically. What's on your mind?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

const QUOTA_STORAGE_KEY = 'pact_ai_chat_quota_v1';

const LIMIT_REACHED_MESSAGE =
  `🔒 You've used all ${FREE_DAILY_PROMPT_LIMIT} free AI prompts today. ` +
  'Upgrade to PACT Pro for unlimited AI guidance, or come back tomorrow when the free limit resets.';

interface AIChatState {
  isOpen: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  promptsUsedToday: number;
  quotaDayKey: string;
  openAIChat: () => void;
  closeAIChat: () => void;
  toggleAIChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  loadQuota: () => Promise<void>;
  incrementQuotaUsed: () => void;
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  messages: [INITIAL_WELCOME],
  promptsUsedToday: 0,
  quotaDayKey: '',

  openAIChat: () => {
    set({ isOpen: true });
    get().loadQuota();
  },
  closeAIChat: () => set({ isOpen: false }),
  toggleAIChat: () => set((s) => ({ isOpen: !s.isOpen })),

  clearChat: () => set({ messages: [INITIAL_WELCOME], isLoading: false }),

  loadQuota: async () => {
    const todayKey = getDayKey();
    let used = 0;
    try {
      const raw = await AsyncStorage.getItem(QUOTA_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Old days roll to 0 automatically by only trusting today's entry.
        if (parsed && parsed.day === todayKey) {
          used = Math.max(0, Number(parsed.used) || 0);
        }
      }
    } catch (e) {}
    set({ promptsUsedToday: used, quotaDayKey: todayKey });
  },

  incrementQuotaUsed: () => {
    const todayKey = getDayKey();
    const used = get().promptsUsedToday + 1;
    set({ promptsUsedToday: used, quotaDayKey: todayKey });
    try {
      AsyncStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify({ day: todayKey, used })).catch(() => {});
    } catch (e) {}
  },

  sendMessage: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!get().quotaDayKey) {
      await get().loadQuota();
    }

    const plan = useGatherlyStore.getState().subscriptionPlan;
    if (!hasRemainingPrompts(get().promptsUsedToday, plan)) {
      const quotaMsg: ChatMessage = {
        id: `msg-${Date.now()}-quota`,
        role: 'model',
        text: LIMIT_REACHED_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quotaBlocked: true
      };
      set((s) => ({ messages: [...s.messages, quotaMsg] }));
      return;
    }

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = get().messages.filter((m) => m.id !== 'msg-welcome');

    set((s) => ({
      messages: [...s.messages, userMsg],
      isLoading: true
    }));

    try {
      const result = await askGemini(
        trimmed,
        currentHistory.map((m) => ({ role: m.role, text: m.text }))
      );

      // Billing correctness: only count a prompt toward the daily quota / charge
      // when we deliver a complete, verified answer. Errors and truncated replies
      // do NOT consume the user's limit, so retries are always free.
      const isVerifiedFullAnswer = result.ok && !result.truncated;
      if (isVerifiedFullAnswer) {
        get().incrementQuotaUsed();
      }

      let displayText = result.text;
      if (result.truncated) {
        displayText =
          `${displayText}\n\n✂️ My answer got cut off before the end. This prompt wasn't counted against your daily limit — please ask again (or break it into a smaller question).`;
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-${result.ok ? 'model' : 'err'}`,
        role: 'model',
        text: displayText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: !result.ok,
        truncated: result.truncated
      };

      set((s) => ({
        messages: [...s.messages, aiMsg],
        isLoading: false
      }));
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        text: "I couldn't reach the Gemini service. Please check your internet connection or API key in `.env`, then retry.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true
      };
      set((s) => ({
        messages: [...s.messages, errorMsg],
        isLoading: false
      }));
    }
  }
}));