import {
  calculateDateScore,
  calculateBudgetScore,
  calculateTagScore,
  checkDealbreakers,
  calculateConsensus
} from '../engine';
import { DEMO_MEMBERS, DEMO_TRIP_OPTIONS, DEMO_GROUP_ID } from '../seedData';

describe('Consensus Engine', () => {
  it('calculates date overlap properly', () => {
    const mayaDate = calculateDateScore(DEMO_MEMBERS[0].dateRanges, '2026-07-12', '2026-07-15');
    expect(mayaDate.score).toBe(1.0);
    expect(mayaDate.overlapDays).toBe(4);
  });

  it('calculates budget fit properly', () => {
    expect(calculateBudgetScore(400, 900, 650)).toBe(1.0);
    expect(calculateBudgetScore(1000, 2500, 650)).toBe(0.65);
    expect(calculateBudgetScore(300, 700, 1200)).toBe(0.0);
  });

  it('ranks Goa Beach Weekend as #1 winner for demo scenario', () => {
    const result = calculateConsensus(DEMO_GROUP_ID, 5, DEMO_TRIP_OPTIONS, DEMO_MEMBERS);
    expect(result.consensusReached).toBe(true);
    expect(result.rankedOptions[0].option.name).toBe('Goa Beach Weekend');
    expect(result.rankedOptions[0].consensusPercent).toBe(100);
  });
});
