import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fetchMemberPreferenceSecure,
  getOptionVoteAggregateSecure,
  assertOrganizerCanFinalize,
  SecurityError,
  AuthorizationError
} from '../accessControl.js';
import { DEMO_MEMBERS } from '../../consensus/seedData.js';

test('Security Test 1: Preferences should be private', (t) => {
  const mayaUserId = 'user-maya-001';
  const priyaUserId = 'user-priya-003';

  // Maya querying her own preferences succeeds
  const mayaOwnPref = fetchMemberPreferenceSecure(mayaUserId, mayaUserId, DEMO_MEMBERS);
  assert.ok(mayaOwnPref, 'Maya should be able to read her own preferences');
  assert.equal(mayaOwnPref.userName, 'Maya');

  // Maya trying to fetch Priya's private preferences MUST throw SecurityError
  assert.throws(
    () => {
      fetchMemberPreferenceSecure(mayaUserId, priyaUserId, DEMO_MEMBERS);
    },
    {
      name: 'SecurityError'
    },
    'Maya attempting to read Priya’s private preferences must be blocked'
  );
});

test('Security Test 2: Votes should be aggregate-only (Silent Voting)', (t) => {
  const rawVotes = {
    'opt-goa-01_user-maya-001': true,
    'opt-goa-01_user-jake-002': true,
    'opt-goa-01_user-priya-003': true,
    'opt-goa-01_user-alex-004': true,
    'opt-goa-01_user-sam-005': true,
    'opt-manali-02_user-jake-002': true
  };

  const goaAggregate = getOptionVoteAggregateSecure('opt-goa-01', rawVotes);

  // Must return aggregate numbers only
  assert.equal(goaAggregate.optionId, 'opt-goa-01');
  assert.equal(goaAggregate.totalVotes, 5);
  assert.equal(goaAggregate.approvedVotes, 5);
  assert.equal(goaAggregate.approvalPercentage, 100);

  // Verify response does not leak user IDs
  assert.equal(goaAggregate.userIds, undefined);
  assert.equal(goaAggregate.voters, undefined);

  // Check an option with fewer votes
  const manaliAggregate = getOptionVoteAggregateSecure('opt-manali-02', rawVotes);
  assert.equal(manaliAggregate.approvedVotes, 1);
  assert.equal(manaliAggregate.totalVotes, 1);
});

test('Security Test 3: Non-organizer cannot finalize trip', (t) => {
  const organizerId = 'user-maya-001'; // Maya is Organizer
  const memberJakeId = 'user-jake-002'; // Jake is regular Member

  // Jake attempting to finalize MUST be rejected with AuthorizationError
  assert.throws(
    () => {
      assertOrganizerCanFinalize(memberJakeId, organizerId, 100);
    },
    {
      name: 'AuthorizationError'
    },
    'Jake calling finalizeTrip must be rejected'
  );

  // Maya (the organizer) can finalize when consensus >= 70%
  const result = assertOrganizerCanFinalize(organizerId, organizerId, 100);
  assert.equal(result, true, 'Organizer can finalize when consensus is reached');

  // Even Maya cannot finalize if consensus < 70%
  assert.throws(
    () => {
      assertOrganizerCanFinalize(organizerId, organizerId, 50);
    },
    {
      name: 'AuthorizationError'
    },
    'Finalize must fail if consensus is below 70%'
  );
});
