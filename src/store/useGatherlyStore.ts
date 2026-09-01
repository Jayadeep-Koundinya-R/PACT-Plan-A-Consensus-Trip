import { synthesizeAICompromise, CompromiseProposal } from '../lib/ai/compromiseEngine';
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
import {
  createSupabaseGroup,
  fetchUserGroups,
  joinGroupWithCode,
  savePreferencesToSupabase,
  fetchGroupPreferencesFromSupabase,
  fetchTripOptionsFromSupabase,
  castVoteInSupabase,
  leaveSupabaseGroup,
  deleteSupabaseGroup,
  transferGroupOwnership,
  fetchGroupVotesFromSupabase,
  signOutUser
} from '../lib/supabase/service';
import { supabase } from '../lib/supabase/client';

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
  userEmail: string | null;
  userName: string | null;
  isDarkMode: boolean;
  subscriptionPlan: 'free' | 'premium_monthly' | 'premium_annual';

  // Group & Preferences
  groups: Group[];
  activeGroupId: string;
  members: MemberPreference[];
  tripOptions: TripOption[];
  preferenceDrafts: Record<string, Partial<MemberPreference>>; // key: `${groupId}_${userId}`

  pendingInviteCode: string | null;
  // Voting & Consensus
  votes: Record<string, boolean>; // key: `${optionId}_${userId}` -> true (approved)
  finalizedBrief: TripBrief | null;

  // Actions
  toggleDarkMode: () => void;
  setCurrentUser: (userId: string, email?: string, name?: string) => void;
  initAuthSession: () => Promise<void>;
  logout: () => Promise<void>;
  setSubscriptionPlan: (plan: 'free' | 'premium_monthly' | 'premium_annual') => void;
  createGroup: (name: string) => Promise<Group>;
  leaveGroup: (groupId: string) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  joinGroupByCode: (code: string) => Promise<{ success: boolean; message: string; group?: Group }>;
  setActiveGroup: (groupId: string) => void;
  fetchUserGroupsFromCloud: () => Promise<void>;
  fetchGroupDataFromCloud: (groupId: string) => Promise<void>;
  savePreferenceDraft: (groupId: string, draft: Partial<MemberPreference>) => void;
  submitPreferences: (preference: MemberPreference) => Promise<void>;
  castVote: (optionId: string, approved: boolean) => Promise<void>;
  addTripOption: (option: TripOption) => void;
  generateAICompromise: (groupId?: string) => CompromiseProposal;
  applyAICompromise: (proposal: CompromiseProposal) => void;
  getConsensusResults: () => ConsensusResult;
  getOptionApprovalCount: (optionId: string) => number;
  finalizeTrip: (callerUserId?: string) => TripBrief;
  reopenVoting: (groupId: string, callerUserId?: string) => void;

  setDemoScenario: (scenario: 'consensus_winner' | 'budget_deadlock' | 'dealbreaker_deadlock') => void;
  setPendingInviteCode: (code: string | null) => void;
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
  userEmail: null,
  userName: null,
  isDarkMode: false,
  subscriptionPlan: 'free',

  groups: [initialGroup],
  activeGroupId: DEMO_GROUP_ID,
  members: DEMO_MEMBERS,
  tripOptions: DEMO_TRIP_OPTIONS,
  preferenceDrafts: {},

  pendingInviteCode: null,
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

  setCurrentUser: (userId: string, email?: string, name?: string) => {
    set({
      currentUserId: userId,
      userEmail: email || null,
      userName: name || null
    });
    // Fetch groups for the user
    get().fetchUserGroupsFromCloud();
  },

  initAuthSession: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        set({
          currentUserId: data.session.user.id,
          userEmail: data.session.user.email || null,
          userName: data.session.user.user_metadata?.display_name || null
        });
        get().fetchUserGroupsFromCloud();
      }
    } catch (e) {
      console.warn('Error checking Supabase session:', e);
    }
  },

  logout: async () => {
    try {
      await signOutUser();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    set({
      currentUserId: 'user-maya-001',
      userEmail: null,
      userName: null,
      groups: [initialGroup],
      activeGroupId: DEMO_GROUP_ID
    });
  },

  setSubscriptionPlan: (plan) => set({ subscriptionPlan: plan }),

  setActiveGroup: (groupId: string) => {
    set({ activeGroupId: groupId });
    get().fetchGroupDataFromCloud(groupId);
  },

  fetchUserGroupsFromCloud: async () => {
    const { currentUserId } = get();
    if (!currentUserId || currentUserId.startsWith('user-')) return;
    try {
      const cloudGroups = await fetchUserGroups(currentUserId);
      if (cloudGroups.length > 0) {
        const mappedGroups: Group[] = cloudGroups.map((g) => ({
          id: g.id,
          name: g.name,
          inviteCode: g.invite_code,
          organizerId: g.organizer_id,
          status: g.status,
          totalMembersCount: g.total_members_count || 1
        }));
        set({
          groups: mappedGroups,
          activeGroupId: mappedGroups[0].id
        });
        get().fetchGroupDataFromCloud(mappedGroups[0].id);
      }
    } catch (e) {
      console.warn('Error fetching groups from Supabase:', e);
    }
  },

  fetchGroupDataFromCloud: async (groupId: string) => {
    if (!groupId || groupId === DEMO_GROUP_ID) return;
    try {
      const [cloudPrefs, cloudOptions, cloudVotes] = await Promise.all([
        fetchGroupPreferencesFromSupabase(groupId),
        fetchTripOptionsFromSupabase(groupId),
        fetchGroupVotesFromSupabase(groupId)
      ]);

      set((state) => ({
        members: cloudPrefs.length > 0 ? cloudPrefs : state.members,
        tripOptions: cloudOptions.length > 0 ? cloudOptions : state.tripOptions,
        votes: { ...state.votes, ...cloudVotes }
      }));
    } catch (e) {
      console.warn('Error fetching group data from Supabase:', e);
    }
  },

  leaveGroup: async (groupId: string) => {
    const { currentUserId, groups } = get();
    try {
      if (currentUserId && !currentUserId.startsWith('user-')) {
        await leaveSupabaseGroup(groupId, currentUserId);
      }
    } catch (e) {
      console.warn('Error leaving group in Supabase:', e);
    }
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      activeGroupId: state.groups.find((g) => g.id !== groupId)?.id || ''
    }));
  },

  deleteGroup: async (groupId: string) => {
    const { currentUserId } = get();
    try {
      if (currentUserId && !currentUserId.startsWith('user-')) {
        await deleteSupabaseGroup(groupId);
      }
    } catch (e) {
      console.warn('Error deleting group in Supabase:', e);
    }
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
      activeGroupId: state.groups.find((g) => g.id !== groupId)?.id || ''
    }));
  },
  createGroup: async (name: string) => {
    const { currentUserId, groups } = get();
    const cleanName = name.trim() || 'New Trip Circle';

    let newGroup: Group;
    if (currentUserId && !currentUserId.startsWith('user-')) {
      try {
        const cloudGroup = await createSupabaseGroup(cleanName, currentUserId);
        newGroup = {
          id: cloudGroup.id,
          name: cloudGroup.name,
          inviteCode: cloudGroup.invite_code,
          organizerId: cloudGroup.organizer_id,
          status: cloudGroup.status,
          totalMembersCount: 1
        };
      } catch (e) {
        console.warn('Supabase createGroup failed, falling back to local:', e);
        const code = cleanName.slice(0, 4).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
        newGroup = {
          id: `group-${Date.now()}`,
          name: cleanName,
          inviteCode: code,
          organizerId: currentUserId,
          status: 'collecting',
          totalMembersCount: 1
        };
      }
    } else {
      const code = cleanName.slice(0, 4).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      newGroup = {
        id: `group-${Date.now()}`,
        name: cleanName,
        inviteCode: code,
        organizerId: currentUserId,
        status: 'collecting',
        totalMembersCount: 1
      };
    }

    set({
      groups: [newGroup, ...groups],
      activeGroupId: newGroup.id
    });

    return newGroup;
  },

  joinGroupByCode: async (code: string) => {
    const clean = code.trim().toUpperCase();
    const { currentUserId, groups } = get();

    if (currentUserId && !currentUserId.startsWith('user-')) {
      try {
        const joined = await joinGroupWithCode(clean, currentUserId);
        const mapped: Group = {
          id: joined.id,
          name: joined.name,
          inviteCode: joined.invite_code,
          organizerId: joined.organizer_id,
          status: joined.status,
          totalMembersCount: 2
        };
        set({
          groups: [mapped, ...groups.filter((g) => g.id !== mapped.id)],
          activeGroupId: mapped.id
        });
        get().fetchGroupDataFromCloud(mapped.id);
        return { success: true, message: `Joined ${mapped.name}!`, group: mapped };
      } catch (e: any) {
        const msg = e?.message || '';
        const friendlyMessages: Record<string, string> = {
          'INVALID_CODE': 'Invalid invite code. Please check and try again.',
          'ALREADY_MEMBER': "You're already a member of this group!",
          'GROUP_FULL': 'This circle is full (10/10 members).',
          'GROUP_CANCELLED': 'This trip has been cancelled.',
          'GROUP_FINALIZED': 'This trip has already been finalized.'
        };
        return { success: false, message: friendlyMessages[msg] || msg || 'Failed to join group.' };
      }
    }

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

  submitPreferences: async (preference: MemberPreference) => {
    const { activeGroupId, currentUserId } = get();
    
    // If connected to Supabase and not a demo user, insert to database
    if (currentUserId && !currentUserId.startsWith('user-') && activeGroupId && activeGroupId !== DEMO_GROUP_ID) {
      try {
        await savePreferencesToSupabase(activeGroupId, currentUserId, {
          startDate: preference.startDate,
          endDate: preference.endDate,
          budgetMin: preference.budgetMin,
          budgetMax: preference.budgetMax,
          preferredTags: preference.preferredTags,
          dealbreakers: preference.dealbreakers,
          isFlexible: preference.isFlexible
        });
      } catch (e) {
        console.warn('Supabase submitPreferences error:', e);
      }
    }

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

  addTripOption: (option: TripOption) => {
    set((state) => ({
      tripOptions: [option, ...state.tripOptions.filter((o) => o.id !== option.id)]
    }));
  },

  generateAICompromise: (groupId?: string) => {
    const { activeGroupId, members, tripOptions } = get();
    const targetGroupId = groupId || activeGroupId;
    return synthesizeAICompromise(targetGroupId, members, tripOptions);
  },

  applyAICompromise: (proposal: CompromiseProposal) => {
    const { currentUserId } = get();
    set((state) => ({
      tripOptions: [proposal.option, ...state.tripOptions.filter((o) => o.id !== proposal.option.id)],
      votes: {
        ...state.votes,
        [`${proposal.option.id}_${currentUserId}`]: true
      }
    }));
  },

  castVote: async (optionId: string, approved: boolean) => {
    const { currentUserId, activeGroupId, votes } = get();
    const key = `${optionId}_${currentUserId}`;
    
    if (currentUserId && !currentUserId.startsWith('user-') && activeGroupId && activeGroupId !== DEMO_GROUP_ID) {
      try {
        await castVoteInSupabase(activeGroupId, optionId, currentUserId, approved);
      } catch (e) {
        console.warn('Supabase castVote error:', e);
      }
    }

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


  setPendingInviteCode: (code: string | null) => set({ pendingInviteCode: code }),

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
