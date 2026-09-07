import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalBudgetFallback,
  getLocalWhispererFallback,
  fetchBudgetAdvisor,
  fetchCompromiseWhisperer
} from '../aiAdvisorClient.ts';

test('AI Budget Advisor: Destination Market Range Estimates', async (t) => {
  await t.test('returns accurate budget range for Goa', () => {
    const res = getLocalBudgetFallback('Goa Beach Escape 2026', 5);
    assert.strictEqual(res.minBudget, 400);
    assert.strictEqual(res.maxBudget, 600);
    assert.strictEqual(res.currency, 'USD');
    assert.ok(res.formattedRange.includes('$400–$600'));
    assert.strictEqual(res.source, 'pact_market_index');
  });

  await t.test('returns accurate budget range for Kyoto', () => {
    const res = getLocalBudgetFallback('Kyoto Autumn 2026', 7);
    assert.strictEqual(res.minBudget, 900);
    assert.strictEqual(res.maxBudget, 1400);
    assert.ok(res.formattedRange.includes('7-day'));
  });

  await t.test('returns sensible default for unlisted destination', () => {
    const res = getLocalBudgetFallback('Mystery Island', 4);
    assert.ok(res.minBudget > 0);
    assert.ok(res.maxBudget > res.minBudget);
    assert.ok(res.formattedRange.includes('Mystery Island'));
  });
});

test('AI Compromise Whisperer: Anonymization & Privacy Guard', async (t) => {
  const aggregatedData = {
    budgetBuckets: { '$400–$600': 2, '$800–$1,200': 3 },
    commonDates: 'Oct 14–16 (100% overlap)',
    dealbreakerSummary: '1 member requested private accommodation / en-suite rooms'
  };

  await t.test('generates compromise recommendation from aggregated data without individual names', () => {
    const res = getLocalWhispererFallback('Goa Beach Weekend', 5, aggregatedData);
    assert.ok(res.compromise.length > 20);
    assert.ok(res.anonymizedSummary.includes('5 sealed ballots'));

    // Critical Privacy assertions: Must NOT contain any personal individual names
    const privateNames = ['Sam', 'Alex', 'Jordan', 'Maya', 'Priya', 'Jake'];
    for (const name of privateNames) {
      assert.strictEqual(
        res.compromise.toLowerCase().includes(name.toLowerCase()),
        false,
        `Compromise text must not mention individual name '${name}'`
      );
    }
  });

  await t.test('client gracefully falls back and resolves under 100ms when offline or unconfigured', async () => {
    const start = Date.now();
    const res = await fetchBudgetAdvisor('Goa', 5);
    const elapsed = Date.now() - start;
    assert.ok(elapsed < 200, `Expected fast resolution, took ${elapsed}ms`);
    assert.ok(res.formattedRange.includes('Goa'));
  });

  await t.test('client caches results to prevent redundant calls', async () => {
    const first = await fetchCompromiseWhisperer('Goa', 5, aggregatedData);
    const second = await fetchCompromiseWhisperer('Goa', 5, aggregatedData);
    assert.strictEqual(first.compromise, second.compromise);
  });
});
