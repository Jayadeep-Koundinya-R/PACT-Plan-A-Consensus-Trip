import { create } from 'zustand';
import { validateNotificationPrivacy } from '../lib/notifications/pactNotifications';

export interface PactNotification {
  id: string;
  type: 'ai' | 'circle' | 'nudge' | 'consensus';
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  privacyTag?: string;
}

interface NotificationState {
  notifications: PactNotification[];
  activeToast: PactNotification | null;
  isOpen: boolean;

  openNotificationCenter: () => void;
  closeNotificationCenter: () => void;
  addNotification: (notification: Omit<PactNotification, 'id' | 'timestamp' | 'read'>) => boolean;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  dismissToast: () => void;
  simulateAINotification: (customBody?: string) => void;
  simulateNudgeNotification: (fromName?: string) => void;
}

const INITIAL_NOTIFICATIONS: PactNotification[] = [
  {
    id: 'notif-1',
    type: 'ai',
    title: 'AI Compromise Advisor',
    body: 'Date compromise identified: Moving departure to Friday Oct 16 resolves 100% of member conflicts with zero budget penalties.',
    timestamp: '2m ago',
    read: false,
    privacyTag: 'Zero personal constraints disclosed'
  },
  {
    id: 'notif-2',
    type: 'consensus',
    title: 'Consensus Threshold Unlocked',
    body: '3 of 5 members locked in! Consensus algorithms active for Goa Beach Escape.',
    timestamp: '15m ago',
    read: false,
    privacyTag: 'Consensus score: 85%'
  },
  {
    id: 'notif-3',
    type: 'ai',
    title: 'AI Budget Advisor',
    body: 'Group budget sweet-spot identified around target villa accommodation without disclosing individual caps.',
    timestamp: '1h ago',
    read: true,
    privacyTag: 'Sealed budget privacy active'
  },
  {
    id: 'notif-4',
    type: 'nudge',
    title: 'Circle Progress Update',
    body: 'Alex and Sam locked in their inputs. 1 more response needed to reveal leading destination.',
    timestamp: '3h ago',
    read: true,
    privacyTag: 'Private circle nudge'
  }
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  activeToast: null,
  isOpen: false,

  openNotificationCenter: () => set({ isOpen: true }),
  closeNotificationCenter: () => set({ isOpen: false }),

  addNotification: (item) => {
    // Validate strict privacy rule
    const validation = validateNotificationPrivacy(item.title, item.body);
    if (!validation.valid) {
      console.warn('Notification rejected by privacy guard:', validation.reason);
      return false;
    }

    const newNotif: PactNotification = {
      ...item,
      id: 'notif-' + Date.now(),
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

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true }))
    })),

  clearNotifications: () => set({ notifications: [] }),

  dismissToast: () => set({ activeToast: null }),

  simulateAINotification: (customBody?: string) => {
    const aiTips = [
      'AI Compromise Whisperer: Found alternative flight package saving group 18% without shifting weekend dates.',
      'AI Budget Advisor: Destination compromise for South Goa Villa meets all 5 members preferred categories.',
      'AI Consensus Engine: Overlap confidence reached 94% across dates Oct 14 - 19.',
      'AI Advisor: Single-room accommodation preference resolved with 2-villa cluster layout.'
    ];
    const body = customBody || aiTips[Math.floor(Math.random() * aiTips.length)];

    get().addNotification({
      type: 'ai',
      title: 'AI Advisor Insight',
      body,
      privacyTag: 'Zero private constraints disclosed'
    });
  },

  simulateNudgeNotification: (fromName = 'Maya') => {
    get().addNotification({
      type: 'nudge',
      title: 'Circle Response Alert',
      body: `${fromName} just locked in their trip preferences! Group consensus score updated.`,
      privacyTag: 'Encrypted vote tally'
    });
  }
}));
