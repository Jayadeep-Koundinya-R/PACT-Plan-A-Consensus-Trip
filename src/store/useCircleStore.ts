/**
 * useCircleStore — circle (group) management, response counts, member status
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
  status: 'collecting' | 'voting' | 'finalized' | 'cancelled';
  totalMembersCount: number;
  members: CircleMember[];
  createdAt: string;
}

interface CircleState {
  circles: Circle[];
  activeCircleId: string | null;

  // Derived helpers
  getCircle: (id: string) => Circle | undefined;
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
  addMember: (circleId: string, member: CircleMember) => void;
  syncFromLegacy: (groups: any[], activeGroupId: string) => void;
}

const DEMO_MEMBERS: CircleMember[] = [
  { userId: 'user-maya-001', name: 'Alex', status: 'locked', nudgedAt: null },
  { userId: 'user-jake-002', name: 'You', status: 'locked', nudgedAt: null },
  { userId: 'user-priya-003', name: 'Sam', status: 'locked', nudgedAt: null },
  { userId: 'user-alex-004', name: 'Jordan', status: 'waiting', nudgedAt: null },
  { userId: 'user-sam-005', name: 'Maya', status: 'waiting', nudgedAt: null }
];

const DEMO_CIRCLE: Circle = {
  id: 'circle-college-reunion-2026',
  name: 'Goa Beach Escape 2026',
  inviteCode: 'GOA-4F82',
  organizerId: 'user-maya-001',
  status: 'voting',
  totalMembersCount: 5,
  members: DEMO_MEMBERS,
  createdAt: new Date().toISOString()
};

export const useCircleStore = create<CircleState>((set, get) => ({
  circles: [DEMO_CIRCLE],
  activeCircleId: DEMO_CIRCLE.id,

  getCircle: (id) => get().circles.find((c) => c.id === id),

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
    set((s) => ({
      circles: [circle, ...s.circles.filter((c) => c.id !== circle.id)],
      activeCircleId: circle.id
    })),

  removeCircle: (id) =>
    set((s) => ({
      circles: s.circles.filter((c) => c.id !== id),
      activeCircleId: s.activeCircleId === id ? (s.circles[0]?.id || null) : s.activeCircleId
    })),

  updateCircleStatus: (id, status) =>
    set((s) => ({
      circles: s.circles.map((c) => (c.id === id ? { ...c, status } : c))
    })),

  setMemberStatus: (circleId, userId, status) =>
    set((s) => ({
      circles: s.circles.map((c) =>
        c.id === circleId
          ? {
              ...c,
              members: c.members.map((m) =>
                m.userId === userId ? { ...m, status } : m
              )
            }
          : c
      )
    })),

  nudgeMember: (circleId, userId) =>
    set((s) => ({
      circles: s.circles.map((c) =>
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
      )
    })),

  addMember: (circleId, member) =>
    set((s) => ({
      circles: s.circles.map((c) =>
        c.id === circleId
          ? {
              ...c,
              members: [...c.members.filter((m) => m.userId !== member.userId), member],
              totalMembersCount: Math.max(c.totalMembersCount, c.members.length + 1)
            }
          : c
      )
    })),

  syncFromLegacy: (groups, activeGroupId) => {
    const circles: Circle[] = groups.map((g: any) => ({
      id: g.id,
      name: g.name,
      inviteCode: g.inviteCode,
      organizerId: g.organizerId,
      status: g.status,
      totalMembersCount: g.totalMembersCount || 5,
      members: DEMO_MEMBERS,
      createdAt: new Date().toISOString()
    }));
    set({ circles, activeCircleId: activeGroupId });
  }
}));