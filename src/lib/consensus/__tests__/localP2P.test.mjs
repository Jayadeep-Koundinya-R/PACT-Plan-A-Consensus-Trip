import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeOfflineBallot,
  decodeOfflineBallot,
  computeLocalConsensus,
  generateBallotChecksum,
} from '../localP2P.ts';

describe('Offline P2P QR Consensus Engine', () => {
  const sampleBallot = {
    circleId: 'circle-offline-101',
    circleName: 'Western Ghats Trek',
    voterId: 'user-jayadeep',
    voterName: 'Jayadeep',
    budget: 650,
    dates: ['2026-10-15', '2026-10-16', '2026-10-17'],
    dealbreakers: ['extreme_cold'],
    approvals: { 'dest-goa': true, 'dest-coorg': true, 'dest-manali': false },
    timestamp: 1789000000000,
  };

  it('generates consistent deterministic checksums for ballot integrity', () => {
    const cs1 = generateBallotChecksum('user-1', 500, 1000);
    const cs2 = generateBallotChecksum('user-1', 500, 1000);
    const csDiff = generateBallotChecksum('user-2', 500, 1000);

    assert.equal(cs1, cs2);
    assert.notEqual(cs1, csDiff);
    assert.equal(typeof cs1, 'string');
  });

  it('encodes and decodes offline ballot losslessly with PACT-P2P prefix', () => {
    const encoded = encodeOfflineBallot(sampleBallot);
    assert.ok(encoded.startsWith('PACT-P2P:v1:'));

    const decoded = decodeOfflineBallot(encoded);
    assert.ok(decoded !== null);
    assert.equal(decoded.circleId, sampleBallot.circleId);
    assert.equal(decoded.voterId, sampleBallot.voterId);
    assert.equal(decoded.budget, 650);
    assert.deepEqual(decoded.dates, sampleBallot.dates);
    assert.deepEqual(decoded.approvals, sampleBallot.approvals);
  });

  it('rejects malformed or corrupted raw strings cleanly', () => {
    assert.equal(decodeOfflineBallot(''), null);
    assert.equal(decodeOfflineBallot('INVALID_PREFIX_DATA'), null);
    assert.equal(decodeOfflineBallot('PACT-P2P:v1:not-valid-base64!'), null);
  });

  it('correctly computes Pareto consensus among 4 offline peer ballots', () => {
    const ballots = [
      {
        circleId: 'c1',
        circleName: 'Trip',
        voterId: 'v1',
        voterName: 'Alice',
        budget: 700,
        dates: ['2026-10-15', '2026-10-16'],
        dealbreakers: [],
        approvals: { 'dest-goa': true, 'dest-gokarna': true },
        timestamp: 100,
      },
      {
        circleId: 'c1',
        circleName: 'Trip',
        voterId: 'v2',
        voterName: 'Bob',
        budget: 500, // Lowest budget
        dates: ['2026-10-15', '2026-10-16'],
        dealbreakers: ['extreme_nightlife'],
        approvals: { 'dest-goa': false, 'dest-gokarna': true },
        timestamp: 101,
      },
      {
        circleId: 'c1',
        circleName: 'Trip',
        voterId: 'v3',
        voterName: 'Charlie',
        budget: 1200,
        dates: ['2026-10-15', '2026-10-16', '2026-10-17'],
        dealbreakers: [],
        approvals: { 'dest-goa': true, 'dest-gokarna': true },
        timestamp: 102,
      },
      {
        circleId: 'c1',
        circleName: 'Trip',
        voterId: 'v4',
        voterName: 'Diana',
        budget: 800,
        dates: ['2026-10-15', '2026-10-16'],
        dealbreakers: [],
        approvals: { 'dest-goa': true, 'dest-gokarna': true },
        timestamp: 103,
      },
    ];

    const candidates = [
      {
        id: 'dest-goa',
        name: 'Goa Coastal Villa',
        estimatedCost: 650, // Exceeds Bob's $500 budget and has Bob veto
        availableDates: ['2026-10-15', '2026-10-16'],
        tags: ['beach', 'nightlife'],
      },
      {
        id: 'dest-gokarna',
        name: 'Gokarna Eco Resort',
        estimatedCost: 450, // Fits Bob's $500 ceiling, approved by all 4, no dealbreakers
        availableDates: ['2026-10-15', '2026-10-16'],
        tags: ['beach', 'nature'],
      },
    ];

    const result = computeLocalConsensus(ballots, candidates);

    assert.equal(result.totalBallots, 4);
    assert.equal(result.effectiveBudgetCeiling, 500); // Minimum budget
    assert.deepEqual(result.commonDates, ['2026-10-15', '2026-10-16']);
    assert.equal(result.winner?.id, 'dest-gokarna');
    assert.equal(result.status, 'consensus_reached');

    const gokarna = result.rankings.find((r) => r.candidate.id === 'dest-gokarna');
    assert.ok(gokarna);
    assert.equal(gokarna.isParetoOptimal, true);
    assert.equal(gokarna.approvalScore, 4);
    assert.equal(gokarna.budgetFit, true);

    const goa = result.rankings.find((r) => r.candidate.id === 'dest-goa');
    assert.ok(goa);
    assert.equal(goa.isParetoOptimal, false); // Vetoed & exceeds ceiling
    assert.equal(goa.vetoCount >= 1, true);
  });

  it('handles empty ballots or candidate list safely without throwing', () => {
    const emptyResult = computeLocalConsensus([], []);
    assert.equal(emptyResult.winner, null);
    assert.equal(emptyResult.status, 'insufficient_ballots');
  });
});
