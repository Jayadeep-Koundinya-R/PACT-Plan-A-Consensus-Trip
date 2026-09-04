/**
 * useUserStore — user profile, auth state, Pro/subscription status
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

  // Actions
  setProfile: (partial: Partial<UserProfile>) => void;
  setAuthenticated: (v: boolean) => void;
  setSubscriptionPlan: (plan: SubscriptionPlan) => void;
  setCheckingEntitlement: (v: boolean) => void;
  setPurchaseError: (msg: string | null) => void;
  toggleDarkMode: () => void;
  togglePrivacyMaskBudget: () => void;
  toggleAutoDeleteVetos: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: {
    userId: 'user-maya-001',
    email: 'alex@pact.travel',
    displayName: 'Alex Rivers',
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

  setProfile: (partial) =>
    set((s) => ({ profile: { ...s.profile, ...partial } })),

  setAuthenticated: (v) => set({ isAuthenticated: v }),

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