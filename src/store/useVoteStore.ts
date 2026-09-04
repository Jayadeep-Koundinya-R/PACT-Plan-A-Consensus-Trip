/**
 * useVoteStore — private constraints, locked votes, silent ballots
 *
 * Manages the voting lifecycle: constraint drafts, submitted preferences,
 * silent ballot state (approve/reject per option), ranked choice order,
 * and final lock status.
 */
import { create } from 'zustand';

export interface DateWindow {
  label: string;
  start: string;
  end: string;
  active: boolean;
}

export type BudgetBand = 'under500' | '500to1000' | 'over1000' | 'custom';

export interface ConstraintDraft {
  dateWindows: DateWindow[];
  budgetBand: BudgetBand;
  budgetCustom: number;
  showFineTune: boolean;
  vibes: Record<string, boolean>;
  dealbreakers: Record<string, boolean>;
}

export type BallotDecision = 'approve' | 'reject' | null;

export interface BallotEntry {
  optionId: string;
  decision: BallotDecision;
  rank: number | null;
}

interface VoteState {
  // Constraint drafts per circle: key = circleId
  drafts: Record<string, ConstraintDraft>;
  submittedCircleIds: string[];

  // Silent ballot state per circle
  ballots: Record<string, BallotEntry[]>;
  lockedBallotCircleIds: string[];

  // Constraint draft actions
  getDraft: (circleId: string) => ConstraintDraft;
  updateDraft: (circleId: string, partial: Partial<ConstraintDraft>) => void;
  toggleDateWindow: (circleId: string, index: number) => void;
  addDateWindow: (circleId: string, window: DateWindow) => void;
  setBudgetBand: (circleId: string, band: BudgetBand) => void;
  setBudgetCustom: (circleId: string, amount: number) => void;
  toggleFineTune: (circleId: string) => void;
  toggleVibe: (circleId: string, key: string) => void;
  toggleDealbreaker: (circleId: string, key: string) => void;
  markSubmitted: (circleId: string) => void;
  isSubmitted: (circleId: string) => boolean;

  // Ballot actions
  setBallotDecision: (circleId: string, optionId: string, decision: BallotDecision) => void;
  setBallotRank: (circleId: string, optionId: string, rank: number | null) => void;
  lockBallot: (circleId: string) => void;
  isBallotLocked: (circleId: string) => boolean;
  getBallotEntries: (circleId: string) => BallotEntry[];
}

const DEFAULT_DRAFT: ConstraintDraft = {
  dateWindows: [
    { label: 'Oct 12 – Oct 18', start: '2026-10-12', end: '2026-10-18', active: true },
    { label: 'Nov 02 – Nov 08', start: '2026-11-02', end: '2026-11-08', active: false }
  ],
  budgetBand: 'under500',
  budgetCustom: 800,
  showFineTune: false,
  vibes: {
    'Beach & Coast': true,
    'Nightlife': false,
    'Mountain Trek': false,
    'Food & Dining': true,
    'Relaxing Spa': false
  },
  dealbreakers: {
    'No dorm hostels': true,
    'Flight time > 5 hrs': true,
    'Shared bathrooms': true
  }
};

/** Maps budget band to a numeric max for the consensus engine */
export function bandToMax(band: BudgetBand, custom: number): number {
  switch (band) {
    case 'under500': return 500;
    case '500to1000': return 1000;
    case 'over1000': return 3000;
    case 'custom': return custom;
  }
}

/** Maps budget band to a numeric min for the consensus engine */
export function bandToMin(band: BudgetBand, custom: number): number {
  switch (band) {
    case 'under500': return 200;
    case '500to1000': return 500;
    case 'over1000': return 1000;
    case 'custom': return Math.max(200, custom - 400);
  }
}

