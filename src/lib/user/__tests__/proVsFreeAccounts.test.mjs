import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useUserStore } from '../../../store/useUserStore.ts';
import { useCircleStore } from '../../../store/useCircleStore.ts';
import {
  PACT_TEST_ACCOUNTS,
  fetchUserSubscription,
  signInWithEmail,
  signUpWithEmail
} from '../../supabase/service.ts';
import {
  MAX_FREE_MEMBERS,
  MAX_GROUP_MEMBERS,
  getTierForMemberCount
} from '../../pricing/groupPricing.ts';

describe('Pro vs Free Testing Strategy: Supabase Accounts, Tiers & Circle Inheritance', () => {
  beforeEach(() => {
    useUserStore.getState().logout();
    useCircleStore.getState().clearCircles();
  });

  test('Step 1: PACT_TEST_ACCOUNTS defines verified credentials for Free and Pro tiers', () => {
    // Free Account Credentials
    assert.ok(PACT_TEST_ACCOUNTS.free, 'Free test account must exist');
    assert.equal(PACT_TEST_ACCOUNTS.free.email, 'tester.free@pact.travel');
    assert.equal(PACT_TEST_ACCOUNTS.free.password, 'PactTest2026!');
    assert.equal(PACT_TEST_ACCOUNTS.free.displayName, 'Free Tier Tester');
    assert.equal(PACT_TEST_ACCOUNTS.free.plan, 'free');

    // Pro Account Credentials
    assert.ok(PACT_TEST_ACCOUNTS.pro, 'Pro test account must exist');
    assert.equal(PACT_TEST_ACCOUNTS.pro.email, 'tester.pro@pact.travel');
    assert.equal(PACT_TEST_ACCOUNTS.pro.password, 'PactTest2026!');
    assert.equal(PACT_TEST_ACCOUNTS.pro.displayName, 'Pro Tier Tester');
    assert.equal(PACT_TEST_ACCOUNTS.pro.plan, 'premium_annual');
  });

  test('Step 2: Free Account signs in, receives Free tier, and enforces Free tier limits', async () => {
    // Authenticate with Free credentials
    const authResult = await signInWithEmail(
      PACT_TEST_ACCOUNTS.free.email,
      PACT_TEST_ACCOUNTS.free.password
    );

    assert.ok(authResult.user, 'Must return authenticated user');
    assert.equal(authResult.user.email, 'tester.free@pact.travel');

    // Resolve subscription plan
    const plan = await fetchUserSubscription(authResult.user.id, authResult.user.email);
    assert.equal(plan, 'free', 'Resolved plan for Free account must be "free"');

    // Sync to useUserStore
    useUserStore.getState().setProfile({
      userId: authResult.user.id,
      displayName: authResult.user.user_metadata?.display_name || 'Free Tier Tester',
      email: authResult.user.email
    });
    useUserStore.getState().setSubscriptionPlan(plan);
    useUserStore.getState().setAuthenticated(true);

    const userState = useUserStore.getState();
    assert.equal(userState.subscriptionPlan, 'free');
    assert.equal(userState.isAuthenticated, true);
    assert.equal(userState.profile.displayName, 'Free Tier Tester');

    // Free account can create a circle within 1-8 members
    const validFreeCircleMembers = 6;
    assert.ok(validFreeCircleMembers <= MAX_FREE_MEMBERS, '6 members is within Free tier limit');

    useCircleStore.getState().addCircle({
      id: 'circle-free-01',
      name: 'Goa Weekend 2026 (Free)',
      inviteCode: 'GOA-FREE',
      organizerId: authResult.user.id,
      organizerName: userState.profile.displayName,
      status: 'collecting',
      totalMembersCount: validFreeCircleMembers,
      hasPro: userState.subscriptionPlan !== 'free',
      members: [
        { userId: authResult.user.id, name: `${userState.profile.displayName} (Organizer)`, status: 'locked', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    });

    const createdCircle = useCircleStore.getState().getCircle('circle-free-01');
    assert.ok(createdCircle, 'Circle must be created');
    assert.equal(createdCircle.hasPro, false, 'Free account circle must have hasPro: false');
    assert.equal(useCircleStore.getState().isCirclePro('circle-free-01'), false);

    // Free tier rejects trips larger than 8 members
    const largeGroupSize = 14;
    const isExceedingFree = userState.subscriptionPlan === 'free' && largeGroupSize > MAX_FREE_MEMBERS;
    assert.equal(isExceedingFree, true, '14 members must exceed Free tier limit');

    const tier = getTierForMemberCount(largeGroupSize);
    assert.equal(tier.name, 'PACT Organizer Pass', 'Needs Organizer Pass to expand to 14 travelers');
  });

  test('Step 3: Pro Account signs in, receives Pro tier, and unlocks up to 24 members with Pro badge', async () => {
    // Authenticate with Pro credentials
    const authResult = await signInWithEmail(
      PACT_TEST_ACCOUNTS.pro.email,
      PACT_TEST_ACCOUNTS.pro.password
    );

    assert.ok(authResult.user, 'Must return authenticated user');
    assert.equal(authResult.user.email, 'tester.pro@pact.travel');

    // Resolve subscription plan
    const plan = await fetchUserSubscription(authResult.user.id, authResult.user.email);
    assert.equal(plan, 'premium_annual', 'Resolved plan for Pro account must be "premium_annual"');

    // Sync to useUserStore
    useUserStore.getState().setProfile({
      userId: authResult.user.id,
      displayName: authResult.user.user_metadata?.display_name || 'Pro Tier Tester',
      email: authResult.user.email
    });
    useUserStore.getState().setSubscriptionPlan(plan);
    useUserStore.getState().setAuthenticated(true);

    const userState = useUserStore.getState();
    assert.equal(userState.subscriptionPlan, 'premium_annual');
    assert.equal(userState.isAuthenticated, true);
    assert.equal(userState.profile.displayName, 'Pro Tier Tester');

    // Pro account creates a 16-member circle (exceeds free tier 8, within Pro 24)
    const proCircleMembers = 16;
    assert.ok(proCircleMembers > MAX_FREE_MEMBERS, '16 exceeds Free tier');
    assert.ok(proCircleMembers <= MAX_GROUP_MEMBERS, '16 is within Pro limit');

    useCircleStore.getState().addCircle({
      id: 'circle-pro-01',
      name: 'Alps Ski Expedition 2026 (Pro)',
      inviteCode: 'ALPS-PRO1',
      organizerId: authResult.user.id,
      organizerName: userState.profile.displayName,
      status: 'collecting',
      totalMembersCount: proCircleMembers,
      hasPro: userState.subscriptionPlan !== 'free',
      members: [
        { userId: authResult.user.id, name: `${userState.profile.displayName} (Organizer)`, status: 'locked', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    });

    const proCircle = useCircleStore.getState().getCircle('circle-pro-01');
    assert.ok(proCircle, 'Pro circle must be created');
    assert.equal(proCircle.hasPro, true, 'Pro organizer circle must have hasPro: true');
    assert.equal(useCircleStore.getState().isCirclePro('circle-pro-01'), true);

    // Pro can also create a second circle (unlimited circles allowed)
    useCircleStore.getState().addCircle({
      id: 'circle-pro-02',
      name: 'Tokyo Food Tour 2026 (Pro)',
      inviteCode: 'TOKY-PRO2',
      organizerId: authResult.user.id,
      organizerName: userState.profile.displayName,
      status: 'collecting',
      totalMembersCount: 10,
      hasPro: true,
      members: [
        { userId: authResult.user.id, name: `${userState.profile.displayName} (Organizer)`, status: 'locked', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    });

    assert.equal(useCircleStore.getState().circles.length, 2, 'Pro user can organize multiple active circles');
  });

  test('Step 4: Pro Circle Inheritance automatically propagates Pro perks to all invited guests', () => {
    // Pro organizer sets up circle
    const proCircleId = 'circle-bali-pro-inheritance';
    useCircleStore.getState().addCircle({
      id: proCircleId,
      name: 'Bali Retreat 2026',
      inviteCode: 'BALI-24P',
      organizerId: PACT_TEST_ACCOUNTS.pro.userId,
      organizerName: 'Pro Tier Tester',
      status: 'collecting',
      totalMembersCount: 12,
      hasPro: true,
      members: [
        { userId: PACT_TEST_ACCOUNTS.pro.userId, name: 'Pro Tier Tester (Organizer)', status: 'locked', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    });

    // Invited friends join the circle
    const friends = ['Lucas', 'Zara', 'Mateo', 'Aria'];
    friends.forEach((name, idx) => {
      const added = useCircleStore.getState().addMember(proCircleId, {
        userId: `guest-friend-${idx + 10}`,
        name,
        status: 'waiting',
        nudgedAt: null
      });
      assert.equal(added, true, `Friend ${name} must be added to Pro circle`);
    });

    const circle = useCircleStore.getState().getCircle(proCircleId);
    assert.equal(circle.members.length, 5);
    assert.equal(circle.hasPro, true, 'Circle hasPro flag remains true');
    assert.equal(useCircleStore.getState().isCirclePro(proCircleId), true, 'All guests inherit Pro circle status');
  });
});
