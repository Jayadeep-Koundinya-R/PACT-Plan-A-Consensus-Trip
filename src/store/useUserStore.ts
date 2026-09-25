/**
 * useUserStore - user profile, auth state, Pro/subscription status
 *
 * Extracted from useGatherlyStore for clean separation of concerns.
 * The original monolithic store is preserved for backward compatibility;
 * this store syncs key fields and can be used by new screens.
 */
import { create } from 'zustand';
import { SubscriptionPlan } from '../lib/purchases/customerInfo';

export interface UserProfile {
  userId: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

interface UserState {
  // Profile
  profile: UserProfile;
  isAuthenticated: boolean;

  // Subscription
  subscriptionPlan: SubscriptionPlan;
  isCheckingEntitlement: boolean;
  purchaseError: string | null;

  // Preferences
  isDarkMode: boolean;
  privacyMaskBudget: boolean;
  autoDeleteVetos: boolean;
  hasSeenTutorial: boolean;

  // Actions
  setProfile: (partial: Partial<UserProfile>) => void;
  setAuthenticated: (v: boolean) => void;
  ensureGuestSession: (suggestedName?: string) => UserProfile;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  setCheckingEntitlement: (v: boolean) => void;
  setPurchaseError: (msg: string | null) => void;
  toggleDarkMode: () => void;
  togglePrivacyMaskBudget: () => void;
  toggleAutoDeleteVetos: () => void;
  setHasSeenTutorial: (v: boolean) => void;
  logout: () => void;
}

const getPersistedUserId = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('pact_user_id');
      if (saved && saved.trim() && saved !== 'user-maya-001') return saved.trim();
    } catch (e) {}
  }
  const newId = 'user-real-' + Math.random().toString(36).substring(2, 10);
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('pact_user_id', newId);
    } catch (e) {}
  }
  return newId;
};

const getPersistedName = (): string => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('pact_user_display_name');
      if (saved && saved.trim()) return saved.trim();
    } catch (e) {}
  }
  return 'Traveler';
};

const getPersistedTutorial = (): boolean => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return window.localStorage.getItem('pact_has_seen_tutorial') === 'true';
    } catch (e) {}
  }
  return false;
};

export const useUserStore = create<UserState>((set, get) => ({
  profile: {
    userId: getPersistedUserId(),
    email: 'traveler@pact.app',
    displayName: getPersistedName(),
    avatarUrl: null,
    createdAt: new Date().toISOString()
  },
  isAuthenticated: false,
  subscriptionPlan: 'free',
  isCheckingEntitlement: false,
  purchaseError: null,
  isDarkMode: true,
  privacyMaskBudget: true,
  autoDeleteVetos: false,
  hasSeenTutorial: getPersistedTutorial(),

  setHasSeenTutorial: (v: boolean) => {
    set({ hasSeenTutorial: v });
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('pact_has_seen_tutorial', v ? 'true' : 'false');
      } catch (e) {}
    }
  },

  setProfile: (partial) => {
    set((s) => ({ profile: { ...s.profile, ...partial } }));
    if (partial.displayName && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('pact_user_display_name', partial.displayName);
      } catch (e) {}
    }
    if (partial.userId && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('pact_user_id', partial.userId);
      } catch (e) {}
    }
  },

  setAuthenticated: (v) => set({ isAuthenticated: v }),

  ensureGuestSession: (suggestedName?: string) => {
    const current = get().profile;
    if (suggestedName && suggestedName.trim() && (current.displayName !== suggestedName.trim() || current.userId === 'user-maya-001')) {
      const guestId = 'guest-' + Math.random().toString(36).substring(2, 9);
      const guestProfile: UserProfile = {
        userId: guestId,
        email: null,
        displayName: suggestedName.trim(),
        avatarUrl: null,
        createdAt: new Date().toISOString()
      };
      set({ profile: guestProfile, isAuthenticated: false });
      return guestProfile;
    }
    if (current.userId && current.userId.length > 0 && current.userId !== 'user-maya-001') {
      return current;
    }
    const guestId = 'guest-' + Math.random().toString(36).substring(2, 9);
    const guestProfile: UserProfile = {
      userId: guestId,
      email: null,
      displayName: suggestedName || current.displayName || 'Guest Explorer',
      avatarUrl: null,
      createdAt: new Date().toISOString()
    };
    set({ profile: guestProfile, isAuthenticated: false });
    return guestProfile;
  },

  setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),
  setCheckingEntitlement: (v) => set({ isCheckingEntitlement: v }),
  setPurchaseError: (msg) => set({ purchaseError: msg }),

  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  togglePrivacyMaskBudget: () => set((s) => ({ privacyMaskBudget: !s.privacyMaskBudget })),
  toggleAutoDeleteVetos: () => set((s) => ({ autoDeleteVetos: !s.autoDeleteVetos })),

  logout: () =>
    set({
      isAuthenticated: false,
      profile: {
        userId: '',
        email: null,
        displayName: null,
        avatarUrl: null,
        createdAt: ''
      },
      subscriptionPlan: 'free'
    })
}));

import { registerUserStore } from '../lib/user/identity';
registerUserStore(useUserStore);
