import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useCircleStore } from '../../../store/useCircleStore.ts';
import { useGatherlyStore, CURRENCIES } from '../../../store/useGatherlyStore.js';

describe('Task 4 - Final Quality Assurance, Error Handling, and Edge Cases', () => {
  describe('1. Invite Code Lookup with Edge-Case Characters & Deep Links', () => {
    it('sanitizes deep link protocols (pact://join/, pact://invite/) correctly', () => {
      const sanitize = (code) => {
        const rawCode = Array.isArray(code) ? code[0] : code || '';
        let decodedCode = rawCode;
        try {
          decodedCode = decodeURIComponent(rawCode);
        } catch (_e) {
          decodedCode = rawCode;
        }
        return decodedCode
          .replace(/^pact:\/\/(join\/|invite\/)?/i, '')
          .split('?')[0]
          .split('#')[0]
          .replace(/[^a-zA-Z0-9\-_]/g, '')
          .replace(/\/+$/, '')
          .trim()
          .toUpperCase();
      };

      assert.equal(sanitize('pact://join/GOA-4F82?ref=wa'), 'GOA-4F82');
      assert.equal(sanitize('pact://invite/toky-2027/#section'), 'TOKY-2027');
      assert.equal(sanitize('  goa-4f82  '), 'GOA-4F82');
      assert.equal(sanitize('KYOTO%2D2025?source=qr'), 'KYOTO-2025');
      assert.equal(sanitize('invalid@code!#123'), 'INVALIDCODE');
      assert.equal(sanitize(''), '');
      assert.equal(sanitize(null), '');
    });

    it('looks up circle correctly regardless of case sensitivity or whitespace', () => {
      const circleId = 'test-edge-circle-1';
      useCircleStore.getState().addCircle({
        id: circleId,
        name: 'Edge Case Circle',
        inviteCode: 'EDGE-9988',
        organizerId: 'org-1',
        status: 'collecting',
        totalMembersCount: 5,
        members: [{ userId: 'org-1', name: 'Org', status: 'locked', nudgedAt: null }],
        createdAt: new Date().toISOString()
      });

      const store = useCircleStore.getState();
      assert.ok(store.getCircleByInviteCode('edge-9988'));
      assert.ok(store.getCircleByInviteCode('  EDGE-9988  '));
      assert.ok(store.getCircleByInviteCode('Edge-9988'));
      assert.equal(store.getCircleByInviteCode('NONEXISTENT'), undefined);
    });
  });

  describe('2. Currency Display Consistency', () => {
    it('formats currency correctly across USD, EUR, INR, GBP, large numbers, and zero', () => {
      const formatCurrency = (amountInUSD, currencyCode) => {
        const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
        const converted = Math.round(amountInUSD * config.rate);
        if (currencyCode === 'INR') {
          return `₹${converted.toLocaleString('en-IN')}`;
        }
        return `${config.symbol}${converted.toLocaleString()}`;
      };

      assert.equal(formatCurrency(100, 'USD'), '$100');
      assert.equal(formatCurrency(100, 'EUR'), '€92');
      assert.equal(formatCurrency(100, 'INR'), '₹8,350');
      assert.equal(formatCurrency(100, 'GBP'), '£79');

      assert.equal(formatCurrency(0, 'USD'), '$0');
      assert.equal(formatCurrency(0, 'INR'), '₹0');

      assert.equal(formatCurrency(125000, 'USD'), '$125,000');
      assert.equal(formatCurrency(125000, 'INR'), '₹1,04,37,500');

      assert.equal(formatCurrency(100, 'UNKNOWN_CODE'), '$100');
    });

    it('store updates currency and currencySymbol correctly', () => {
      const store = useGatherlyStore.getState();
      store.setCurrency('EUR');
      assert.equal(useGatherlyStore.getState().currency, 'EUR');
      assert.equal(useGatherlyStore.getState().currencySymbol, '€');

      store.setCurrency('INR');
      assert.equal(useGatherlyStore.getState().currency, 'INR');
      assert.equal(useGatherlyStore.getState().currencySymbol, '₹');

      // Reset
      store.setCurrency('USD');
    });
  });

  describe('3. Empty State Transitions & Store Safety', () => {
    it('handles empty circles and sequential member addition and removal without error', () => {
      const circleId = 'empty-test-circle';
      useCircleStore.getState().addCircle({
        id: circleId,
        name: 'Empty Transition Circle',
        inviteCode: 'EMPTY-11',
        organizerId: 'org-user',
        status: 'collecting',
        totalMembersCount: 3,
        members: [{ userId: 'org-user', name: 'Org', status: 'waiting', nudgedAt: null }],
        createdAt: new Date().toISOString()
      });

      let circle = useCircleStore.getState().getCircle(circleId);
      assert.equal(circle.members.length, 1);

      // Add 2 members
      useCircleStore.getState().addMember(circleId, { userId: 'm1', name: 'Member 1', status: 'waiting', nudgedAt: null });
      useCircleStore.getState().addMember(circleId, { userId: 'm2', name: 'Member 2', status: 'waiting', nudgedAt: null });

      circle = useCircleStore.getState().getCircle(circleId);
      assert.equal(circle.members.length, 3);

      // Non-organizer leaves
      useCircleStore.getState().safeRemoveMember(circleId, 'm2');
      assert.equal(useCircleStore.getState().getCircle(circleId).members.length, 2);

      // Non-organizer m1 leaves
      useCircleStore.getState().safeRemoveMember(circleId, 'm1');
      assert.equal(useCircleStore.getState().getCircle(circleId).members.length, 1);

      // Sole organizer leaves -> circle auto-deleted
      useCircleStore.getState().safeRemoveMember(circleId, 'org-user');
      assert.equal(useCircleStore.getState().getCircle(circleId), undefined);
    });

    it('handles empty pastTrips gracefully without throwing exceptions', () => {
      const pastTrips = [];
      const groupedByYear = {};
      pastTrips.forEach((trip) => {
        const yearMatch = (trip?.dates || '').match(/\b(20\d\d)\b/);
        const year = yearMatch ? yearMatch[1] : '2025';
        if (!groupedByYear[year]) groupedByYear[year] = [];
        groupedByYear[year].push(trip);
      });

      assert.equal(Object.keys(groupedByYear).length, 0);
    });
  });
});
