/**
 * useCircleStore - circle (group) management, response counts, member status
 *
 * Tracks which circles exist, member response states, invite codes,
 * and real-time responded/total counts for progress meters.
 */
import { create } from 'zustand';

export type MemberStatus = 'locked' | 'waiting' | 'nudged';

export interface CircleMember {
  userId: string;
  name: string;
  status: MemberStatus;
  nudgedAt: string | null;
}

export interface Circle {
  id: string;
  name: string;
  inviteCode: string;
  organizerId: string;
  organizerName?: string;
  status: 'collecting' | 'voting' | 'finalized' | 'cancelled';
  totalMembersCount: number;
  hasPro?: boolean;
  archived?: boolean;
  members: CircleMember[];
  createdAt: string;
}

interface CircleState {
  circles: Circle[];
  activeCircleId: string | null;

  // Derived helpers
  getCircle: (id: string) => Circle | undefined;
  getCircleByInviteCode: (code: string) => Circle | undefined;
  getActiveCircle: () => Circle | undefined;
  getRespondedCount: (circleId: string) => number;
  getTotalCount: (circleId: string) => number;
  getMemberStatus: (circleId: string, userId: string) => MemberStatus | null;

  // Actions
  setActiveCircle: (id: string) => void;
  addCircle: (circle: Circle) => void;
  removeCircle: (id: string) => void;
  updateCircleStatus: (id: string, status: Circle['status']) => void;
  setMemberStatus: (circleId: string, userId: string, status: MemberStatus) => void;
  nudgeMember: (circleId: string, userId: string) => void;
  addMember: (circleId: string, member: CircleMember) => boolean;
  removeMember: (circleId: string, userId: string) => void;
  /**
   * Safe removal that blocks the organizer from leaving if other members exist.
   * Returns { ok: true } on success or { ok: false, reason: string } on block.
   */
  safeRemoveMember: (circleId: string, userId: string) => { ok: boolean; reason?: string };
  claimMemberSlot: (circleId: string, name: string, userId: string) => boolean;
  archiveCircle: (id: string) => void;
  unarchiveCircle: (id: string) => void;
  syncFromLegacy: (groups: any[], activeGroupId: string) => void;
  setCircleProStatus: (circleId: string, hasPro: boolean) => void;
  isCirclePro: (circleId: string) => boolean;
  loadDemoCircle: () => void;
  clearCircles: () => void;
}

const DEMO_MEMBERS: CircleMember[] = [
  { userId: 'user-maya-001', name: 'Maya (Organizer)', status: 'locked', nudgedAt: null },
  { userId: 'user-jake-002', name: 'Jake', status: 'locked', nudgedAt: null },
  { userId: 'user-priya-003', name: 'Priya', status: 'locked', nudgedAt: null },
  { userId: 'user-alex-004', name: 'Alex', status: 'waiting', nudgedAt: null },
  { userId: 'user-sam-005', name: 'Sam', status: 'waiting', nudgedAt: null }
];

const DEMO_CIRCLE: Circle = {
  id: 'circle-college-reunion-2026',
  name: 'Goa Beach Escape 2026',
  inviteCode: 'GOA-4F82',
  organizerId: 'user-maya-001',
  organizerName: 'Maya',
  status: 'voting',
  totalMembersCount: 5,
  hasPro: true,
  members: DEMO_MEMBERS,
  createdAt: new Date().toISOString()
};

const getInitialCircles = (): Circle[] => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const saved = window.localStorage.getItem('pact_circles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
  }
  return [];
};

const saveCirclesToStorage = (circles: Circle[]) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('pact_circles', JSON.stringify(circles));
    } catch (e) {}
  }
};

