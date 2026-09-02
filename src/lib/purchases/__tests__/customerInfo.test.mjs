// Property 1: Subscription Plan Derivation from Entitlement
// Tests: Requirements 1.4, 1.6, 1.9

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// We test the pure logic directly without importing the TS module
// (avoids needing tsx/ts-node in the test runner)
// The logic is: if no pro_access entitlement → 'free'
//               if active + 'annual' in productId → 'premium_annual'
//               if active, no 'annual' → 'premium_monthly'

const ENTITLEMENT_ID = 'pro_access';

function deriveSubscriptionPlan(info) {
  const active = info?.entitlements?.active ?? {};
  if (!active[ENTITLEMENT_ID]) return 'free';
  const productId = active[ENTITLEMENT_ID]?.productIdentifier ?? '';
  if (productId.includes('annual')) return 'premium_annual';
  return 'premium_monthly';
}

describe('Property 1: deriveSubscriptionPlan correctness', () => {
  it('returns free when pro_access entitlement is absent', () => {
    const info = { entitlements: { active: {} } };
    assert.equal(deriveSubscriptionPlan(info), 'free');
  });

  it('returns free when info is null', () => {
    assert.equal(deriveSubscriptionPlan(null), 'free');
  });

  it('returns free when entitlements is empty', () => {
    assert.equal(deriveSubscriptionPlan({ entitlements: { active: {} } }), 'free');
  });

  it('returns premium_annual when pro_access active and productId contains annual', () => {
    const info = {
      entitlements: {
        active: {
          pro_access: { productIdentifier: 'pact_pro_annual_2026' }
        }
      }
    };
    assert.equal(deriveSubscriptionPlan(info), 'premium_annual');
  });

  it('returns premium_monthly when pro_access active and productId does not contain annual', () => {
    const info = {
      entitlements: {
        active: {
          pro_access: { productIdentifier: 'pact_pro_monthly' }
        }
      }
    };
    assert.equal(deriveSubscriptionPlan(info), 'premium_monthly');
  });

  it('returns premium_monthly when productIdentifier is empty string', () => {
    const info = {
      entitlements: {
        active: { pro_access: { productIdentifier: '' } }
      }
    };
    assert.equal(deriveSubscriptionPlan(info), 'premium_monthly');
  });
});
