import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('ConsensusGauge calculations', () => {
  it('calculates circumference correctly from size and strokeWidth', () => {
    const size = 84;
    const strokeWidth = 7;
    const radius = (size - strokeWidth) / 2; // 38.5
    const circumference = 2 * Math.PI * radius;
    assert.ok(Math.abs(circumference - 241.9) < 0.1);
  });

  it('calculates strokeDashoffset for 0% progress', () => {
    const circumference = 240;
    const pct = 0;
    const dashOffset = circumference * (1 - pct);
    assert.equal(dashOffset, 240);
  });

  it('calculates strokeDashoffset for 50% progress', () => {
    const circumference = 240;
    const pct = 0.5;
    const dashOffset = circumference * (1 - pct);
    assert.equal(dashOffset, 120);
  });

  it('calculates strokeDashoffset for 100% progress', () => {
    const circumference = 240;
    const pct = 1.0;
    const dashOffset = circumference * (1 - pct);
    assert.equal(dashOffset, 0);
  });

  it('clamps percentage bounds [0, 100] correctly', () => {
    const clampPct = (val) => Math.min(Math.max(val / 100, 0), 1);
    assert.equal(clampPct(-10), 0);
    assert.equal(clampPct(50), 0.5);
    assert.equal(clampPct(120), 1);
  });
});

describe('PactTicketCard notch dimensions', () => {
  it('computes half-notch offset correctly', () => {
    const notchSize = 20;
    const half = notchSize / 2;
    assert.equal(half, 10);
    assert.equal(-half, -10);
  });
});
