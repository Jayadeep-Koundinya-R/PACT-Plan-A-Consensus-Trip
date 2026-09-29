import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateNotificationPrivacy } from '../lib/notifications/pactNotifications';
import { Circle } from './useCircleStore';

export interface PactNotification {
  id: string;
  type: 'ai' | 'circle' | 'nudge' | 'consensus';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  targetTab?: 'consensus' | 'manifest' | 'vault';
  privacyTag?: string;
}

interface NotificationState {
  notifications: PactNotification[];
  dismissedIds: string[];
  activeToast: PactNotification | null;
  isOpen: boolean;
  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  addNotification: (notification: Omit<PactNotification, 'id' | 'timestamp' | 'read'>) => boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  dismissToast: () => void;
  syncCircleNotifications: (params: {
    circleId: string;
    circleName?: string;
    phase: 'consensus' | 'manifest' | 'vault';
    lockedCount?: number;
    totalCount?: number;
    winningDestination?: string;
  }) => void;
  addLifecycleNotification: (stage: 'pre-voting' | 'post-consensus' | 'departure', deadlineDate?: string) => void;
  addPreTripNotification: (circleName: string, deadlineDate?: string) => void;
  addDepartureNotification: (circleName: string) => void;
  simulateAINotification: (customBody?: string) => void;
  simulateNudgeNotification: (fromName?: string) => void;
  markAsDismissed: (id: string) => void;
  regenerateFromCircles: (circles: Circle[]) => void;
  loadDismissedIds: () => Promise<void>;
}

