import { supabase, isLiveSupabaseConfigured } from './client';
import { MemberPreference, TripOption, ScoredTripOption, ConsensusResult } from '../consensus/types';

export interface SupabaseProfile {
  id: string;
  display_name?: string;
  avatar_url?: string;
}

export interface SupabaseGroup {
  id: string;
  name: string;
  invite_code: string;
  organizer_id: string;
  status: string;
  total_members_count?: number;
  created_at?: string;
}

// --- Invite Code Generator ---
// Short random alphanumeric invite code (e.g. "GOA-4F82" or "X7K2QM")
export function generateInviteCode(prefix?: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(6);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 6; i++) array[i] = Math.floor(Math.random() * 256);
  }
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[array[i] % chars.length];
  }
  if (prefix) {
    const cleanPrefix = prefix.slice(0, 3).replace(/[^A-Z0-9]/gi, 'X').toUpperCase();
    return `${cleanPrefix}-${code.slice(0, 4)}`;
  }
  return code;
}

const MAX_GROUP_MEMBERS = 24;

// ============================================================
// 1. Auth Services
// ============================================================

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName || email.split('@')[0] } }
  });
  if (error) throw error;
  
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      display_name: displayName || email.split('@')[0]
    });
  }
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getActiveSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

// ============================================================
// 2. Group Services
// ============================================================

export async function createSupabaseGroup(name: string, organizerId: string): Promise<SupabaseGroup> {
  const maxRetries = 5;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const inviteCode = generateInviteCode(name);
    
    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({ name, invite_code: inviteCode, organizer_id: organizerId, status: 'collecting' })
      .select()
      .single();

    if (!groupError && groupData) {
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({ group_id: groupData.id, user_id: organizerId });
      if (memberError) console.warn('Error adding creator to group_members:', memberError);

      await seedDefaultTripOptions(groupData.id);
      return groupData;
    }

    lastError = groupError;
    // Retry on unique constraint violation (invite_code collision)
    if (groupError?.code !== '23505') {
      throw groupError;
    }
  }

  throw lastError;
}

export interface GroupPreview {
  id: string;
  name: string;
  invite_code: string;
  organizer_id: string;
  organizer_name: string;
  status: string;
  member_count: number;
}

export async function lookupGroupByInviteCode(code: string): Promise<GroupPreview | null> {
  const cleanCode = code.trim().toUpperCase();

  // Try the security definer RPC (bypasses member-only RLS safely)
  try {
    const { data: rpcRows, error: rpcError } = await supabase
      .rpc('lookup_group_by_invite_code', { p_invite_code: cleanCode });

    if (!rpcError && rpcRows && rpcRows.length > 0) {
      const r = rpcRows[0];
      return {
        id: r.id,
        name: r.name,
        invite_code: r.invite_code,
        organizer_id: r.organizer_id,
        organizer_name: r.organizer_name || 'Organizer',
        status: r.status,
        member_count: Number(r.member_count) || 1
      };
    }
  } catch (e) {
    // Fall back to direct query if RPC not yet deployed
  }

  // Direct table fallback
  const { data: group, error } = await supabase
    .from('groups')
    .select('id, name, invite_code, organizer_id, status')
    .eq('invite_code', cleanCode)
    .single();

  if (error || !group) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', group.organizer_id)
    .single();

  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', group.id);

  return {
    id: group.id,
    name: group.name,
    invite_code: group.invite_code,
    organizer_id: group.organizer_id,
    organizer_name: profile?.display_name || 'Organizer',
    status: group.status,
    member_count: count || 1
  };
}

export async function isUserAlreadyInGroup(groupId: string, userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) return false;
  return (count || 0) > 0;
}

export async function fetchUserGroups(userId: string): Promise<SupabaseGroup[]> {
  const { data: memberGroups, error: memberError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId);
  if (memberError) throw memberError;
  const groupIds = (memberGroups || []).map((m: any) => m.group_id);
  if (groupIds.length === 0) return [];

  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('id', groupIds)
    .order('created_at', { ascending: false });
  if (groupsError) throw groupsError;

  const groupsWithCount = await Promise.all(
    (groups || []).map(async (grp) => {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', grp.id);
      return { ...grp, total_members_count: count || 1 };
    })
  );
  return groupsWithCount;
}

