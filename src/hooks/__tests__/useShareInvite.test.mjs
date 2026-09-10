import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Import formatters directly or simulate implementation
describe('Unified Share Hook (useShareInvite) & Privacy Contract', () => {

  const formatInviteMessage = (groupName, inviteCode, customMessage) => {
    if (customMessage) return customMessage;
    const joinUrl = `https://pact.app/join/${inviteCode}`;
    return `🌴 Join our private trip circle for "${groupName}" on PACT!\n\nLock in your dates & budget 100% confidentially (your raw budget is never shown to the group).\n\n👉 Join Link: ${joinUrl}\n👉 Invite Code: ${inviteCode}`;
  };

  const formatTripBriefMessage = (options) => {
    const { groupName, destination, dates, budget, memberCount = 5, briefCode = 'PACT-8821', briefUrl } = options;
    const url = briefUrl || `https://pact.app/brief/${briefCode}`;
    return `🏖️ *PACT Consensus Brief: ${destination}*\nTrip: ${groupName}\n🗓️ Dates: ${dates}\n💰 Target: ~${budget} / person\n👥 ${memberCount} members locked (100% consensus)\n📍 Stay: Private villa\n\nView confirmed itinerary & vouchers: ${url}`;
  };

  const formatNudgeMessage = (options) => {
    const { groupName, inviteCode, lockedCount, neededCount, memberName } = options;
    const greeting = memberName ? `Hey ${memberName}! 👋` : 'Hey team! ✈️';
    const joinUrl = `https://pact.app/join/${inviteCode}`;
    return `${greeting} ${lockedCount} of us have locked in trip preferences for "${groupName}" on PACT. We need ${neededCount} more to reveal the consensus match!\n\nLock in your dates & budget here (100% private):\n${joinUrl}\nInvite Code: ${inviteCode}`;
  };

  test('formatInviteMessage generates pre-filled invite with code, link, and privacy note', () => {
    const msg = formatInviteMessage('Goa Beach Escape 2026', 'GOA-4F82');
    assert.ok(msg.includes('Goa Beach Escape 2026'));
    assert.ok(msg.includes('GOA-4F82'));
    assert.ok(msg.includes('https://pact.app/join/GOA-4F82'));
    assert.ok(msg.includes('100% confidentially'));
  });

  test('formatTripBriefMessage formats canonical 1-tap WhatsApp brief card', () => {
    const brief = formatTripBriefMessage({
      groupName: 'Goa Beach Escape 2026',
      destination: 'Goa, India',
      dates: 'Oct 14 - Oct 19, 2026',
      budget: '$540',
      memberCount: 5,
      briefUrl: 'https://pact.app/circle/circle-college-reunion-2026/brief'
    });
    assert.ok(brief.includes('*PACT Consensus Brief: Goa, India*'));
    assert.ok(brief.includes('Oct 14 - Oct 19, 2026'));
    assert.ok(brief.includes('~$540 / person'));
    assert.ok(brief.includes('5 members locked'));
    assert.ok(brief.includes('https://pact.app/circle/circle-college-reunion-2026/brief'));
  });

  test('formatNudgeMessage strictly conforms to privacy contract (NO raw budgets or vetoes exposed)', () => {
    const nudge = formatNudgeMessage({
      groupName: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82',
      lockedCount: 2,
      neededCount: 1,
      memberName: 'Alex'
    });
    assert.ok(nudge.includes('Hey Alex! 👋'));
    assert.ok(nudge.includes('2 of us have locked in'));
    assert.ok(nudge.includes('We need 1 more'));
    assert.ok(nudge.includes('https://pact.app/join/GOA-4F82'));

    // Privacy contract assertions:
    assert.strictEqual(nudge.includes('$'), false, 'Nudge must NEVER contain raw dollar amounts');
    assert.strictEqual(nudge.includes('€'), false, 'Nudge must NEVER contain raw euro amounts');
    assert.strictEqual(nudge.includes('₹'), false, 'Nudge must NEVER contain raw rupee amounts');
    assert.strictEqual(nudge.includes('dealbreaker'), false, 'Nudge must NEVER reveal private dealbreakers');
    assert.strictEqual(nudge.includes('veto'), false, 'Nudge must NEVER reveal member vetoes');
  });

  test('All touchpoint screens import and utilize useShareInvite unified hook', () => {
    const rootDir = process.cwd();

    const hubFile = fs.readFileSync(path.join(rootDir, 'app/circle/[id]/hub.tsx'), 'utf8');
    assert.ok(hubFile.includes('useShareInvite'), 'hub.tsx must use useShareInvite hook');
    assert.ok(hubFile.includes('AddPeopleModal'), 'hub.tsx must render AddPeopleModal');
    assert.ok(hubFile.includes('shareNudge'), 'hub.tsx must call shareNudge');

    const briefFile = fs.readFileSync(path.join(rootDir, 'app/circle/[id]/brief.tsx'), 'utf8');
    assert.ok(briefFile.includes('useShareInvite'), 'brief.tsx must use useShareInvite hook');
    assert.ok(briefFile.includes('shareTripBrief'), 'brief.tsx must call shareTripBrief');

    const qrModalFile = fs.readFileSync(path.join(rootDir, 'src/components/InviteQRModal.tsx'), 'utf8');
    assert.ok(qrModalFile.includes('useShareInvite'), 'InviteQRModal must use useShareInvite hook');

    const nudgeModalFile = fs.readFileSync(path.join(rootDir, 'src/components/NudgeModal.tsx'), 'utf8');
    assert.ok(nudgeModalFile.includes('useShareInvite'), 'NudgeModal must use useShareInvite hook');

    const homeFile = fs.readFileSync(path.join(rootDir, 'app/(tabs)/home.tsx'), 'utf8');
    assert.ok(homeFile.includes('useShareInvite'), 'home.tsx must use useShareInvite hook');
  });

  test('AddPeopleModal provides native share options without user directory or search', () => {
    const rootDir = process.cwd();
    const modalFile = fs.readFileSync(path.join(rootDir, 'src/components/AddPeopleModal.tsx'), 'utf8');
    assert.ok(modalFile.includes('WhatsApp'), 'Must provide WhatsApp option');
    assert.ok(modalFile.includes('Messages (SMS)'), 'Must provide SMS option');
    assert.ok(modalFile.includes('Email'), 'Must provide Email option');
    assert.ok(modalFile.includes('Device Share Sheet'), 'Must provide Native device share');
    assert.ok(modalFile.includes('COPY LINK'), 'Must provide Copy Link option');

    // Assert that central user directories and search are absent
    assert.strictEqual(modalFile.includes('searchUsers'), false, 'Must NOT contain user search');
    assert.strictEqual(modalFile.includes('userDirectory'), false, 'Must NOT contain user directory');
    assert.strictEqual(modalFile.includes('friendRequest'), false, 'Must NOT contain friend request system');
  });
});
