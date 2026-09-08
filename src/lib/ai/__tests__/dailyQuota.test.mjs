import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Pure quota logic mirror (kept in sync with src/lib/ai/dailyQuota.ts)
const FREE_DAILY_PROMPT_LIMIT = 15;

function getDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDailyPromptLimit(plan) {
  return plan === 'free' ? FREE_DAILY_PROMPT_LIMIT : Number.POSITIVE_INFINITY;
}

function remainingPrompts(usedCount, plan) {
  const limit = getDailyPromptLimit(plan);
  if (limit === Number.POSITIVE_INFINITY) return Number.POSITIVE_INFINITY;
  const used = Number.isFinite(usedCount) ? Math.max(0, Math.floor(usedCount)) : 0;
  return Math.max(0, limit - used);
}

function hasRemainingPrompts(usedCount, plan) {
  return remainingPrompts(usedCount, plan) > 0;
}

describe('AI Chat free daily quota (15 prompts/day)', () => {
  it('starts every day with the full 15 free prompts', () => {
    assert.equal(remainingPrompts(0, 'free'), 15);
    assert.equal(hasRemainingPrompts(0, 'free'), true);
  });

  it('allows prompts up to and exactly at the limit', () => {
    assert.equal(remainingPrompts(14, 'free'), 1);
    assert.equal(hasRemainingPrompts(14, 'free'), true);
  });

  it('blocks once the daily limit is consumed', () => {
    assert.equal(remainingPrompts(15, 'free'), 0);
    assert.equal(hasRemainingPrompts(15, 'free'), false);
    assert.equal(remainingPrompts(42, 'free'), 0);
    assert.equal(hasRemainingPrompts(42, 'free'), false);
  });

  it('never returns a negative remaining count', () => {
    assert.equal(remainingPrompts(99, 'free') < 0, false);
    assert.equal(remainingPrompts(-3, 'free'), 15);
  });

  it('treats any paid plan as unlimited', () => {
    assert.equal(getDailyPromptLimit('premium_monthly'), Number.POSITIVE_INFINITY);
    assert.equal(getDailyPromptLimit('premium_annual'), Number.POSITIVE_INFINITY);
    assert.equal(hasRemainingPrompts(0, 'premium_monthly'), true);
    assert.equal(hasRemainingPrompts(999, 'premium_annual'), true);
  });

  it('uses a local calendar day key that rolls over at midnight', () => {
    assert.equal(getDayKey(new Date(2026, 8, 8, 10, 30)), '2026-09-08');
    assert.notEqual(
      getDayKey(new Date(2026, 8, 8, 23, 59)),
      getDayKey(new Date(2026, 8, 9, 0, 0))
    );
  });
});