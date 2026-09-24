/**
 * Unified Identity Resolver & Synchronization Engine
 * Ensures consistent traveler names across all screens (Settings, Circle Hub, Chat, Decision Brief, Vault, Home, and Join).
 * Provides clean isolation between Demo Sandbox personas (Maya, Jake, Priya, Alex, Sam) and real user names.
 */

export const DEMO_PERSONA_IDS = [
  'user-maya-001',
  'user-jake-002',
  'user-priya-003',
  'user-alex-004',
  'user-sam-005'
] as const;

export const DEMO_PERSONA_NAMES: Record<string, string> = {
  'user-maya-001': 'Maya',
  'user-jake-002': 'Jake',
  'user-priya-003': 'Priya',
  'user-alex-004': 'Alex',
  'user-sam-005': 'Sam'
};

/**
 * Checks if a given userId belongs to a built-in demo persona
 */
export function isDemoPersona(userId?: string | null): boolean {
  if (!userId) return false;
  return DEMO_PERSONA_IDS.includes(userId as any);
}

export interface IdentityResolveParams {
  displayName?: string | null;
  gatherlyUserName?: string | null;
  currentUserId?: string | null;
  email?: string | null;
}

/**
 * Pure deterministic resolution of active traveler name
 */
export function resolveActiveUserName(params: IdentityResolveParams): string {
  // 1. Explicit display name from user profile (if user entered/saved their name)
  if (params.displayName && params.displayName.trim() && params.displayName !== 'Alex Rivers') {
    return params.displayName.trim();
  }

  // 2. Gatherly store user name
  if (params.gatherlyUserName && params.gatherlyUserName.trim() && params.gatherlyUserName !== 'Alex Rivers') {
    return params.gatherlyUserName.trim();
  }

  // 3. Demo persona name mapping if in demo mode
  const currentId = params.currentUserId;
  if (currentId && DEMO_PERSONA_NAMES[currentId]) {
    return DEMO_PERSONA_NAMES[currentId];
  }

  // 4. Derive from email username if present
  const email = params.email;
  if (email && email.includes('@')) {
    const prefix = email.split('@')[0].replace(/[._-]/g, ' ');
    if (prefix.length > 1) {
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
  }

  // 5. If profile displayName exists (fallback)
  if (params.displayName && params.displayName.trim()) {
    return params.displayName.trim();
  }

  return 'Traveler';
}

/**
 * Pure resolution of active user ID
 */
export function resolveActiveUserId(params: { gatherlyId?: string | null; profileId?: string | null }): string {
  if (params.gatherlyId && params.gatherlyId.trim()) return params.gatherlyId.trim();
  if (params.profileId && params.profileId.trim()) return params.profileId.trim();
  return 'user-maya-001';
}

// Dynamic store registry for decoupled state synchronization without circular imports or native module test crashes
let _userStore: any = null;
let _gatherlyStore: any = null;
let _circleStore: any = null;

export function registerUserStore(store: any): void {
  _userStore = store;
}

export function registerGatherlyStore(store: any): void {
  _gatherlyStore = store;
}

export function registerCircleStore(store: any): void {
  _circleStore = store;
}

/**
 * Returns the active user's display name with smart resolution
 */
export function getActiveUserName(): string {
  try {
    const userProfile = _userStore?.getState?.()?.profile;
    const gatherly = _gatherlyStore?.getState?.();
    const resolved = resolveActiveUserName({
      displayName: userProfile?.displayName,
      gatherlyUserName: gatherly?.userName,
      currentUserId: gatherly?.currentUserId || userProfile?.userId,
      email: userProfile?.email || gatherly?.userEmail
    });

    if (resolved && resolved !== 'Traveler') {
      return resolved;
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const persisted = window.localStorage.getItem('pact_user_display_name');
        if (persisted && persisted.trim()) {
          return persisted.trim();
        }
      } catch (e) {}
    }

    return resolved || 'Traveler';
  } catch {
    return 'Traveler';
  }
}

/**
 * Returns the active user ID
 */
export function getActiveUserId(): string {
  try {
    const gatherlyId = _gatherlyStore?.getState?.()?.currentUserId;
    const profileId = _userStore?.getState?.()?.profile?.userId;
    return resolveActiveUserId({ gatherlyId, profileId });
  } catch {
    return 'user-maya-001';
  }
}

/**
 * Synchronously updates the user's name across useUserStore, useGatherlyStore,
 * and useCircleStore member records.
 */
export function updateActiveUserName(newName: string): void {
  const trimmed = newName.trim();
  if (!trimmed) return;

  const currentId = getActiveUserId();

  // 1. Update useUserStore
  try {
    _userStore?.getState?.()?.setProfile?.({ displayName: trimmed });
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('pact_user_display_name', trimmed);
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Failed to update userStore displayName:', err);
  }

  // 2. Update useGatherlyStore
  try {
    if (_gatherlyStore?.setState) {
      _gatherlyStore.setState({ userName: trimmed });
    }
  } catch (err) {
    console.warn('Failed to update gatherlyStore userName:', err);
  }

  // 3. Update gatherly group & members if present
  try {
    const gatherly = _gatherlyStore?.getState?.();
    if (gatherly?.members && gatherly?.groups && _gatherlyStore?.setState) {
      const updatedMembers = gatherly.members.map((m: any) =>
        m.userId === currentId ? { ...m, userName: trimmed } : m
      );
      const updatedGroups = gatherly.groups.map((g: any) =>
        g.organizerId === currentId ? { ...g, organizerName: trimmed } : g
      );
      _gatherlyStore.setState({ members: updatedMembers, groups: updatedGroups });
    }
  } catch (err) {
    console.warn('Failed to update gatherly members/groups:', err);
  }

  // 4. Update useCircleStore circles if present
  try {
    const circleStore = _circleStore?.getState?.();
    if (circleStore?.circles && _circleStore?.setState) {
      const updatedCircles = circleStore.circles.map((c: any) => ({
        ...c,
        organizerName: c.organizerId === currentId ? trimmed : c.organizerName,
        members: c.members?.map((m: any) =>
          m.userId === currentId ? { ...m, name: trimmed } : m
        )
      }));
      _circleStore.setState({ circles: updatedCircles });
    }
  } catch (err) {
    console.warn('Failed to update circleStore circles:', err);
  }
}
