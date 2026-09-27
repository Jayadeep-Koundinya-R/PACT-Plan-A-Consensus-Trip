import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateNotificationPrivacy,
  buildNudgeNotification,
  buildDeadlineReminder,
  buildConsensusReached,
  buildPreVotingAlert,
  buildPostConsensusAlert,
  buildDepartureMilestoneAlert,
  sendPactNotification,
  getNotificationHistory,
  clearNotificationHistory
} from '../pactNotifications.ts';

test('Push Notifications: Strict Privacy Guard', async (t) => {
  await t.test('approves generic nudge notification without budget or veto data', () => {
    const payload = buildNudgeNotification('Jordan', 'Goa Beach Escape 2026');
    assert.strictEqual(payload.title, 'PACT Circle Reminder');
    assert.strictEqual(payload.body, "Jordan hasn't responded yet. Tap to view circle progress.");

    const validation = validateNotificationPrivacy(payload.title, payload.body);
    assert.strictEqual(validation.valid, true);
  });

  await t.test('approves pre-voting lifecycle alert', () => {
    const payload = buildPreVotingAlert('Oct 20');
    assert.strictEqual(payload.title, 'Consensus Round Open');
    assert.strictEqual(payload.body, 'Consensus round is open. Lock in your sealed ballot before Oct 20.');

    const validation = validateNotificationPrivacy(payload.title, payload.body);
    assert.strictEqual(validation.valid, true);
  });

  await t.test('approves post-consensus lifecycle alert', () => {
    const payload = buildPostConsensusAlert();
    assert.strictEqual(payload.title, 'Supermajority Reached');
    assert.strictEqual(payload.body, 'Supermajority reached! Time to finalize tickets and accommodations.');

    const validation = validateNotificationPrivacy(payload.title, payload.body);
    assert.strictEqual(validation.valid, true);
  });

  await t.test('approves departure milestone alert', () => {
    const payload = buildDepartureMilestoneAlert();
    assert.strictEqual(payload.title, 'Departure Milestone');
    assert.strictEqual(payload.body, 'Trip starts today! Open your PACT Boarding Pass.');

    const validation = validateNotificationPrivacy(payload.title, payload.body);
    assert.strictEqual(validation.valid, true);
  });

  await t.test('approves generic deadline reminder without private data', () => {
    const payload = buildDeadlineReminder('Goa Beach Escape 2026', 2);
    assert.strictEqual(payload.title, 'Voting Deadline Approaching');
    assert.strictEqual(payload.body, 'Voting closes in 2 hours for Goa Beach Escape 2026.');

    const validation = validateNotificationPrivacy(payload.title, payload.body);
    assert.strictEqual(validation.valid, true);
  });

  await t.test('approves consensus-reached announcement', () => {
    const payload = buildConsensusReached('Goa Beach Escape 2026');
    assert.strictEqual(payload.title, 'Consensus Reached! 🎉');
    assert.strictEqual(payload.body, 'Consensus reached on Goa Beach Escape 2026! Tap to view final trip brief.');

    const validation = validateNotificationPrivacy(payload.title, payload.body);
    assert.strictEqual(validation.valid, true);
  });

  await t.test('STRICTLY BLOCKS notifications containing budget figures or dollar signs', () => {
    const badPayloads = [
      { title: 'Reminder', body: 'Alex set a $500 budget limit' },
      { title: 'Budget Alert', body: 'Group budget is $1200 per person' },
      { title: 'Cost Update', body: 'Estimated price is 600 dollars' },
    ];

    for (const p of badPayloads) {
      const validation = validateNotificationPrivacy(p.title, p.body);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.reason.includes('Budget amounts or numbers are strictly prohibited'));
    }
  });

  await t.test('STRICTLY BLOCKS notifications disclosing individual dealbreakers or vetoes', () => {
    const badPayloads = [
      { title: 'Veto Alert', body: 'Sam vetoed the luxury villa' },
      { title: 'Dealbreaker', body: 'Jordan has a dealbreaker: No shared bath' },
      { title: 'Hostel Disqualified', body: 'Option rejected due to dorm rooms' }
    ];

    for (const p of badPayloads) {
      const validation = validateNotificationPrivacy(p.title, p.body);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.reason.includes('Vetoes or personal dealbreaker disclosures are strictly prohibited'));
    }
  });

  await t.test('successfully tracks delivered notifications in history', async () => {
    clearNotificationHistory();
    const payload = buildNudgeNotification('Sam', 'Goa trip');
    const res = await sendPactNotification(payload);
    assert.strictEqual(res.delivered, true);

    const history = getNotificationHistory();
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].body, "Sam hasn't responded yet. Tap to view circle progress.");
  });
});
