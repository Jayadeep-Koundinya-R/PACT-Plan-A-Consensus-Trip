import { MemberPreference, TripOption } from './types';

export const DEMO_GROUP_ID = 'circle-college-reunion-2026';

export const DEMO_MEMBERS: MemberPreference[] = [
  {
    userId: 'user-maya-001',
    userName: 'Maya',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    dateRanges: [
      { start: '2026-07-10', end: '2026-07-15' },
      { start: '2026-07-25', end: '2026-07-30' }
    ],
    budgetMin: 400,
    budgetMax: 900,
    tags: ['beach', 'relaxed'],
    dealbreakers: ['hiking', 'cold'],
    submittedAt: '2026-06-30T10:00:00.000Z'
  },
  {
    userId: 'user-jake-002',
    userName: 'Jake',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    dateRanges: [
      { start: '2026-07-12', end: '2026-07-20' },
      { start: '2026-08-01', end: '2026-08-10' }
    ],
    budgetMin: 1000,
    budgetMax: 2500,
    tags: ['active', 'beach', 'hiking'],
    dealbreakers: ['city'],
    submittedAt: '2026-06-30T10:15:00.000Z'
  },
  {
    userId: 'user-priya-003',
    userName: 'Priya',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    dateRanges: [
      { start: '2026-07-08', end: '2026-07-14' }
    ],
    budgetMin: 300,
    budgetMax: 700,
    tags: ['budget-conscious', 'relaxed', 'beach'],
    dealbreakers: ['expensive'],
    submittedAt: '2026-06-30T10:30:00.000Z'
  },
  {
    userId: 'user-alex-004',
    userName: 'Alex',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    dateRanges: [
      { start: '2026-07-10', end: '2026-07-25' }
    ],
    budgetMin: 800,
    budgetMax: 2000,
    tags: ['city', 'culture', 'active'],
    dealbreakers: ['isolated'],
    submittedAt: '2026-06-30T10:45:00.000Z'
  },
  {
    userId: 'user-sam-005',
    userName: 'Sam',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    dateRanges: [
      { start: '2026-07-15', end: '2026-07-28' },
      { start: '2026-08-05', end: '2026-08-15' }
    ],
    budgetMin: 600,
    budgetMax: 1500,
    tags: ['beach', 'active', 'budget-conscious'],
    dealbreakers: [],
    submittedAt: '2026-06-30T11:00:00.000Z'
  }
];

export const DEMO_TRIP_OPTIONS: TripOption[] = [
  {
    id: 'opt-goa-01',
    groupId: DEMO_GROUP_ID,
    name: 'Goa Beach Weekend',
    destinationType: 'Coastal Getaway',
    dateStart: '2026-07-12',
    dateEnd: '2026-07-15',
    budgetPerPerson: 650,
    tags: ['beach', 'relaxed', 'budget-conscious'],
    description: 'Sunsets, beachside shacks, relaxed vibes with budget-friendly stays.'
  },
  {
    id: 'opt-manali-02',
    groupId: DEMO_GROUP_ID,
    name: 'Manali Mountain Trek',
    destinationType: 'Alpine Adventure',
    dateStart: '2026-07-15',
    dateEnd: '2026-07-20',
    budgetPerPerson: 1200,
    tags: ['hiking', 'active', 'mountains', 'cold'],
    description: 'High altitude trail hiking and crisp mountain passes.'
  },
  {
    id: 'opt-bangalore-03',
    groupId: DEMO_GROUP_ID,
    name: 'Bangalore City Break',
    destinationType: 'Urban Culture',
    dateStart: '2026-07-10',
    dateEnd: '2026-07-14',
    budgetPerPerson: 800,
    tags: ['city', 'culture', 'active'],
    description: 'Craft breweries, live music, art galleries, and botanical gardens.'
  },
  {
    id: 'opt-kerala-04',
    groupId: DEMO_GROUP_ID,
    name: 'Kerala Backwaters Chill',
    destinationType: 'Nature & Houseboat',
    dateStart: '2026-07-18',
    dateEnd: '2026-07-24',
    budgetPerPerson: 1100,
    tags: ['beach', 'relaxed', 'budget-conscious'],
    description: 'Serene houseboat cruise through palm-fringed lagoons.'
  }
];
