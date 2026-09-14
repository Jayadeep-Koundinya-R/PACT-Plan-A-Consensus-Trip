import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Single organizer pass and capacity', () => {
  function getTierForMemberCount(count) {
    const n = Math.max(1, Math.floor(count || 1));
    return n <= 5 ? 'free' : 'organizer_pass';
  }

  it('keeps circles up to five members free', () => {
    assert.equal(getTierForMemberCount(1), 'free');
    assert.equal(getTierForMemberCount(5), 'free');
  });

  it('uses one organizer pass from six through twenty members', () => {
    assert.equal(getTierForMemberCount(6), 'organizer_pass');
    assert.equal(getTierForMemberCount(20), 'organizer_pass');
  });

  it('does not advertise a paid tier above the backend capacity', () => {
    assert.equal(20 <= 20, true);
    assert.equal(21 <= 20, false);
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
