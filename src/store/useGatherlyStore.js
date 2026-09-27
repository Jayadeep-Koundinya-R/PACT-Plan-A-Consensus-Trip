import { create } from 'zustand';

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
};

export const useGatherlyStore = create((set, get) => ({
  currency: 'USD',
  currencySymbol: '$',
  groups: [],
  setCurrency: (currency) => {
    const config = CURRENCIES[currency] || CURRENCIES.USD;
    set({ currency, currencySymbol: config.symbol });
  },
  formatCurrency: (amountInUSD, currencyCodeOverride) => {
    const state = get();
    const targetCode = currencyCodeOverride || state.currency;
    const config = CURRENCIES[targetCode] || CURRENCIES.USD;
    const converted = Math.round(amountInUSD * config.rate);
    if (targetCode === 'INR') {
      return `₹${converted.toLocaleString('en-IN')}`;
    }
    return `${config.symbol}${converted.toLocaleString()}`;
  },
  createGroup: async (name) => {
    const rawName = typeof name === 'object' && name !== null ? name.name : name;
    const cleanName = (typeof rawName === 'string' ? rawName.trim() : '') || 'New Trip Circle';
    const totalCount = (typeof name === 'object' && name !== null && name.totalMembersCount) ? Number(name.totalMembersCount) : 5;
    const currencyCode = (typeof name === 'object' && name !== null && name.currencyCode) ? name.currencyCode : get().currency;
    const groupType = (typeof name === 'object' && name !== null && name.groupType) ? name.groupType : 'College Friends';

    if (currencyCode) {
      get().setCurrency(currencyCode);
    }

    const newGroup = {
      id: `group-${Date.now()}`,
      name: cleanName,
      inviteCode: 'TEST-CODE',
      organizerId: 'user-1',
      status: 'collecting',
      totalMembersCount: totalCount,
      currencyCode,
      groupType
    };

    set((state) => ({
      groups: [newGroup, ...state.groups]
    }));

    return newGroup;
  },
  pastTrips: [
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
  ],
  toggleAnniversaryReminder: (tripId) => {
    set((state) => ({
      pastTrips: state.pastTrips.map((pt) =>
        pt.id === tripId ? { ...pt, anniversaryReminder: !pt.anniversaryReminder } : pt
      )
    }));
  }
}));
