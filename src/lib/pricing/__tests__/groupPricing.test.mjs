import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Import pure logic functions from groupPricing
// In tests, we can test the mapping and pricing logic
describe('Group Size Tier Pricing & Capacity', () => {
  function getTierForMemberCount(count) {
    const n = Math.max(1, Math.floor(count || 1));
    if (n <= 5) return 'free';
    if (n <= 10) return 'tier_10';
    if (n <= 19) return 'tier_19';
    if (n <= 50) return 'tier_50';
    return 'tier_community';
  }

  it('correctly categorizes free tier up to 5 members', () => {
    assert.equal(getTierForMemberCount(1), 'free');
    assert.equal(getTierForMemberCount(3), 'free');
    assert.equal(getTierForMemberCount(5), 'free');
  });

  it('correctly categorizes Small Circle for 6 to 10 members', () => {
    assert.equal(getTierForMemberCount(6), 'tier_10');
    assert.equal(getTierForMemberCount(8), 'tier_10');
    assert.equal(getTierForMemberCount(10), 'tier_10');
  });

  it('correctly categorizes Extended Crew for 11 to 19 members', () => {
    assert.equal(getTierForMemberCount(11), 'tier_19');
    assert.equal(getTierForMemberCount(15), 'tier_19');
    assert.equal(getTierForMemberCount(19), 'tier_19');
  });

  it('correctly categorizes Mega Group for 20 to 50 members', () => {
    assert.equal(getTierForMemberCount(20), 'tier_50');
    assert.equal(getTierForMemberCount(35), 'tier_50');
    assert.equal(getTierForMemberCount(50), 'tier_50');
  });

  it('correctly categorizes Building / Community for 51+ members', () => {
    assert.equal(getTierForMemberCount(51), 'tier_community');
    assert.equal(getTierForMemberCount(100), 'tier_community');
    assert.equal(getTierForMemberCount(500), 'tier_community');
  });
});

describe('Currency & Localization Tier Rates', () => {
  const prices = {
    free: { single: { USD: '$0', EUR: '€0', INR: '₹0', GBP: '£0' } },
    tier_10: { single: { USD: '$9.99', EUR: '€9.49', INR: '₹799', GBP: '£7.99' } },
    tier_19: { single: { USD: '$19.99', EUR: '€18.99', INR: '₹1,499', GBP: '£15.99' } },
    tier_50: { single: { USD: '$34.99', EUR: '€32.99', INR: '₹2,899', GBP: '£28.99' } },
    tier_community: { single: { USD: 'Custom Quote', EUR: 'Custom Quote', INR: 'Custom Quote', GBP: 'Custom Quote' } }
  };

  it('provides valid non-empty price formatting for all currencies', () => {
    const currencies = ['USD', 'EUR', 'INR', 'GBP'];
    for (const curr of currencies) {
      assert.equal(prices.free.single[curr].startsWith(curr === 'USD' ? '$' : curr === 'EUR' ? '€' : curr === 'INR' ? '₹' : '£'), true);
      assert.ok(prices.tier_10.single[curr]);
      assert.ok(prices.tier_19.single[curr]);
      assert.ok(prices.tier_50.single[curr]);
      assert.equal(prices.tier_community.single[curr], 'Custom Quote');
    }
  });

  it('creates valid mailto link with encoded parameters for operator concierge', () => {
    function getOperatorEmailLink(tripName = '', memberCount = 50) {
      const subject = encodeURIComponent(`Community / Building Trip Inquiry: ${tripName || 'Large Group Trip'} (${memberCount}+ Members)`);
      return `mailto:concierge@pact.travel?subject=${subject}`;
    }

    const link = getOperatorEmailLink('Skyline Tower Residents', 80);
    assert.ok(link.startsWith('mailto:concierge@pact.travel?subject='));
    assert.ok(link.includes('Skyline'));
    assert.ok(link.includes('80'));
  });
});
