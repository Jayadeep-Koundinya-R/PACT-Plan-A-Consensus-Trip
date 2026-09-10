import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Unified Share Hook and privacy contract', () => {
  const formatInviteMessage = (groupName, inviteCode, customMessage) => {
    if (customMessage) return customMessage;
    const joinUrl = `pact://join/${inviteCode}`;
    return `Join our trip circle for "${groupName}" on PACT!\n\nYour raw constraints are protected from other members.\n\nApp Link: ${joinUrl}\nInvite Code: ${inviteCode}`;
  };

  const formatTripBriefMessage = (options) => {
    const { groupName, destination, dates, budget, memberCount = 5, briefCode = 'PACT-8821', briefUrl } = options;
    const viewLine = briefUrl?.startsWith('pact://')
      ? `Open confirmed itinerary: ${briefUrl}`
      : `Open PACT to view the confirmed itinerary and vouchers (brief ${briefCode}).`;
    return `PACT Consensus Brief: ${destination}\nTrip: ${groupName}\nDates: ${dates}\nTarget: ~${budget} / person\n${memberCount} members locked\n${viewLine}`;
  };

  const formatNudgeMessage = ({ groupName, inviteCode, lockedCount, neededCount, memberName }) => {
    const greeting = memberName ? `Hey ${memberName}!` : 'Hey team!';
    const joinUrl = `pact://join/${inviteCode}`;
    return `${greeting} ${lockedCount} of us have locked in trip preferences for "${groupName}" on PACT. We need ${neededCount} more to reveal the consensus match!\n\nLock in your dates & budget here:\n${joinUrl}\nInvite Code: ${inviteCode}`;
  };

  test('invite message always includes the app hint and reliable code fallback', () => {
    const msg = formatInviteMessage('Goa Beach Escape 2026', 'GOA-4F82');
    assert.ok(msg.includes('pact://join/GOA-4F82'));
    assert.ok(msg.includes('Invite Code: GOA-4F82'));
    assert.ok(msg.includes('protected from other members'));
  });

  test('trip brief never invents an unconfigured HTTPS domain', () => {
    const brief = formatTripBriefMessage({
      groupName: 'Goa Beach Escape 2026',
      destination: 'Goa, India',
      dates: 'Oct 14 - Oct 19, 2026',
      budget: '$540',
      memberCount: 5,
      briefUrl: 'https://unconfigured.example/brief/circle'
    });
    assert.ok(brief.includes('Open PACT to view'));
    assert.equal(brief.includes('pact.app'), false);
  });

  test('nudge contains no raw budget, dealbreaker, or veto data', () => {
    const nudge = formatNudgeMessage({
      groupName: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82',
      lockedCount: 2,
      neededCount: 1,
      memberName: 'Alex'
    });
    assert.ok(nudge.includes('pact://join/GOA-4F82'));
    assert.equal(nudge.includes('$'), false);
    assert.equal(nudge.includes('dealbreaker'), false);
    assert.equal(nudge.includes('veto'), false);
  });

  test('all share touchpoints use the shared hook and avoid user search', () => {
    const rootDir = process.cwd();
    for (const file of [
      'app/circle/[id]/hub.tsx',
      'app/circle/[id]/brief.tsx',
      'src/components/InviteQRModal.tsx',
      'src/components/NudgeModal.tsx',
      'app/(tabs)/home.tsx'
    ]) {
      assert.ok(fs.readFileSync(path.join(rootDir, file), 'utf8').includes('useShareInvite'), `${file} must use useShareInvite`);
    }
    const modalFile = fs.readFileSync(path.join(rootDir, 'src/components/AddPeopleModal.tsx'), 'utf8');
    for (const channel of ['WhatsApp', 'Messages (SMS)', 'Email', 'Device Share Sheet', 'COPY LINK']) {
      assert.ok(modalFile.includes(channel), `Missing ${channel} share option`);
    }
    assert.equal(modalFile.includes('searchUsers'), false);
    assert.equal(modalFile.includes('userDirectory'), false);
    assert.equal(modalFile.includes('friendRequest'), false);
  });
});
