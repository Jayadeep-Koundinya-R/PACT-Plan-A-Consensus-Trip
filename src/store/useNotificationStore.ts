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
  addLifecycleNotification: (stage: 'pre-voting' | 'post-consensus' | 'departure', deadlineDate?: string) => void;
  addPreTripNotification: (circleName: string, deadlineDate?: string) => void;
  addDepartureNotification: (circleName: string) => void;
  simulateAINotification: (customBody?: string) => void;
  simulateNudgeNotification: (fromName?: string) => void;
}

const INITIAL_NOTIFICATIONS: PactNotification[] = [];

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

  addLifecycleNotification: (stage, deadlineDate = 'Oct 20') => {
    let title = '';
    let body = '';
    let type: PactNotification['type'] = 'consensus';
    let privacyTag = 'Lifecycle Alert';

    if (stage === 'pre-voting') {
      title = 'Consensus Round Open';
      body = `Consensus round is open. Lock in your sealed ballot before ${deadlineDate}.`;
      type = 'consensus';
      privacyTag = 'Sealed Voting Active';
    } else if (stage === 'post-consensus') {
      title = 'Supermajority Reached';
      body = 'Supermajority reached! Time to finalize tickets and accommodations.';
      type = 'consensus';
      privacyTag = 'Supermajority Locked';
    } else if (stage === 'departure') {
      title = 'Departure Milestone';
      body = 'Trip starts today! Open your PACT Boarding Pass.';
      type = 'circle';
      privacyTag = 'Boarding Pass Active';
    }

    if (title && body) {
      get().addNotification({
        type,
        title,
        body,
        privacyTag
      });
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
      privacyTag: 'Protected vote tally'
    });
  }
}));
