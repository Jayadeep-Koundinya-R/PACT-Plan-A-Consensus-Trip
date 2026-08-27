import { create } from 'zustand';
import {
  MemberPreference,
  TripOption,
  ScoredTripOption,
  ConsensusResult
} from '../lib/consensus/types';
import { calculateConsensus } from '../lib/consensus/engine';
import { DEMO_MEMBERS, DEMO_TRIP_OPTIONS, DEMO_GROUP_ID } from '../lib/consensus/seedData';

export interface Group {
  id: string;
  name: string;
  inviteCode: string;
  organizerId: string;
  status: 'collecting' | 'voting' | 'finalized' | 'cancelled';
  totalMembersCount: number;
}

export interface TripBrief {
  groupId: string;
  winningOption: ScoredTripOption;
  finalizedAt: string;
  confirmedParticipants: string[];
  totalBudgetRange: string;
  travelWindow: string;
}

interface GatherlyState {
  // Auth & Profile
  currentUserId: string;
  isDarkMode: boolean;
  subscriptionPlan: 'free' | 'premium_monthly' | 'premium_annual';

  // Group & Preferences
  groups: Group[];
  activeGroupId: string;
  members: MemberPreference[];
  tripOptions: TripOption[];

  // Voting & Consensus
  votes: Record<string, boolean>; // key: `${optionId}_${userId}` -> true (approved)
  finalizedBrief: TripBrief | null;

  // Actions
  toggleDarkMode: () => void;
  setCurrentUser: (userId: string) => void;
  setSubscriptionPlan: (plan: 'free' | 'premium_monthly' | 'premium_annual') => void;
  submitPreferences: (preference: MemberPreference) => void;
  castVote: (optionId: string, approved: boolean) => void;
  getConsensusResults: () => ConsensusResult;
  getOptionApprovalCount: (optionId: string) => number;
  finalizeTrip: () => TripBrief | null;
  resetDemoState: () => void;
}

const initialGroup: Group = {
  id: DEMO_GROUP_ID,
  name: 'College Reunion Trip',
  inviteCode: 'GOA-2026',
  organizerId: 'user-maya-001',
  status: 'voting',
  totalMembersCount: 5
};

export const useGatherlyStore = create<GatherlyState>((set, get) => ({
  currentUserId: 'user-maya-001',
  isDarkMode: false,
  subscriptionPlan: 'free',

  groups: [initialGroup],
  activeGroupId: DEMO_GROUP_ID,
  members: DEMO_MEMBERS,
  tripOptions: DEMO_TRIP_OPTIONS,

  votes: {
    // Initial demo votes (all approve Goa, partial approve others)
    'opt-goa-01_user-maya-001': true,
    'opt-goa-01_user-jake-002': true,
    'opt-goa-01_user-priya-003': true,
    'opt-goa-01_user-alex-004': true,
    'opt-goa-01_user-sam-005': true,
    'opt-manali-02_user-jake-002': true,
    'opt-manali-02_user-alex-004': true,
    'opt-kerala-04_user-jake-002': true,
    'opt-kerala-04_user-sam-005': true,
    'opt-bangalore-03_user-alex-004': true,
    'opt-bangalore-03_user-maya-001': true
  },
  finalizedBrief: null,

  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  setCurrentUser: (userId: string) => set({ currentUserId: userId }),

  setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),

  submitPreferences: (preference: MemberPreference) => {
    set((state) => {
      const existingIdx = state.members.findIndex((m) => m.userId === preference.userId);
      let updated: MemberPreference[];
      if (existingIdx >= 0) {
        updated = [...state.members];
        updated[existingIdx] = preference;
      } else {
        updated = [...state.members, preference];
      }
      return { members: updated };
    });
  },

  castVote: (optionId: string, approved: boolean) => {
    const { currentUserId, votes } = get();
    const key = `${optionId}_${currentUserId}`;
    const newVotes = { ...votes };
    if (approved) {
      newVotes[key] = true;
    } else {
      delete newVotes[key];
    }
    set({ votes: newVotes });
  },

  getConsensusResults: () => {
    const { activeGroupId, groups, tripOptions, members } = get();
    const currentGroup = groups.find((g) => g.id === activeGroupId) || initialGroup;
    return calculateConsensus(
      activeGroupId,
      currentGroup.totalMembersCount,
      tripOptions,
      members
    );
  },

  getOptionApprovalCount: (optionId: string) => {
    const { votes } = get();
    return Object.keys(votes).filter(
      (k) => k.startsWith(`${optionId}_`) && votes[k] === true
    ).length;
  },

  finalizeTrip: () => {
    const consensus = get().getConsensusResults();
    if (!consensus.winningOption) return null;

    const brief: TripBrief = {
      groupId: get().activeGroupId,
      winningOption: consensus.winningOption,
      finalizedAt: new Date().toISOString(),
      confirmedParticipants: get().members.map((m) => m.userName),
      totalBudgetRange: `$${Math.min(...get().members.map((m) => m.budgetMin))} - $${Math.max(...get().members.map((m) => m.budgetMax))}`,
      travelWindow: `${consensus.winningOption.option.dateStart} to ${consensus.winningOption.option.dateEnd}`
    };

    set((state) => ({
      finalizedBrief: brief,
      groups: state.groups.map((g) =>
        g.id === state.activeGroupId ? { ...g, status: 'finalized' } : g
      )
    }));

    return brief;
  },

  resetDemoState: () => {
    set({
      currentUserId: 'user-maya-001',
      groups: [initialGroup],
      members: DEMO_MEMBERS,
      tripOptions: DEMO_TRIP_OPTIONS,
      finalizedBrief: null
    });
  }
}));
