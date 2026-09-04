import { synthesizeAICompromise, CompromiseProposal } from '../lib/ai/compromiseEngine';
import { SubscriptionPlan } from '../lib/purchases/customerInfo';
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

export interface VaultItem {
  id: string;
  name: string;
  meta: string;
  type: 'flight' | 'transfer' | 'villa' | 'ticket' | 'other';
  section: string;
}

export interface MemoryPhotoItem {
  id: string;
  bg: string;
  by: string;
  caption?: string;
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
  subscriptionPlan: SubscriptionPlan;
  isCheckingEntitlement: boolean;
  purchaseError: string | null;

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
  setIsCheckingEntitlement: (v: boolean) => void;
  setPurchaseError: (msg: string | null) => void;
  setSubscriptionPlan: (plan: 'free' | 'premium_monthly' | 'premium_annual') => void;
  createGroup: (name: string | { name?: string; organizerName?: string; organizerId?: string; totalMembersCount?: number }) => Promise<Group>;
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

  activeDemoScenario: string;
  setDemoScenario: (scenario: 'early_bird' | 'budget_gap' | 'deadlock' | 'consensus' | 'consensus_winner' | 'budget_deadlock' | 'dealbreaker_deadlock') => void;
  setPendingInviteCode: (code: string | null) => void;
  resetDemoState: () => void;
}

