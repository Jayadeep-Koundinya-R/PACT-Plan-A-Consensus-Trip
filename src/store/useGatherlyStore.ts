import { create } from 'zustand';
import {
  MemberPreference,
  TripOption,
  ScoredTripOption,
  ConsensusResult
} from '../lib/consensus/types';
import { calculateConsensus } from '../lib/consensus/engine';
import { DEMO_MEMBERS, DEMO_TRIP_OPTIONS, DEMO_GROUP_ID } from '../lib/consensus/seedData';
import { assertOrganizerCanFinalize } from '../lib/security/accessControl';

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
  preferenceDrafts: Record<string, Partial<MemberPreference>>; // key: `${groupId}_${userId}`

  // Voting & Consensus
  votes: Record<string, boolean>; // key: `${optionId}_${userId}` -> true (approved)
  finalizedBrief: TripBrief | null;

  // Actions
  toggleDarkMode: () => void;
  setCurrentUser: (userId: string) => void;
  setSubscriptionPlan: (plan: 'free' | 'premium_monthly' | 'premium_annual') => void;
  createGroup: (name: string) => Group;
  joinGroupByCode: (code: string) => { success: boolean; message: string; group?: Group };
  setActiveGroup: (groupId: string) => void;
  savePreferenceDraft: (groupId: string, draft: Partial<MemberPreference>) => void;
  submitPreferences: (preference: MemberPreference) => void;
  castVote: (optionId: string, approved: boolean) => void;
  getConsensusResults: () => ConsensusResult;
  getOptionApprovalCount: (optionId: string) => number;
  finalizeTrip: (callerUserId?: string) => TripBrief;
  reopenVoting: (groupId: string, callerUserId?: string) => void;
  setDemoScenario: (scenario: 'consensus_winner' | 'budget_deadlock' | 'dealbreaker_deadlock') => void;
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
  preferenceDrafts: {},

  votes: {
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

  setActiveGroup: (groupId: string) => set({ activeGroupId: groupId }),

  createGroup: (name: string) => {
    const { currentUserId, groups } = get();
    const cleanName = name.trim() || 'New Trip Circle';
    const code = cleanName
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 4)
      .toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: cleanName,
      inviteCode: code,
      organizerId: currentUserId,
      status: 'collecting',
      totalMembersCount: 1
    };

    set({
      groups: [...groups, newGroup],
      activeGroupId: newGroup.id
    });

    return newGroup;
  },

  joinGroupByCode: (code: string) => {
    const clean = code.trim().toUpperCase();
    const { groups } = get();
    const found = groups.find((g) => g.inviteCode.toUpperCase() === clean);
    if (found) {
      set({ activeGroupId: found.id });
      return { success: true, message: `Joined ${found.name}!`, group: found };
    }
    return { success: false, message: 'Invalid invite code. Please check and try again.' };
  },

  savePreferenceDraft: (groupId: string, draft: Partial<MemberPreference>) => {
    const { currentUserId } = get();
    const key = `${groupId}_${currentUserId}`;
    set((state) => ({
      preferenceDrafts: {
        ...state.preferenceDrafts,
        [key]: { ...state.preferenceDrafts[key], ...draft }
      }
    }));
  },

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

  finalizeTrip: (callerUserId?: string) => {
    const { currentUserId, activeGroupId, groups, members } = get();
    const effectiveCaller = callerUserId || currentUserId;
    const currentGroup = groups.find((g) => g.id === activeGroupId) || initialGroup;
    const consensus = get().getConsensusResults();

    if (!consensus.winningOption) {
      throw new Error('No winning option meets the consensus criteria.');
    }

    // Security assertion: Organizer authorization check
    assertOrganizerCanFinalize(
      effectiveCaller,
      currentGroup.organizerId,
      consensus.winningOption.consensusPercent
    );

    const brief: TripBrief = {
      groupId: activeGroupId,
      winningOption: consensus.winningOption,
      finalizedAt: new Date().toISOString(),
      confirmedParticipants: members.map((m) => m.userName),
      totalBudgetRange: `$${Math.min(...members.map((m) => m.budgetMin))} - $${Math.max(...members.map((m) => m.budgetMax))}`,
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

  reopenVoting: (groupId: string, callerUserId?: string) => {
    const { currentUserId, groups } = get();
    const effectiveCaller = callerUserId || currentUserId;
    const targetGroup = groups.find((g) => g.id === groupId);

    if (targetGroup && targetGroup.organizerId !== effectiveCaller) {
      throw new Error('Only the organizer can reopen voting rounds.');
    }

    set((state) => ({
      finalizedBrief: null,
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, status: 'voting' } : g
      )
    }));
  },

  setDemoScenario: (scenario: 'consensus_winner' | 'budget_deadlock' | 'dealbreaker_deadlock') => {
    const freshOptions: TripOption[] = JSON.parse(JSON.stringify(DEMO_TRIP_OPTIONS));
    const freshMembers: MemberPreference[] = JSON.parse(JSON.stringify(DEMO_MEMBERS));

    if (scenario === 'consensus_winner') {
      set({
        tripOptions: freshOptions,
        members: freshMembers,
        finalizedBrief: null
      });
    } else if (scenario === 'budget_deadlock') {
      // Elevate trip budgets to $2800-$3500 to trigger extreme budget gaps for low-budget members
      set({
        tripOptions: freshOptions.map((opt) => ({
          ...opt,
          budgetPerPerson: 2900
        })),
        members: freshMembers,
        finalizedBrief: null
      });
    } else if (scenario === 'dealbreaker_deadlock') {
      // Add dealbreaker tags to all destinations to test the 0% score override and deadlock alert
      set({
        tripOptions: freshOptions.map((opt) => ({
          ...opt,
          tags: Array.from(new Set([...opt.tags, 'hiking', 'cold', 'city']))
        })),
        members: freshMembers,
        finalizedBrief: null
      });
    }
  },

  resetDemoState: () => {
    set({
      currentUserId: 'user-maya-001',
      groups: [initialGroup],
      activeGroupId: DEMO_GROUP_ID,
      members: JSON.parse(JSON.stringify(DEMO_MEMBERS)),
      tripOptions: JSON.parse(JSON.stringify(DEMO_TRIP_OPTIONS)),
      preferenceDrafts: {},
      votes: {
        'opt-goa-01_user-maya-001': true,
        'opt-goa-01_user-jake-002': true,
        'opt-goa-01_user-priya-003': true,
        'opt-goa-01_user-alex-004': true,
        'opt-goa-01_user-sam-005': true,
        'opt-bangalore-03_user-alex-004': true,
        'opt-bangalore-03_user-sam-005': true,
        'opt-kerala-04_user-maya-001': true,
        'opt-kerala-04_user-priya-003': true,
        'opt-manali-02_user-jake-002': true,
        'opt-manali-02_user-alex-004': true
      },
      finalizedBrief: null,
      subscriptionPlan: 'free'
    });
  }
}));
