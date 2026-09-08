import { create } from 'zustand';
import { askGemini } from '../lib/ai/aiChatClient';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const INITIAL_WELCOME: ChatMessage = {
  id: 'msg-welcome',
  role: 'model',
  text: "Hello! 👋 I'm your **PACT Travel Advisor** powered by **Google Gemini**.\n\nAsk me anything about destination budgets, day-by-day itineraries, packing tips, or how to resolve group travel disagreements diplomatically. What's on your mind?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

interface AIChatState {
  isOpen: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  openAIChat: () => void;
  closeAIChat: () => void;
  toggleAIChat: () => void;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
}

export const useAIChatStore = create<AIChatState>((set, get) => ({
  isOpen: false,
  isLoading: false,
  messages: [INITIAL_WELCOME],

  openAIChat: () => set({ isOpen: true }),
  closeAIChat: () => set({ isOpen: false }),
  toggleAIChat: () => set((s) => ({ isOpen: !s.isOpen })),

  clearChat: () => set({ messages: [INITIAL_WELCOME], isLoading: false }),

  sendMessage: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = get().messages.filter(m => m.id !== 'msg-welcome');

    set((s) => ({
      messages: [...s.messages, userMsg],
      isLoading: true
    }));

    try {
      const reply = await askGemini(
        trimmed,
        currentHistory.map(m => ({ role: m.role, text: m.text }))
      );

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      set((s) => ({
        messages: [...s.messages, aiMsg],
        isLoading: false
      }));
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'model',
        text: "I couldn't reach the Gemini service. Please check your internet connection or API key in `.env`.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      set((s) => ({
        messages: [...s.messages, errorMsg],
        isLoading: false
      }));
    }
  }
}));
