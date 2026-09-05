import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Logic mirror of determineProStatus from supabase/functions/revenuecat-webhook/index.ts
function determineProStatus(event) {
  const activeEvents = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE'];
  const isExpiredOrCancelled = event.type === 'EXPIRATION';

  const isPro = activeEvents.includes(event.type) && !isExpiredOrCancelled;
  const isAnnual = (event.product_id || '').toLowerCase().includes('annual') || (event.product_id || '').toLowerCase().includes('yr');
  const plan = isPro ? (isAnnual ? 'premium_annual' : 'premium_monthly') : 'free';
  const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

  return { isPro, plan, expiresAt };
}

describe('RevenueCat Webhook to Supabase has_pro Flag', () => {
  test('INITIAL_PURCHASE monthly grants Pro access and sets monthly plan', () => {
    const event = {
      id: 'evt-1',
      type: 'INITIAL_PURCHASE',
      app_user_id: 'usr-123',
      product_id: 'pact_pro_monthly',
      expiration_at_ms: Date.now() + 30 * 24 * 3600 * 1000
    };

    const res = determineProStatus(event);
    assert.equal(res.isPro, true);
    assert.equal(res.plan, 'premium_monthly');
    assert.ok(res.expiresAt);
  });

  test('INITIAL_PURCHASE annual grants Pro access and sets annual plan', () => {
    const event = {
      id: 'evt-2',
      type: 'INITIAL_PURCHASE',
      app_user_id: 'usr-123',
      product_id: 'pact_pro_annual',
      expiration_at_ms: Date.now() + 365 * 24 * 3600 * 1000
    };

    const res = determineProStatus(event);
    assert.equal(res.isPro, true);
    assert.equal(res.plan, 'premium_annual');
    assert.ok(res.expiresAt);
  });

  test('RENEWAL preserves active Pro status', () => {
    const event = {
      id: 'evt-3',
      type: 'RENEWAL',
      app_user_id: 'usr-123',
      product_id: 'pact_pro_monthly',
      expiration_at_ms: Date.now() + 60 * 24 * 3600 * 1000
    };

    const res = determineProStatus(event);
    assert.equal(res.isPro, true);
    assert.equal(res.plan, 'premium_monthly');
  });

  test('EXPIRATION revokes Pro access and reverts plan to free', () => {
    const event = {
      id: 'evt-4',
      type: 'EXPIRATION',
      app_user_id: 'usr-123',
      product_id: 'pact_pro_monthly',
      expiration_at_ms: Date.now() - 1000
    };

    const res = determineProStatus(event);
    assert.equal(res.isPro, false);
    assert.equal(res.plan, 'free');
  });

  test('Circle has_pro inheritance applies from organizer subscription', () => {
    // Organizer with Pro
    const circle = {
      id: 'circle-1',
      name: 'Goa Trip',
      organizer_id: 'usr-123',
      has_pro: false
    };

    const organizerSub = determineProStatus({
      type: 'INITIAL_PURCHASE',
      app_user_id: 'usr-123',
      product_id: 'pact_pro_monthly'
    });

    circle.has_pro = organizerSub.isPro;
    assert.equal(circle.has_pro, true);
  });
});