export async function joinGroupWithCode(inviteCode: string, userId: string): Promise<SupabaseGroup> {
  const cleanCode = inviteCode.trim().toUpperCase();
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('invite_code', cleanCode)
    .single();

  if (groupError || !group) throw new Error('INVALID_CODE');
  if (group.status === 'cancelled') throw new Error('GROUP_CANCELLED');
  if (group.status === 'finalized') throw new Error('GROUP_FINALIZED');

  const alreadyMember = await isUserAlreadyInGroup(group.id, userId);
  if (alreadyMember) throw new Error('ALREADY_MEMBER');

  const { count } = await supabase
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', group.id);
  if ((count || 0) >= MAX_GROUP_MEMBERS) throw new Error('GROUP_FULL');

  const { error: joinError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId });
  if (joinError) throw joinError;
  return group;
}

export interface CloudMember {
  userId: string;
  name: string;
  role: 'organizer' | 'member';
  status: 'locked' | 'waiting';
}

export async function fetchGroupMembersFromSupabase(groupId: string): Promise<CloudMember[]> {
  try {
    const { data: members, error } = await supabase
      .from('group_members')
      .select('user_id, role, status')
      .eq('group_id', groupId);

    if (error || !members || members.length === 0) return [];

    const userIds = members.map((m: any) => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, display_name')
      .in('id', userIds);

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.display_name]));

    // Check preference submission status
    const { data: prefs } = await supabase
      .from('preferences')
      .select('user_id')
      .eq('group_id', groupId);
    const lockedUserIds = new Set((prefs || []).map((p: any) => p.user_id));

    return members.map((m: any) => ({
      userId: m.user_id,
      name: profileMap.get(m.user_id) || (m.role === 'organizer' ? 'Organizer' : 'Member'),
      role: (m.role as 'organizer' | 'member') || 'member',
      status: lockedUserIds.has(m.user_id) ? 'locked' : 'waiting'
    }));
  } catch (e) {
    console.warn('Error fetching group members from Supabase:', e);
    return [];
  }
}

// ============================================================
// 3. Preference Services
// ============================================================

export async function savePreferencesToSupabase(
  groupId: string, userId: string,
  pref: { startDate: string; endDate: string; budgetMin: number; budgetMax: number; preferredTags: string[]; dealbreakers: string[]; isFlexible: boolean; }
) {
  const { data, error } = await supabase
    .from('preferences')
    .upsert({
      group_id: groupId, user_id: userId,
      start_date: pref.startDate, end_date: pref.endDate,
      budget_min: pref.budgetMin, budget_max: pref.budgetMax,
      preferred_tags: pref.preferredTags, dealbreakers: pref.dealbreakers,
      is_flexible: pref.isFlexible, submitted_at: new Date().toISOString()
    }, { onConflict: 'group_id,user_id' })
    .select().single();
  if (error) throw error;
  return data;
}

export async function fetchGroupPreferencesFromSupabase(groupId: string): Promise<MemberPreference[]> {
  const { data: prefs, error } = await supabase
    .from('preferences')
    .select('user_id, start_date, end_date, budget_min, budget_max, preferred_tags, dealbreakers, is_flexible, submitted_at, profiles:user_id(display_name, avatar_url)')
    .eq('group_id', groupId);
  if (error) throw error;

  return (prefs || []).map((p: any) => ({
    userId: p.user_id,
    userName: p.profiles?.display_name || 'Member',
    name: p.profiles?.display_name || 'Member',
    dateRanges: p.start_date && p.end_date ? [{ start: p.start_date, end: p.end_date }] : [],
    tags: p.preferred_tags || [],
    startDate: p.start_date, endDate: p.end_date,
    budgetMin: p.budget_min, budgetMax: p.budget_max,
    preferredTags: p.preferred_tags || [], dealbreakers: p.dealbreakers || [],
    isFlexible: p.is_flexible ?? true, submittedAt: p.submitted_at
  }));
}

// ============================================================
// 4. Trip Options & Voting Services
// ============================================================

