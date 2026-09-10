import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyLivePriceFeasibility,
  clearPriceCache,
} from '../priceGuard.ts';

describe('Live Price & Flight Reality Guardrail', () => {
  beforeEach(() => {
    clearPriceCache();
  });

  it('marks destination as feasible when combined flight and stay are within budget ceiling', () => {
    // Regular season for Goa (e.g. March)
    const result = verifyLivePriceFeasibility('Goa', ['2026-03-12', '2026-03-15'], 500);

    assert.equal(result.isFeasible, true);
    assert.equal(result.surgeAlert, false);
    assert.equal(result.warningMessage, null);
    assert.ok(result.estimatedTotal <= 500);
  });

  it('detects holiday airfare surge and flags destination when exceeding budget ceiling', () => {
    // Peak December holiday in Goa (Month 11)
    const result = verifyLivePriceFeasibility('Goa', ['2026-12-24', '2026-12-28'], 350);

    assert.equal(result.surgeAlert, true);
    assert.equal(result.isFeasible, false);
    assert.ok(result.warningMessage?.includes('exceed'));
    assert.ok(result.suggestedAlternativeDates !== undefined);
  });

  it('guarantees zero budget leak in warning messages (no member names or individual limits)', () => {
    const result = verifyLivePriceFeasibility('Kyoto', ['2026-04-05'], 600);

    if (result.warningMessage) {
      assert.ok(!result.warningMessage.includes('Maya'));
      assert.ok(!result.warningMessage.includes('user'));
      assert.ok(!result.warningMessage.includes('lowest'));
    }
  });

  it('serves cached price results on repeated queries for identical parameters', () => {
    const res1 = verifyLivePriceFeasibility('Coorg', ['2026-10-10'], 400);
    const res2 = verifyLivePriceFeasibility('Coorg', ['2026-10-10'], 400);

    assert.deepEqual(res1, res2);
  });
});