export const useCircleStore = create<CircleState>((set, get) => ({
  circles: getInitialCircles(),
  activeCircleId: null,

  getCircle: (id) => get().circles.find((c) => c.id === id),

  getCircleByInviteCode: (code) => {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();
    return get().circles.find((c) => c.inviteCode.toUpperCase() === clean);
  },

  getActiveCircle: () => {
    const { circles, activeCircleId } = get();
    return circles.find((c) => c.id === activeCircleId);
  },

  getRespondedCount: (circleId) => {
    const circle = get().circles.find((c) => c.id === circleId);
    if (!circle) return 0;
    return circle.members.filter((m) => m.status === 'locked').length;
  },

  getTotalCount: (circleId) => {
    const circle = get().circles.find((c) => c.id === circleId);
    return circle ? circle.totalMembersCount : 0;
  },

  getMemberStatus: (circleId, userId) => {
    const circle = get().circles.find((c) => c.id === circleId);
    if (!circle) return null;
    const member = circle.members.find((m) => m.userId === userId);
    return member ? member.status : null;
  },

  setActiveCircle: (id) => set({ activeCircleId: id }),

  addCircle: (circle) =>
    set((s) => {
      const updated = [circle, ...s.circles.filter((c) => c.id !== circle.id)];
      saveCirclesToStorage(updated);
      return {
        circles: updated,
        activeCircleId: circle.id
      };
    }),

  removeCircle: (id) =>
    set((s) => {
      const updated = s.circles.filter((c) => c.id !== id);
      saveCirclesToStorage(updated);
      return {
        circles: updated,
        activeCircleId: s.activeCircleId === id ? (s.circles[0]?.id || null) : s.activeCircleId
      };
    }),

  updateCircleStatus: (id, status) =>
    set((s) => {
      const updated = s.circles.map((c) => (c.id === id ? { ...c, status } : c));
      saveCirclesToStorage(updated);
      return { circles: updated };
    }),

  setMemberStatus: (circleId, userId, status) =>
    set((s) => {
      const updated = s.circles.map((c) =>
        c.id === circleId
          ? {
              ...c,
              members: c.members.map((m) =>
                m.userId === userId ? { ...m, status } : m
              )
            }
          : c
      );
      saveCirclesToStorage(updated);
      return { circles: updated };
    }),

  setCircleProStatus: (circleId, hasPro) =>
    set((s) => {
      const updated = s.circles.map((c) =>
        c.id === circleId ? { ...c, hasPro } : c
      );
      saveCirclesToStorage(updated);
      return { circles: updated };
    }),

  loadDemoCircle: () => {
    set((s) => {
      const updated = [DEMO_CIRCLE, ...s.circles.filter((c) => c.id !== DEMO_CIRCLE.id)];
      saveCirclesToStorage(updated);
      return {
        circles: updated,
        activeCircleId: DEMO_CIRCLE.id
      };
    });
  },
  clearCircles: () => {
    saveCirclesToStorage([]);
    set({
      circles: [],
      activeCircleId: null
    });
  },
  isCirclePro: (circleId) => {
    const circle = get().circles.find((c) => c.id === circleId);
    return Boolean(circle?.hasPro);
  },

  nudgeMember: (circleId, userId) =>
    set((s) => {
      const updated = s.circles.map((c) =>
        c.id === circleId
          ? {
              ...c,
              members: c.members.map((m) =>
                m.userId === userId
                  ? { ...m, status: 'nudged' as MemberStatus, nudgedAt: new Date().toISOString() }
                  : m
              )
            }
          : c
      );
      saveCirclesToStorage(updated);
      return { circles: updated };
    }),

  addMember: (circleId, member) => {
    let added = false;
    set((s) => {
      const circle = s.circles.find((c) => c.id === circleId);
      if (!circle) return { circles: s.circles };

      const cleanMember: CircleMember = {
        ...member,
        name: member.name.replace(/\s*\(You\)/gi, '').trim()
      };

      const existingIndex = circle.members.findIndex((m) => m.userId === cleanMember.userId);
      if (existingIndex >= 0) {
        const updatedMembers = [...circle.members];
        updatedMembers[existingIndex] = cleanMember;
        const updated = s.circles.map((c) => (c.id === circleId ? { ...c, members: updatedMembers } : c));
        saveCirclesToStorage(updated);
        added = true;
        return { circles: updated };
      }

      // Strictly enforce circle capacity: reject if current members already meet or exceed capacity
      if (circle.members.length >= circle.totalMembersCount) {
        return { circles: s.circles };
      }

      const updated = s.circles.map((c) =>
        c.id === circleId
          ? {
              ...c,
              members: [...c.members, cleanMember]
            }
          : c
      );
      saveCirclesToStorage(updated);
      added = true;
      return { circles: updated };
    });
    return added;
  },

  removeMember: (circleId, userId) =>
    set((s) => {
      const updated = s.circles.map((c) =>
        c.id === circleId
          ? {
              ...c,
              members: c.members.filter((m) => m.userId !== userId)
            }
          : c
      );
      saveCirclesToStorage(updated);
      return { circles: updated };
    }),

  safeRemoveMember: (circleId, userId) => {
    const circle = get().circles.find((c) => c.id === circleId);
    if (!circle) return { ok: false, reason: 'Circle not found' };

    // Block the organizer from leaving if other members remain
    if (circle.organizerId === userId && circle.members.length > 1) {
      return { ok: false, reason: 'Transfer organizer role before leaving' };
    }

    get().removeMember(circleId, userId);
    return { ok: true };
  },

  claimMemberSlot: (circleId, name, userId) => {
    const cleanTargetName = name.replace(/\s*\(You\)/gi, '').replace(/\s*\(Organizer\)/gi, '').trim().toLowerCase();
    const circle = get().circles.find((c) => c.id === circleId);
    if (!circle) return false;
    const existingIndex = circle.members.findIndex(
      (m) => m.name.replace(/\s*\(You\)/gi, '').replace(/\s*\(Organizer\)/gi, '').trim().toLowerCase() === cleanTargetName
    );
    if (existingIndex >= 0) {
      set((s) => {
        const updated = s.circles.map((c) => {
          if (c.id !== circleId) return c;
          const updatedMembers = [...c.members];
          updatedMembers[existingIndex] = {
            ...updatedMembers[existingIndex],
            userId
          };
          return { ...c, members: updatedMembers };
        });
        saveCirclesToStorage(updated);
        return { circles: updated };
      });
      return true;
    }
    return false;
  },

  archiveCircle: (id) =>
    set((s) => {
      const updated = s.circles.map((c) => (c.id === id ? { ...c, archived: true } : c));
      saveCirclesToStorage(updated);
      return { circles: updated };
    }),

  unarchiveCircle: (id) =>
    set((s) => {
      const updated = s.circles.map((c) => (c.id === id ? { ...c, archived: false } : c));
      saveCirclesToStorage(updated);
      return { circles: updated };
    }),

  syncFromLegacy: (groups, activeGroupId) => {
    const existingCircles = get().circles;
    const circles: Circle[] = groups.map((g: any) => {
      const existing = existingCircles.find((c) => c.id === g.id);
      return {
        id: g.id,
        name: g.name,
        inviteCode: g.inviteCode,
        organizerId: g.organizerId,
        organizerName: g.organizerName || existing?.organizerName || 'Organizer',
        status: g.status,
        totalMembersCount: g.totalMembersCount || existing?.totalMembersCount || 5,
        members: g.id === 'circle-college-reunion-2026'
          ? DEMO_MEMBERS
          : (existing?.members && existing.members.length > 0
            ? existing.members
            : (g.members && g.members.length > 0
              ? g.members.map((m: any) => ({
                  userId: m.userId || m.user_id,
                  name: (m.userName || m.name || (m.userId === g.organizerId ? `${g.organizerName || 'Organizer'} (Organizer)` : 'Member')).replace(/\s*\(You\)/gi, '').trim(),
                  status: m.status || 'waiting',
                  nudgedAt: m.nudgedAt || null
                }))
              : [{ userId: g.organizerId, name: `${g.organizerName || 'Organizer'} (Organizer)`, status: 'locked' as MemberStatus, nudgedAt: null }])),
        createdAt: existing?.createdAt || new Date().toISOString()
      };
    });
    saveCirclesToStorage(circles);
    set({ circles, activeCircleId: activeGroupId });
  }
}));

// Register with unified identity resolver
import { registerCircleStore } from '../lib/user/identity.ts';
registerCircleStore(useCircleStore);

