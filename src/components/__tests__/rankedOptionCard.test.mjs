// Property 2: Ticket Card Stub Color is Threshold-Gated
// Tests: Requirements 4.4, 4.5

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Replicate the color selection logic from RankedOptionCard
const SUCCESS_COLOR = '#4B7A51';   // colors.light.success
const PRIMARY_COLOR = '#A97C3D';   // colors.light.primary

function getStubColor(consensusPercent) {
  return consensusPercent >= 70 ? SUCCESS_COLOR : PRIMARY_COLOR;
}

describe('Property 2: Ticket Card stub color threshold', () => {
  it('uses success color at exactly 70%', () => {
    assert.equal(getStubColor(70), SUCCESS_COLOR);
  });

  it('uses success color above 70%', () => {
    for (const pct of [71, 80, 90, 95, 100]) {
      assert.equal(getStubColor(pct), SUCCESS_COLOR, `Failed at ${pct}%`);
    }
  });

  it('uses primary color below 70%', () => {
    for (const pct of [0, 1, 30, 50, 69]) {
      assert.equal(getStubColor(pct), PRIMARY_COLOR, `Failed at ${pct}%`);
    }
  });

  it('covers full range [0,100] with correct split at 70', () => {
    for (let pct = 0; pct <= 100; pct++) {
      const color = getStubColor(pct);
      if (pct >= 70) {
        assert.equal(color, SUCCESS_COLOR, `pct=${pct} should be success`);
      } else {
        assert.equal(color, PRIMARY_COLOR, `pct=${pct} should be primary`);
      }
    }
  });
});