export async function fetchTripOptionsFromSupabase(groupId: string): Promise<TripOption[]> {
  const { data, error } = await supabase.from('trip_options').select('*').eq('group_id', groupId);
  if (error) throw error;
  return (data || []).map((opt: any) => ({
    id: opt.id,
    groupId: opt.group_id || groupId,
    name: opt.title || opt.name || 'Trip Option',
    destinationType: opt.destination || opt.destination_type || 'General',
    dateStart: opt.start_date || opt.date_start || '2026-07-01',
    dateEnd: opt.end_date || opt.date_end || '2026-07-05',
    budgetPerPerson: opt.price_per_person ?? opt.budget_per_person ?? 500,
    tags: opt.tags || [],
    description: opt.description || '',
    title: opt.title || opt.name || 'Trip Option',
    destination: opt.destination || opt.destination_type || 'General',
    startDate: opt.start_date || opt.date_start || '2026-07-01',
    endDate: opt.end_date || opt.date_end || '2026-07-05',
    pricePerPerson: opt.price_per_person ?? opt.budget_per_person ?? 500
  }));
}

export async function addTripOptionToGroup(groupId: string, option: TripOption): Promise<TripOption> {
  const name = option.name || 'Compromise Option';
  const destinationType = option.destinationType || 'General';
  const dateStart = option.dateStart || '2026-10-12';
  const dateEnd = option.dateEnd || '2026-10-18';
  const budgetPerPerson = option.budgetPerPerson ?? 500;

  if (isLiveSupabaseConfigured) {
    const { data, error } = await supabase.from('trip_options').insert({
      group_id: groupId,
      name,
      destination_type: destinationType,
      description: option.description || '',
      date_start: dateStart,
      date_end: dateEnd,
      budget_per_person: budgetPerPerson,
      tags: option.tags || []
    }).select().single();

    if (error) {
      console.warn('Error inserting trip option to Supabase:', error);
      throw error;
    }

    if (data) {
      return {
        id: data.id,
        groupId: data.group_id || groupId,
        name: data.name || name,
        destinationType: data.destination_type || destinationType,
        dateStart: data.date_start || dateStart,
        dateEnd: data.date_end || dateEnd,
        budgetPerPerson: data.budget_per_person ?? budgetPerPerson,
        tags: data.tags || [],
        description: data.description || ''
      };
    }
  }

  return {
    ...option,
    id: option.id || `opt-${Date.now()}`,
    groupId,
    name,
    destinationType,
    dateStart,
    dateEnd,
    budgetPerPerson
  };
}

export async function castVoteInSupabase(groupId: string, optionId: string, userId: string, approved: boolean) {
  // Silent voting semantics: Record true (approved) or false (vetoed/rejected)
  // An unvoted state is the absence of a record.
  const { error } = await supabase.from('votes').upsert({
    group_id: groupId,
    option_id: optionId,
    user_id: userId,
    approved: Boolean(approved),
    voted_at: new Date().toISOString()
  }, { onConflict: 'option_id,user_id' });
  if (error) throw error;
}

export async function fetchGroupVotesFromSupabase(groupId: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase.from('votes')
    .select('option_id, user_id, approved').eq('group_id', groupId);
  if (error) throw error;
  const voteMap: Record<string, boolean> = {};
  (data || []).forEach((v: any) => { if (v.approved) voteMap[v.option_id + '_' + v.user_id] = true; });
  return voteMap;
}

// ============================================================
// Helper: Seed default curated trip options for new groups
// ============================================================

async function seedDefaultTripOptions(groupId: string) {
  const defaultOptions = [
    { group_id: groupId, title: 'Coastal Getaway', destination: 'Goa Beach Weekend',
      description: 'Sunsets, beachside shacks, relaxed vibes with budget-friendly stays.',
      start_date: '2026-07-12', end_date: '2026-07-15', price_per_person: 650,
      tags: ['beach', 'relaxed', 'budget-conscious'] },
    { group_id: groupId, title: 'Nature & Houseboat', destination: 'Kerala Backwaters Chill',
      description: 'Serene houseboat cruise through palm-fringed lagoons.',
      start_date: '2026-07-18', end_date: '2026-07-24', price_per_person: 1100,
      tags: ['beach', 'relaxed', 'budget-conscious'] },
    { group_id: groupId, title: 'Mountain Retreat', destination: 'Manali High Altitude Adventure',
      description: 'Alpine pine forests, cozy mountain cafes, and hiking trails.',
      start_date: '2026-07-10', end_date: '2026-07-14', price_per_person: 900,
      tags: ['cold', 'nature', 'adventure'] }
  ];
  await supabase.from('trip_options').insert(defaultOptions);
}

