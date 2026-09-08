/**
 * PACT AI Chat — free daily quota helpers (pure & unit-testable).
 *
 * Free plan: 15 AI prompts per local calendar day (reset automatically).
 * Pro plans: unlimited.
 */

export const FREE_DAILY_PROMPT_LIMIT = 15;

/** Any plan other than 'free' is treated as unlimited. */
export type QuotaPlan = 'free' | string;

export function getDayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyPromptLimit(plan: QuotaPlan = 'free'): number {
  return plan === 'free' ? FREE_DAILY_PROMPT_LIMIT : Number.POSITIVE_INFINITY;
}

/** Number of prompts still available today (never negative). Infinity = unlimited. */
export function remainingPrompts(usedCount: number, plan: QuotaPlan = 'free'): number {
  const limit = getDailyPromptLimit(plan);
  if (limit === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY;
  const used = Number.isFinite(usedCount) ? Math.max(0, Math.floor(usedCount)) : 0;
  return Math.max(0, limit - used);
}

export function hasRemainingPrompts(usedCount: number, plan: QuotaPlan = 'free'): boolean {
  return remainingPrompts(usedCount, plan) > 0;
}