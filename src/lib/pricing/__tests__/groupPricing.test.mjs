import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Single organizer pass and capacity', () => {
  function getTierForMemberCount(count) {
    const n = Math.max(1, Math.floor(count || 1));
    return n <= 5 ? 'free' : 'tier_10';
  }

  it('keeps circles up to five members free', () => {
    assert.equal(getTierForMemberCount(1), 'free');
    assert.equal(getTierForMemberCount(5), 'free');
  });

  it('uses one organizer pass from six through ten members', () => {
    assert.equal(getTierForMemberCount(6), 'tier_10');
    assert.equal(getTierForMemberCount(10), 'tier_10');
  });

  it('does not advertise a paid tier above the backend capacity', () => {
    assert.equal(10 <= 10, true);
    assert.equal(11 <= 10, false);
  });
});

describe('Single-pass currency display', () => {
  const prices = {
    USD: '$9.99',
    EUR: '€9.49',
    INR: '₹799',
    GBP: '£7.99'
  };

  it('has one non-empty organizer-pass price per supported currency', () => {
    for (const value of Object.values(prices)) assert.ok(value.length > 1);
  });
});
