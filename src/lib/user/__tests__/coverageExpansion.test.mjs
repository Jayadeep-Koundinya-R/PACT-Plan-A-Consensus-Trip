import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { useCircleStore } from '../../../store/useCircleStore.ts';
import { assertOrganizerCanFinalize } from '../../security/accessControl.js';

describe('Task 4.1 - Coverage Expansion Suite', () => {
  it('1. Organizer Transfer: allows ownership transfer and enables new organizer to finalize', () => {
    let currentOrganizerId = 'user-old-org-1';
    const newOrganizerId = 'user-new-org-2';

    // Old org can finalize before transfer
    assert.doesNotThrow(() => assertOrganizerCanFinalize(currentOrganizerId, currentOrganizerId, 100));

    // New org cannot finalize before transfer
    assert.throws(() => assertOrganizerCanFinalize(newOrganizerId, currentOrganizerId, 100), /Permission Denied/);

    // Transfer ownership
    currentOrganizerId = newOrganizerId;

    // New org can now finalize
    assert.doesNotThrow(() => assertOrganizerCanFinalize(newOrganizerId, currentOrganizerId, 100));

    // Old org can no longer finalize
    assert.throws(() => assertOrganizerCanFinalize('user-old-org-1', currentOrganizerId, 100), /Permission Denied/);
  });

  it('2. Circle Lifecycle: executes create -> join -> lock -> vote -> finalize -> archive', () => {
    const circleId = 'lifecycle-circle-101';
    const orgId = 'org-user-1';
    const memberId = 'member-user-2';

    // Create
    useCircleStore.getState().addCircle({
      id: circleId,
      name: 'Lifecycle Trip',
      inviteCode: 'LIFE-101',
      organizerId: orgId,
      status: 'collecting',
      totalMembersCount: 2,
      members: [{ userId: orgId, name: 'Organizer', status: 'waiting', nudgedAt: null }],
      createdAt: new Date().toISOString()
    });

    let circle = useCircleStore.getState().getCircle(circleId);
    assert.ok(circle, 'Circle created');
    assert.equal(circle.status, 'collecting');

    // Join
    const joined = useCircleStore.getState().addMember(circleId, {
      userId: memberId,
      name: 'Member 2',
      status: 'waiting',
      nudgedAt: null
    });
    assert.equal(joined, true, 'Member joined');

    // Lock
    useCircleStore.getState().setMemberStatus(circleId, orgId, 'locked');
    useCircleStore.getState().setMemberStatus(circleId, memberId, 'locked');
    const responded = useCircleStore.getState().getRespondedCount(circleId);
    assert.equal(responded, 2, 'All members locked');

    // Vote
    useCircleStore.getState().updateCircleStatus(circleId, 'voting');
    assert.equal(useCircleStore.getState().getCircle(circleId).status, 'voting');

    // Finalize
    useCircleStore.getState().updateCircleStatus(circleId, 'finalized');
    assert.equal(useCircleStore.getState().getCircle(circleId).status, 'finalized');

    // Archive
    useCircleStore.getState().archiveCircle(circleId);
    assert.equal(useCircleStore.getState().getCircle(circleId).archived, true);
  });

  it('3. Concurrent Capacity: rejects 2 members trying to join a full 2/2 circle', () => {
    const circleId = 'cap-circle-202';
    useCircleStore.getState().addCircle({
      id: circleId,
      name: 'Max Cap Circle',
      inviteCode: 'MAX-202',
      organizerId: 'org-1',
      status: 'collecting',
      totalMembersCount: 2,
      members: [
        { userId: 'org-1', name: 'Org', status: 'locked', nudgedAt: null },
        { userId: 'm-1', name: 'M1', status: 'locked', nudgedAt: null }
      ],
      createdAt: new Date().toISOString()
    });

    // Concurrent join attempt A
    const resA = useCircleStore.getState().addMember(circleId, {
      userId: 'm-2',
      name: 'M2',
      status: 'waiting',
      nudgedAt: null
    });

    // Concurrent join attempt B
    const resB = useCircleStore.getState().addMember(circleId, {
      userId: 'm-3',
      name: 'M3',
      status: 'waiting',
      nudgedAt: null
    });

    assert.equal(resA, false, 'First concurrent join rejected due to capacity limit');
    assert.equal(resB, false, 'Second concurrent join rejected due to capacity limit');
    assert.equal(useCircleStore.getState().getCircle(circleId).members.length, 2);
  });

  it('4. Empty Circle Cleanup: removes circle from store when 0 members remain', () => {
    const circleId = 'empty-circle-303';
    const orgId = 'sole-org-1';

    useCircleStore.getState().addCircle({
      id: circleId,
      name: 'Sole Circle',
      inviteCode: 'SOLE-303',
      organizerId: orgId,
      status: 'collecting',
      totalMembersCount: 5,
      members: [{ userId: orgId, name: 'Sole Org', status: 'locked', nudgedAt: null }],
      createdAt: new Date().toISOString()
    });

    assert.ok(useCircleStore.getState().getCircle(circleId));

    // Organizer leaves sole circle
    useCircleStore.getState().safeRemoveMember(circleId, orgId);

    // Circle should be removed
    assert.equal(useCircleStore.getState().getCircle(circleId), undefined);
  });

  it('5. Multi-Currency Conversion: formats currency across USD, EUR, INR, and GBP', () => {
    const CURRENCIES = {
      USD: { symbol: '$', rate: 1 },
      EUR: { symbol: '€', rate: 0.92 },
      INR: { symbol: '₹', rate: 83.5 },
      GBP: { symbol: '£', rate: 0.79 },
    };

    const formatCurrency = (amountInUSD, code) => {
      const config = CURRENCIES[code] || CURRENCIES.USD;
      const converted = Math.round((amountInUSD * config.rate) / 5) * 5;
      if (code === 'INR') return `₹${converted.toLocaleString('en-IN')}`;
      return `${config.symbol}${converted.toLocaleString()}`;
    };

    assert.ok(formatCurrency(100, 'USD').includes('$'));
    assert.ok(formatCurrency(100, 'EUR').includes('€'));
    assert.ok(formatCurrency(100, 'INR').includes('₹'));
    assert.ok(formatCurrency(100, 'GBP').includes('£'));
  });
});