export const useVoteStore = create<VoteState>((set, get) => ({
  drafts: {},
  submittedCircleIds: [],
  ballots: {},
  lockedBallotCircleIds: [],

  getDraft: (circleId) => {
    return get().drafts[circleId] || { ...DEFAULT_DRAFT };
  },

  updateDraft: (circleId, partial) =>
    set((s) => ({
      drafts: {
        ...s.drafts,
        [circleId]: { ...(s.drafts[circleId] || { ...DEFAULT_DRAFT }), ...partial }
      }
    })),

  toggleDateWindow: (circleId, index) =>
    set((s) => {
      const draft = s.drafts[circleId] || { ...DEFAULT_DRAFT };
      const windows = [...draft.dateWindows];
      if (windows[index]) {
        windows[index] = { ...windows[index], active: !windows[index].active };
      }
      return {
        drafts: { ...s.drafts, [circleId]: { ...draft, dateWindows: windows } }
      };
    }),

  addDateWindow: (circleId, window) =>
    set((s) => {
      const draft = s.drafts[circleId] || { ...DEFAULT_DRAFT };
      return {
        drafts: {
          ...s.drafts,
          [circleId]: { ...draft, dateWindows: [...draft.dateWindows, window] }
        }
      };
    }),

  setBudgetBand: (circleId, band) =>
    set((s) => {
      const draft = s.drafts[circleId] || { ...DEFAULT_DRAFT };
      return {
        drafts: { ...s.drafts, [circleId]: { ...draft, budgetBand: band, showFineTune: false } }
      };
    }),

  setBudgetCustom: (circleId, amount) =>
    set((s) => {
      const draft = s.drafts[circleId] || { ...DEFAULT_DRAFT };
      return {
        drafts: {
          ...s.drafts,
          [circleId]: { ...draft, budgetCustom: Math.max(200, Math.min(3000, amount)), budgetBand: 'custom' }
        }
      };
    }),

  toggleFineTune: (circleId) =>
    set((s) => {
      const draft = s.drafts[circleId] || { ...DEFAULT_DRAFT };
      return {
        drafts: {
          ...s.drafts,
          [circleId]: { ...draft, showFineTune: !draft.showFineTune, budgetBand: 'custom' }
        }
      };
    }),

  toggleVibe: (circleId, key) =>
    set((s) => {
      const draft = s.drafts[circleId] || { ...DEFAULT_DRAFT };
      return {
        drafts: {
          ...s.drafts,
          [circleId]: {
            ...draft,
            vibes: { ...draft.vibes, [key]: !draft.vibes[key] }
          }
        }
      };
    }),

  toggleDealbreaker: (circleId, key) =>
    set((s) => {
      const draft = s.drafts[circleId] || { ...DEFAULT_DRAFT };
      return {
        drafts: {
          ...s.drafts,
          [circleId]: {
            ...draft,
            dealbreakers: { ...draft.dealbreakers, [key]: !draft.dealbreakers[key] }
          }
        }
      };
    }),

  markSubmitted: (circleId) =>
    set((s) => ({
      submittedCircleIds: Array.from(new Set([...s.submittedCircleIds, circleId]))
    })),

  isSubmitted: (circleId) => get().submittedCircleIds.includes(circleId),

  setBallotDecision: (circleId, optionId, decision) =>
    set((s) => {
      const entries = [...(s.ballots[circleId] || [])];
      const idx = entries.findIndex((e) => e.optionId === optionId);
      if (idx >= 0) {
        entries[idx] = { ...entries[idx], decision };
      } else {
        entries.push({ optionId, decision, rank: null });
      }
      return { ballots: { ...s.ballots, [circleId]: entries } };
    }),

  setBallotRank: (circleId, optionId, rank) =>
    set((s) => {
      const entries = [...(s.ballots[circleId] || [])];
      const idx = entries.findIndex((e) => e.optionId === optionId);
      if (idx >= 0) {
        entries[idx] = { ...entries[idx], rank };
      } else {
        entries.push({ optionId, decision: null, rank });
      }
      return { ballots: { ...s.ballots, [circleId]: entries } };
    }),

  lockBallot: (circleId) =>
    set((s) => ({
      lockedBallotCircleIds: Array.from(new Set([...s.lockedBallotCircleIds, circleId]))
    })),

  isBallotLocked: (circleId) => get().lockedBallotCircleIds.includes(circleId),

  getBallotEntries: (circleId) => get().ballots[circleId] || []
}));