// ============================================================
// Group Ownership & Membership Lifecycle
// ============================================================

export async function leaveSupabaseGroup(groupId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function deleteSupabaseGroup(groupId: string): Promise<void> {
  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId);
  if (error) throw error;
}

export async function transferGroupOwnership(groupId: string, newOrganizerId: string): Promise<void> {
  const { error } = await supabase
    .from('groups')
    .update({ organizer_id: newOrganizerId })
    .eq('id', groupId);
  if (error) throw error;
}
export interface GroupConsensusSnapshot {
  group_id: string;
  total_members_count: number;
  responded_members_count: number;
  is_consensus_unlocked: boolean;
  winning_option_id: string | null;
  highest_score: number;
  is_unanimous: boolean;
  is_deadlock: boolean;
  options: Array<{
    option_id: string;
    title: string;
    destination: string;
    price_per_person: number;
    start_date: string;
    end_date: string;
    tags: string[];
    total_votes: number;
    approved_votes: number;
    veto_votes: number;
    consensus_score: number;
  }>;
}

export async function fetchGroupConsensusSnapshot(groupId: string): Promise<GroupConsensusSnapshot | null> {
  try {
    const { data, error } = await supabase.rpc('get_group_consensus_snapshot', {
      p_group_id: groupId
    });
    if (error || !data) return null;
    return data as GroupConsensusSnapshot;
  } catch (e) {
    console.warn('fetchGroupConsensusSnapshot error:', e);
    return null;
  }
}


export async function saveTripBriefToSupabase(
  groupId: string,
  optionId: string | null,
  briefData: any
): Promise<boolean> {
  // PACT V2: Archive circle chat log into Memory Library upon trip finalization
  try {
    const { useCircleChatStore } = require('../../store/useCircleChatStore');
    useCircleChatStore.getState().archiveChatLog(groupId);
  } catch (e) {}

  if (!isLiveSupabaseConfigured) return true;
  try {
    const { error: briefErr } = await supabase
      .from('trip_briefs')
      .upsert({
        group_id: groupId,
        option_id: optionId || null,
        brief_data: briefData,
        chat_log_archived: true,
        generated_at: new Date().toISOString()
      });
    if (briefErr) {
      console.warn('saveTripBriefToSupabase error:', briefErr);
    }
    const { error: groupErr } = await supabase
      .from('groups')
      .update({ status: 'finalized' })
      .eq('id', groupId);
    if (groupErr) {
      console.warn('updateGroupStatus error:', groupErr);
    }
    return !briefErr && !groupErr;
  } catch (e) {
    console.warn('saveTripBriefToSupabase exception:', e);
    return false;
  }
}

export async function fetchTripBriefFromSupabase(groupId: string): Promise<any | null> {
  if (!isLiveSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('trip_briefs')
      .select('*')
      .eq('group_id', groupId)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return null;
    return data.brief_data;
  } catch (e) {
    return null;
  }
}


// ============================================================
// 7. Circle Chat Services (PACT V2)
// ============================================================

export async function fetchCircleMessagesFromSupabase(groupId: string): Promise<any[]> {
  if (!isLiveSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('circle_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });
    if (error) {
      console.warn('fetchCircleMessages error:', error);
      return [];
    }
    return data || [];
  } catch (e) {
    return [];
  }
}

export async function sendCircleMessageToSupabase(
  groupId: string,
  userId: string,
  userDisplayName: string,
  content: string
): Promise<any | null> {
  if (!isLiveSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('circle_messages')
      .insert({
        group_id: groupId,
        user_id: userId,
        user_display_name: userDisplayName,
        content: content.trim()
      })
      .select()
      .single();
    if (error) {
      console.warn('sendCircleMessage error:', error);
      return null;
    }
    return data;
  } catch (e) {
    return null;
  }
}