const NOTIFICATION_STORAGE_KEY = '@pact_dismissed_notification_ids';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  dismissedIds: [],
  activeToast: null,
  isOpen: false,

  openNotificationCenter: () => set({ isOpen: true }),
  closeNotificationCenter: () => set({ isOpen: false }),

  addNotification: (item) => {
    const validation = validateNotificationPrivacy(item.title, item.body);
    if (!validation.valid) {
      console.warn('Notification rejected by privacy guard:', validation.reason);
      return false;
    }
    const tempId = 'notif-' + Date.now();
    if (get().dismissedIds.includes(tempId)) {
      return false;
    }
    const newNotif: PactNotification = {
      ...item,
      id: tempId,
      timestamp: 'Just now',
      read: false,
      privacyTag: item.privacyTag || 'Privacy Verified'
    };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      activeToast: newNotif
    }));
    return true;
  },

  markAsRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    })),

  markAllAsRead: () => set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })) })),
  clearNotifications: () => set({ notifications: [] }),
  dismissToast: () => set({ activeToast: null }),

  syncCircleNotifications: (params) => {
    const { circleId, phase, lockedCount = 4, totalCount = 5, winningDestination = 'Goa' } = params;
    const currentList = get().notifications;

    let targetNotif: Omit<PactNotification, 'id' | 'timestamp' | 'read'>;
    const phaseNotifId = `circle-phase-${circleId}`;

    if (phase === 'consensus') {
      const remaining = Math.max(0, Math.ceil(totalCount * 0.7) - lockedCount);
      const remainingText =
        remaining <= 0
          ? 'Supermajority reached'
          : `${remaining} vote${remaining > 1 ? 's' : ''} needed for Supermajority`;
      targetNotif = {
        type: 'consensus',
        title: 'Silent Ballot Active',
        body: `Silent Ballot Active • ${lockedCount}/${totalCount} members voted • ${remainingText}.`,
        targetTab: 'consensus',
        actionUrl: `/circle/${circleId}/silent-ballot`,
        privacyTag: 'Silent Voting Active'
      };
    } else {
      targetNotif = {
        type: 'consensus',
        title: 'PACT Sealed!',
        body: 'PACT Sealed! • Your Living Trip Manifest and verified transport contacts are ready.',
        targetTab: 'manifest',
        actionUrl: `/circle/${circleId}/hub`,
        privacyTag: 'Consensus Reached'
      };
    }

    const safetyNotifId = `safety-advisory-${circleId}`;
    const safetyNotif: Omit<PactNotification, 'id' | 'timestamp' | 'read'> = {
      type: 'ai',
      title: 'Gemini Advisory',
      body: `Gemini Advisory • Group travel hotline active for ${winningDestination} region (Dial 112 for local emergency).`,
      targetTab: 'manifest',
      privacyTag: 'Group Safety Active'
    };

    const existingPhase = currentList.find((n) => n.id === phaseNotifId);
    const existingSafety = currentList.find((n) => n.id === safetyNotifId);

    const isPhaseSame =
      existingPhase &&
      existingPhase.title === targetNotif.title &&
      existingPhase.body === targetNotif.body &&
      existingPhase.targetTab === targetNotif.targetTab;

    const isSafetySame =
      existingSafety &&
      existingSafety.title === safetyNotif.title &&
      existingSafety.body === safetyNotif.body &&
      existingSafety.targetTab === safetyNotif.targetTab;

    if (isPhaseSame && isSafetySame) {
      return; // No-op: state already in sync, eliminates redundant re-render cascades
    }

    const updated = [...currentList];

    // Upsert phase notification
    const existingPhaseIdx = updated.findIndex((n) => n.id === phaseNotifId);
    if (existingPhaseIdx >= 0) {
      updated[existingPhaseIdx] = {
        ...updated[existingPhaseIdx],
        ...targetNotif
      };
    } else {
      updated.unshift({
        ...targetNotif,
        id: phaseNotifId,
        timestamp: 'Just now',
        read: false
      });
    }

    // Upsert safety advisory notification
    const existingSafetyIdx = updated.findIndex((n) => n.id === safetyNotifId);
    if (existingSafetyIdx >= 0) {
      updated[existingSafetyIdx] = {
        ...updated[existingSafetyIdx],
        ...safetyNotif
      };
    } else {
      updated.push({
        ...safetyNotif,
        id: safetyNotifId,
        timestamp: 'Active',
        read: false
      });
    }

    set({ notifications: updated });
  },

  addLifecycleNotification: (stage, deadlineDate = 'Oct 20') => {
    let title = '';
    let body = '';
    let type: PactNotification['type'] = 'consensus';
    let privacyTag = 'Lifecycle Alert';

    if (stage === 'pre-voting') {
      title = 'Consensus Round Open';
      body = 'Consensus round is open. Lock in your sealed ballot before ' + deadlineDate + '.';
      type = 'consensus';
      privacyTag = 'Sealed Voting Active';
    } else if (stage === 'post-consensus') {
      title = 'Supermajority Reached';
      body = 'Supermajority reached. Time to finalize tickets and accommodations.';
      type = 'consensus';
      privacyTag = 'Supermajority Locked';
    } else if (stage === 'departure') {
      title = 'Departure Milestone';
      body = 'Trip starts today. Open your PACT Boarding Pass.';
      type = 'circle';
      privacyTag = 'Boarding Pass Active';
    }

    if (title && body) {
      get().addNotification({ type, title, body, privacyTag });
    }
  },

  addPreTripNotification: (circleName, deadlineDate = '15th of next month') => {
    get().addNotification({
      type: 'ai',
      title: `Booking Reminder: ${circleName}`,
      body: `You are scheduled for ${circleName}! AI Insight: Book tickets before ${deadlineDate} to finalize places with friends or family.`,
      privacyTag: 'Pre-Trip Planning'
    });
  },

  addDepartureNotification: (circleName) => {
    get().addNotification({
      type: 'circle',
      title: `Departure Day: ${circleName}`,
      body: `Today is the day! Head out as per plan. We'll track your daily budget and suggest nearby sights!`,
      privacyTag: 'Departure Active'
    });
  },

  simulateAINotification: (customBody?: string) => {
    const aiTips = [
      'AI: Found alternative flight package saving 18%.',
      'AI: Destination compromise meets all 5 members preferences.',
      'AI: Overlap confidence reached 94% across dates.',
      'AI: Single-room preference resolved with 2-villa cluster.'
    ];
    const body = customBody || aiTips[Math.floor(Math.random() * aiTips.length)];
    get().addNotification({ type: 'ai', title: 'AI Advisor', body, privacyTag: 'Zero constraints disclosed' });
  },

  simulateNudgeNotification: (fromName = 'Maya') => {
    get().addNotification({ type: 'nudge', title: 'Circle Alert', body: fromName + ' locked preferences. Consensus updated.', privacyTag: 'Protected vote' });
  },

  markAsDismissed: (id) => {
    set((state) => {
      const newDismissedIds = [...state.dismissedIds, id];
      AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(newDismissedIds)).catch(() => {});
      return { dismissedIds: newDismissedIds, notifications: state.notifications.filter((n) => n.id !== id) };
    });
  },

  regenerateFromCircles: (circles) => {
    const { dismissedIds } = get();
    const newNotifications: PactNotification[] = [];
    circles.forEach((circle) => {
      if (circle.archived) return;
      const notifId = 'circle-' + circle.id;
      if (dismissedIds.includes(notifId)) return;
      if (circle.status === 'voting') {
        newNotifications.push({ id: notifId, type: 'consensus', title: 'Consensus Round Open', body: 'Seal your ballot before deadline.', timestamp: 'Just now', read: false, privacyTag: 'Sealed Voting', actionUrl: '/circle/' + circle.id + '/preferences' });
      } else if (circle.status === 'finalized') {
        newNotifications.push({ id: notifId, type: 'consensus', title: 'PACT Sealed', body: 'Consensus reached. View boarding pass.', timestamp: 'Just now', read: false, privacyTag: '100% Locked', actionUrl: '/circle/' + circle.id + '/brief' });
      }
    });
    set({ notifications: newNotifications });
  },

  loadDismissedIds: async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        set({ dismissedIds: ids });
      }
    } catch (e) {
      console.warn('Failed to load dismissed IDs:', e);
    }
  }
}));