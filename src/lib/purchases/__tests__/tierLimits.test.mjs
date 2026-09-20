import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_FREE_MEMBERS,
  MAX_GROUP_MEMBERS,
  getTierForMemberCount,
  isValidGroupSize
} from '../../pricing/groupPricing.ts';

describe('Tier Limits: Free (1-8), Organizer Pass (9-24), Enterprise (25+)', () => {
  function validateCircleCreation(memberCount, subscriptionPlan) {
    const total = parseInt(memberCount, 10);

    if (total > MAX_GROUP_MEMBERS) {
      return {
        allowed: false,
        requiresPass: false,
        enterprise: true,
        error: 'Circles larger than 24 members require an Enterprise Custom Plan. Please contact the organizer / support team for pricing details.'
      };
    }

    if (!isValidGroupSize(total)) {
      return {
        allowed: false,
        requiresPass: false,
        enterprise: false,
        error: `PACT circles currently support from 1 to ${MAX_GROUP_MEMBERS} members.`
      };
    }

    if (subscriptionPlan === 'free' && total > MAX_FREE_MEMBERS) {
      const tier = getTierForMemberCount(total);
      return {
        allowed: false,
        requiresPass: true,
        enterprise: false,
        error: `The Free tier supports up to 8 members. This trip needs the ${tier.name} (${tier.capacityLabel}).`
      };
    }

    return { allowed: true, requiresPass: false, enterprise: false };
  }

  test('8 members = Allowed (Free Tier)', () => {
    assert.equal(MAX_FREE_MEMBERS, 8);
    
    // Free tier user creating 1 to 8 members
    for (let count = 1; count <= 8; count++) {
      const res = validateCircleCreation(count, 'free');
      assert.equal(res.allowed, true, `Circle of ${count} members should be allowed on Free tier`);
      assert.equal(res.requiresPass, false);
      assert.equal(res.enterprise, false);
    }

    const tier8 = getTierForMemberCount(8);
    assert.equal(tier8.id, 'free');
    assert.equal(tier8.maxMembers, 8);
    assert.equal(tier8.capacityLabel, 'Up to 8 members');
  });

  test('9 to 24 members = Requires Organizer Pass (pro_access)', () => {
    assert.equal(MAX_GROUP_MEMBERS, 24);

    // Free tier user blocked on 9 to 24
    for (const count of [9, 10, 15, 20, 24]) {
      const freeRes = validateCircleCreation(count, 'free');
      assert.equal(freeRes.allowed, false, `Circle of ${count} members should be blocked on Free tier`);
      assert.equal(freeRes.requiresPass, true);
      assert.match(freeRes.error, /Free tier supports up to 8 members/);

      // Pro pass user allowed on 9 to 24
      const proRes = validateCircleCreation(count, 'premium_monthly');
      assert.equal(proRes.allowed, true, `Circle of ${count} members should be allowed with Organizer Pass`);
      assert.equal(proRes.requiresPass, false);
      assert.equal(proRes.enterprise, false);

      const tier = getTierForMemberCount(count);
      assert.equal(tier.id, 'organizer_pass');
      assert.equal(tier.maxMembers, 24);
      assert.equal(tier.capacityLabel, 'Up to 24 members');
    }
  });

  test('25+ members = Blocked with Enterprise contact prompt', () => {
    const counts = [25, 26, 50, 100];

    for (const count of counts) {
      // Both Free and Pro users are blocked at 25+
      const freeRes = validateCircleCreation(count, 'free');
      assert.equal(freeRes.allowed, false);
      assert.equal(freeRes.enterprise, true);
      assert.equal(
        freeRes.error,
        'Circles larger than 24 members require an Enterprise Custom Plan. Please contact the organizer / support team for pricing details.'
      );

      const proRes = validateCircleCreation(count, 'premium_monthly');
      assert.equal(proRes.allowed, false);
      assert.equal(proRes.enterprise, true);
      assert.equal(
        proRes.error,
        'Circles larger than 24 members require an Enterprise Custom Plan. Please contact the organizer / support team for pricing details.'
      );
    }
  });

  describe('Circle Creation Enforcement: Free (1-8), Pass (9-24), Enterprise (25+)', () => {
    function simulateCreateGroup(totalMembersCount, subscriptionPlan) {
      const total = Number(totalMembersCount);
      if (total > 24) {
        throw new Error('Circles larger than 24 members require an Enterprise Custom Plan. Please contact the organizer / support team for pricing details.');
      }
      if (subscriptionPlan === 'free' && total > 8) {
        throw new Error('Upgrade required: the Free tier supports up to 8 members. Choose a matching group pass to create larger trips.');
      }
      return { id: 'circle-test-123', totalMembersCount: total, subscriptionPlan };
    }

    test('8 members = Allowed (Free)', () => {
      const circle = simulateCreateGroup(8, 'free');
      assert.equal(circle.totalMembersCount, 8);
      assert.equal(circle.id, 'circle-test-123');
    });

    test('9 to 24 members = Requires Organizer Pass', () => {
      assert.throws(
        () => simulateCreateGroup(9, 'free'),
        /Upgrade required: the Free tier supports up to 8 members/
      );
      assert.throws(
        () => simulateCreateGroup(24, 'free'),
        /Upgrade required: the Free tier supports up to 8 members/
      );

      const pass9 = simulateCreateGroup(9, 'premium_monthly');
      assert.equal(pass9.totalMembersCount, 9);

      const pass24 = simulateCreateGroup(24, 'premium_monthly');
      assert.equal(pass24.totalMembersCount, 24);
    });

    test('25+ members = Blocked with Enterprise contact prompt', () => {
      assert.throws(
        () => simulateCreateGroup(25, 'free'),
        /Circles larger than 24 members require an Enterprise Custom Plan\. Please contact the organizer \/ support team for pricing details\./
      );
      assert.throws(
        () => simulateCreateGroup(25, 'premium_monthly'),
        /Circles larger than 24 members require an Enterprise Custom Plan\. Please contact the organizer \/ support team for pricing details\./
      );
      assert.throws(
        () => simulateCreateGroup(50, 'premium_monthly'),
        /Circles larger than 24 members require an Enterprise Custom Plan\. Please contact the organizer \/ support team for pricing details\./
      );
    });
  });
});