const initialGroup: Group = {
  id: DEMO_GROUP_ID,
  name: 'Goa Beach Escape 2026',
  inviteCode: 'GOA-4F82',
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
  isCheckingEntitlement: false,
  purchaseError: null,

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
  activeDemoScenario: 'early_bird',

  vaultDocuments: {
    'circle-college-reunion-2026': [
      {
        section: 'FLIGHTS & TRANSPORT',
        items: [
          { id: 'v1', name: 'IndiGo_Flight_All5.pdf', meta: 'Uploaded by Alex  •  1.2 MB', type: 'flight', section: 'FLIGHTS & TRANSPORT' },
          { id: 'v2', name: 'Airport_Transfer_Receipt.pdf', meta: 'Uploaded by Sam  •  450 KB', type: 'transfer', section: 'FLIGHTS & TRANSPORT' }
        ]
      },
      {
        section: 'ACCOMMODATION BOOKINGS',
        items: [
          { id: 'v3', name: 'South_Goa_Villa_Confirmation.pdf', meta: 'Uploaded by You  •  Code #PACT-9921', type: 'villa', section: 'ACCOMMODATION BOOKINGS' }
        ]
      }
    ]
  },
  memoryPhotos: {
    'circle-college-reunion-2026': [
      { id: 'p1', bg: '#3A1F1F', by: 'Alex', caption: 'Sunset at Palolem beach' },
      { id: 'p2', bg: '#2A2416', by: 'Maya', caption: 'Old Goa cathedral walk' },
      { id: 'p3', bg: '#16241F', by: 'Sam', caption: 'Scooter convoy morning' },
      { id: 'p4', bg: '#1E1A2A', by: 'Jordan', caption: 'Seafood feast dinner' }
    ]
  },

  addVaultDocument: (groupId: string, doc: Omit<VaultItem, 'id'>) => {
    const id = 'v_' + Date.now();
    const newItem: VaultItem = { ...doc, id };
    set((state) => {
      const existingSections = state.vaultDocuments[groupId] || [];
      const sectionIdx = existingSections.findIndex((s) => s.section === doc.section);
      let updatedSections;
      if (sectionIdx >= 0) {
        updatedSections = existingSections.map((s, idx) =>
          idx === sectionIdx ? { ...s, items: [...s.items, newItem] } : s
        );
      } else {
        updatedSections = [...existingSections, { section: doc.section, items: [newItem] }];
      }
      return {
        vaultDocuments: { ...state.vaultDocuments, [groupId]: updatedSections }
      };
    });
  },

  addMemoryPhoto: (groupId: string, photo: Omit<MemoryPhotoItem, 'id'>) => {
    const id = 'p_' + Date.now();
    const newPhoto: MemoryPhotoItem = { ...photo, id };
    set((state) => ({
      memoryPhotos: {
        ...state.memoryPhotos,
        [groupId]: [...(state.memoryPhotos[groupId] || []), newPhoto]
      }
    }));
  },

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
  setIsCheckingEntitlement: (v: boolean) => set({ isCheckingEntitlement: v }),
  setPurchaseError: (msg: string | null) => set({ purchaseError: msg }),

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
  createGroup: async (name: string | { name?: string; organizerName?: string; organizerId?: string; totalMembersCount?: number }) => {
    const { currentUserId, groups } = get();
    const rawName = typeof name === 'object' && name !== null ? name.name : name;
    const cleanName = (typeof rawName === 'string' ? rawName.trim() : '') || 'New Trip Circle';
    const totalCount = (typeof name === 'object' && name !== null && name.totalMembersCount)
      ? Number(name.totalMembersCount)
      : 5;
    const organizer = (typeof name === 'object' && name !== null && name.organizerId)
      ? name.organizerId
      : (currentUserId || 'user-maya-001');

    let newGroup: Group;
    if (organizer && !organizer.startsWith('user-')) {
      try {
        const cloudGroup = await createSupabaseGroup(cleanName, organizer);
        newGroup = {
          id: cloudGroup.id,
          name: cloudGroup.name,
          inviteCode: cloudGroup.invite_code,
          organizerId: cloudGroup.organizer_id,
          status: cloudGroup.status,
          totalMembersCount: totalCount
        };
      } catch (e) {
        console.warn('Supabase createGroup failed, falling back to local:', e);
        const code = cleanName.slice(0, 4).replace(/[^A-Z0-9]/gi, 'X').toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
        newGroup = {
          id: `group-${Date.now()}`,
          name: cleanName,
          inviteCode: code,
          organizerId: organizer,
          status: 'collecting',
          totalMembersCount: totalCount
        };
      }
    } else {
      const code = cleanName.slice(0, 4).replace(/[^A-Z0-9]/gi, 'X').toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
      newGroup = {
        id: `group-${Date.now()}`,
        name: cleanName,
        inviteCode: code,
        organizerId: organizer,
        status: 'collecting',
        totalMembersCount: totalCount
      };
    }

    set({
      groups: [newGroup, ...groups],
      activeGroupId: newGroup.id
    });

    try {
      const { useCircleStore } = require('./useCircleStore');
      useCircleStore.getState().addCircle({
        id: newGroup.id,
        name: newGroup.name,
        inviteCode: newGroup.inviteCode,
        organizerId: newGroup.organizerId,
        organizerName: 'Alex Rivers',
        status: 'collecting',
        totalMembersCount: newGroup.totalMembersCount,
        members: [
          { userId: organizer, name: 'Alex (You)', status: 'locked', nudgedAt: null }
        ],
        createdAt: new Date().toISOString()
      });
    } catch (e) {}

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

  vaultDocuments: {
    'circle-college-reunion-2026': [
      {
        section: 'FLIGHTS & TRANSPORT',
        items: [
          { id: 'v1', name: 'IndiGo_Flight_All5.pdf', meta: 'Uploaded by Alex  •  1.2 MB', type: 'flight', section: 'FLIGHTS & TRANSPORT' },
          { id: 'v2', name: 'Airport_Transfer_Receipt.pdf', meta: 'Uploaded by Sam  •  450 KB', type: 'transfer', section: 'FLIGHTS & TRANSPORT' }
        ]
      },
      {
        section: 'ACCOMMODATION BOOKINGS',
        items: [
          { id: 'v3', name: 'South_Goa_Villa_Confirmation.pdf', meta: 'Uploaded by You  •  Code #PACT-9921', type: 'villa', section: 'ACCOMMODATION BOOKINGS' }
        ]
      }
    ]
  },
  memoryPhotos: {
    'circle-college-reunion-2026': [
      { id: 'p1', bg: '#3A1F1F', by: 'Alex', caption: 'Sunset at Palolem beach' },
      { id: 'p2', bg: '#2A2416', by: 'Maya', caption: 'Old Goa cathedral walk' },
      { id: 'p3', bg: '#16241F', by: 'Sam', caption: 'Scooter convoy morning' },
      { id: 'p4', bg: '#1E1A2A', by: 'Jordan', caption: 'Seafood feast dinner' }
    ]
  },

  addVaultDocument: (groupId: string, doc: Omit<VaultItem, 'id'>) => {
    const id = 'v_' + Date.now();
    const newItem: VaultItem = { ...doc, id };
    set((state) => {
      const existingSections = state.vaultDocuments[groupId] || [];
      const sectionIdx = existingSections.findIndex((s) => s.section === doc.section);
      let updatedSections;
      if (sectionIdx >= 0) {
        updatedSections = existingSections.map((s, idx) =>
          idx === sectionIdx ? { ...s, items: [...s.items, newItem] } : s
        );
      } else {
        updatedSections = [...existingSections, { section: doc.section, items: [newItem] }];
      }
      return {
        vaultDocuments: { ...state.vaultDocuments, [groupId]: updatedSections }
      };
    });
  },

  addMemoryPhoto: (groupId: string, photo: Omit<MemoryPhotoItem, 'id'>) => {
    const id = 'p_' + Date.now();
    const newPhoto: MemoryPhotoItem = { ...photo, id };
    set((state) => ({
      memoryPhotos: {
        ...state.memoryPhotos,
        [groupId]: [...(state.memoryPhotos[groupId] || []), newPhoto]
      }
    }));
  },
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, status: 'voting' } : g
      )
    }));
  },


  setPendingInviteCode: (code: string | null) => set({ pendingInviteCode: code }),

  setDemoScenario: (scenario: string) => {
    const freshOptions: TripOption[] = JSON.parse(JSON.stringify(DEMO_TRIP_OPTIONS));
    const freshMembers: MemberPreference[] = JSON.parse(JSON.stringify(DEMO_MEMBERS));

    if (scenario === 'early_bird') {
      // Only 1 or 2 members locked in, rest awaiting
      const earlyMembers = freshMembers.map((m, idx) => ({
        ...m,
        status: idx === 0 ? 'locked' : 'waiting'
      }));
      set({
        activeDemoScenario: 'early_bird',
        tripOptions: freshOptions,
        members: earlyMembers,
        finalizedBrief: null
      });
    } else if (scenario === 'budget_gap' || scenario === 'budget_deadlock') {
      // Wide budget gap: $700 cap vs $2500 cap
      const budgetGapMembers = freshMembers.map((m, idx) => {
        if (idx === 0) return { ...m, budgetMin: 2000, budgetMax: 2500, status: 'locked' };
        if (idx === 1) return { ...m, budgetMin: 500, budgetMax: 700, status: 'locked' };
        return { ...m, status: 'locked' };
      });
      set({
        activeDemoScenario: 'budget_gap',
        tripOptions: freshOptions.map((opt) => ({
          ...opt,
          budgetPerPerson: 1100
        })),
        members: budgetGapMembers,
        finalizedBrief: null
      });
    } else if (scenario === 'deadlock' || scenario === 'dealbreaker_deadlock') {
      // Conflicting dealbreakers across all members -> 0% match / deadlock
      const deadlockMembers = freshMembers.map((m) => ({
        ...m,
        dealbreakers: ['beach', 'nightlife', 'warm', 'cold', 'city', 'hiking'],
        status: 'locked'
      }));
      set({
        activeDemoScenario: 'deadlock',
        tripOptions: freshOptions.map((opt) => ({
          ...opt,
          tags: Array.from(new Set([...opt.tags, 'hiking', 'cold', 'city']))
        })),
        members: deadlockMembers,
        finalizedBrief: null
      });
    } else if (scenario === 'consensus' || scenario === 'consensus_winner') {
      // Perfect consensus: 5/5 agreed on Goa Beach Escape
      const consensusMembers = freshMembers.map((m) => ({
        ...m,
        budgetMin: 400,
        budgetMax: 1500,
        dealbreakers: [],
        status: 'locked'
      }));
      set({
        activeDemoScenario: 'consensus',
        tripOptions: freshOptions,
        members: consensusMembers,
        votes: {
          'opt-goa-01_user-maya-001': true,
          'opt-goa-01_user-jake-002': true,
          'opt-goa-01_user-priya-003': true,
          'opt-goa-01_user-alex-004': true,
          'opt-goa-01_user-sam-005': true
        },
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

  vaultDocuments: {
    'circle-college-reunion-2026': [
      {
        section: 'FLIGHTS & TRANSPORT',
        items: [
          { id: 'v1', name: 'IndiGo_Flight_All5.pdf', meta: 'Uploaded by Alex  •  1.2 MB', type: 'flight', section: 'FLIGHTS & TRANSPORT' },
          { id: 'v2', name: 'Airport_Transfer_Receipt.pdf', meta: 'Uploaded by Sam  •  450 KB', type: 'transfer', section: 'FLIGHTS & TRANSPORT' }
        ]
      },
      {
        section: 'ACCOMMODATION BOOKINGS',
        items: [
          { id: 'v3', name: 'South_Goa_Villa_Confirmation.pdf', meta: 'Uploaded by You  •  Code #PACT-9921', type: 'villa', section: 'ACCOMMODATION BOOKINGS' }
        ]
      }
    ]
  },
  memoryPhotos: {
    'circle-college-reunion-2026': [
      { id: 'p1', bg: '#3A1F1F', by: 'Alex', caption: 'Sunset at Palolem beach' },
      { id: 'p2', bg: '#2A2416', by: 'Maya', caption: 'Old Goa cathedral walk' },
      { id: 'p3', bg: '#16241F', by: 'Sam', caption: 'Scooter convoy morning' },
      { id: 'p4', bg: '#1E1A2A', by: 'Jordan', caption: 'Seafood feast dinner' }
    ]
  },

  addVaultDocument: (groupId: string, doc: Omit<VaultItem, 'id'>) => {
    const id = 'v_' + Date.now();
    const newItem: VaultItem = { ...doc, id };
    set((state) => {
      const existingSections = state.vaultDocuments[groupId] || [];
      const sectionIdx = existingSections.findIndex((s) => s.section === doc.section);
      let updatedSections;
      if (sectionIdx >= 0) {
        updatedSections = existingSections.map((s, idx) =>
          idx === sectionIdx ? { ...s, items: [...s.items, newItem] } : s
        );
      } else {
        updatedSections = [...existingSections, { section: doc.section, items: [newItem] }];
      }
      return {
        vaultDocuments: { ...state.vaultDocuments, [groupId]: updatedSections }
      };
    });
  },

  addMemoryPhoto: (groupId: string, photo: Omit<MemoryPhotoItem, 'id'>) => {
    const id = 'p_' + Date.now();
    const newPhoto: MemoryPhotoItem = { ...photo, id };
    set((state) => ({
      memoryPhotos: {
        ...state.memoryPhotos,
        [groupId]: [...(state.memoryPhotos[groupId] || []), newPhoto]
      }
    }));
  },
      subscriptionPlan: 'free'
    });
  }
}));
