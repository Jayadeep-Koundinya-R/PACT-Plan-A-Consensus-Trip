import { supabase } from './client';
import { MemberPreference, TripOption, ScoredTripOption, ConsensusResult } from '../consensus/types';

export interface SupabaseProfile {
  id: string;
  email: string;
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
// Clean 6-character alphanumeric code (e.g. "X7K2QM")
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const MAX_GROUP_MEMBERS = 10;

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
      email: data.user.email || email,
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
  const inviteCode = generateInviteCode();
  
  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .insert({ name, invite_code: inviteCode, organizer_id: organizerId, status: 'collecting' })
    .select()
    .single();

  if (groupError) throw groupError;

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: groupData.id, user_id: organizerId });
  if (memberError) console.warn('Error adding creator to group_members:', memberError);

  await seedDefaultTripOptions(groupData.id);
  return groupData;
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
  const { data: group, error } = await supabase
    .from('groups')
    .select('id, name, invite_code, organizer_id, status')
    .eq('invite_code', cleanCode)
    .single();

  if (error || !group) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email')
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
    organizer_name: profile?.display_name || profile?.email?.split('@')[0] || 'Organizer',
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
    .select('user_id, start_date, end_date, budget_min, budget_max, preferred_tags, dealbreakers, is_flexible, submitted_at, profiles:user_id(display_name, email)')
    .eq('group_id', groupId);
  if (error) throw error;

  return (prefs || []).map((p: any) => ({
    userId: p.user_id,
    name: p.profiles?.display_name || p.profiles?.email?.split('@')[0] || 'Member',
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
    id: opt.id, title: opt.title, destination: opt.destination,
    description: opt.description || '', startDate: opt.start_date, endDate: opt.end_date,
    pricePerPerson: opt.price_per_person, tags: opt.tags || []
  }));
}

export async function castVoteInSupabase(groupId: string, optionId: string, userId: string, approved: boolean) {
  if (approved) {
    const { error } = await supabase.from('votes').upsert({
      group_id: groupId, option_id: optionId, user_id: userId,
      approved: true, voted_at: new Date().toISOString()
    }, { onConflict: 'option_id,user_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('votes').delete()
      .eq('option_id', optionId).eq('user_id', userId);
    if (error) throw error;
  }
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
