import { create } from 'zustand';

const DEFAULT_PAST_TRIPS = [
  {
    id: 'past-1',
    name: 'Kyoto Machiya Getaway 2025',
    destinationName: 'Kyoto, Japan',
    dates: 'Nov 10 – Nov 15, 2025',
    memberCount: 4,
    finalizedAt: '2025-11-01T10:00:00.000Z',
    winningOptionName: 'Kyoto Central Machiya',
    inviteCode: 'KYOTO-2025',
    anniversaryReminder: true
  },
  {
    id: 'past-2',
    name: 'Swiss Alps Ski Weekend 2025',
    destinationName: 'Zermatt, Switzerland',
    dates: 'Jan 15 – Jan 20, 2025',
    memberCount: 5,
    finalizedAt: '2025-01-05T10:00:00.000Z',
    winningOptionName: 'Alpine Chalet Lodge',
    inviteCode: 'ALPS-2025',
    anniversaryReminder: false
  }
];

export const useGatherlyStore = create((set, get) => ({
  pastTrips: DEFAULT_PAST_TRIPS,
  toggleAnniversaryReminder: (tripId) => {
    set((state) => ({
      pastTrips: state.pastTrips.map((pt) =>
        pt.id === tripId ? { ...pt, anniversaryReminder: !pt.anniversaryReminder } : pt
      )
    }));
  }
}));
