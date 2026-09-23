import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Micro-Task 5: Pro Inheritance Banner & Trip Brief Share UX Verification', () => {
  const rootDir = process.cwd();
  const addPeopleModalContent = fs.readFileSync(path.join(rootDir, 'src/components/AddPeopleModal.tsx'), 'utf8');
  const tripBriefContent = fs.readFileSync(path.join(rootDir, 'app/circle/[id]/brief.tsx'), 'utf8');

  test('AddPeopleModal renders exact Pro inheritance banner text when Pro active', () => {
    const expectedBannerText = '✨ Pro Circle Active — All invited friends inherit Pro features automatically';
    assert.ok(addPeopleModalContent.includes(expectedBannerText), 'AddPeopleModal must contain exact Pro inheritance banner text');
    assert.ok(addPeopleModalContent.includes('isProCircle'), 'AddPeopleModal must conditionally check Pro active state');
  });

  test('AddPeopleModal maintains minimum 44x44pt touch targets and explicit accessibility labels for share actions', () => {
    // Check touch target constraints
    assert.ok(addPeopleModalContent.includes('minHeight: 48') || addPeopleModalContent.includes('minHeight: 44'), 'Modal share tiles must enforce >= 44pt touch height');
    assert.ok(addPeopleModalContent.includes('width: 44') && addPeopleModalContent.includes('height: 44'), 'Close button must enforce 44x44pt touch target');

    // Check accessibility labels
    const requiredLabels = [
      'Close add people sheet',
      'Share invite via WhatsApp',
      'Share invite via SMS',
      'Share invite via Email',
      'Share invite via device share sheet'
    ];

    for (const label of requiredLabels) {
      assert.ok(addPeopleModalContent.includes(`accessibilityLabel="${label}"`), `AddPeopleModal missing accessibilityLabel: "${label}"`);
    }
  });

  test('PactTripBrief hero action stack highlights Share Trip Brief with emerald styling (#3DE0A0)', () => {
    assert.ok(tripBriefContent.includes("backgroundColor: '#3DE0A0'"), 'Trip Brief primary share button must use Emerald accent (#3DE0A0)');
    assert.ok(tripBriefContent.includes('Share Trip Brief'), 'Trip Brief primary button must display "Share Trip Brief" CTA text');
  });

  test('PactTripBrief maintains minimum 44x44pt touch targets and explicit accessibility labels across action stack', () => {
    // Check touch target constraints
    assert.ok(tripBriefContent.includes('minHeight: 48'), 'Trip Brief action buttons must enforce >= 44pt touch height');
    assert.ok(tripBriefContent.includes('minWidth: 44') && tripBriefContent.includes('minHeight: 44'), 'Brief header buttons must maintain >= 44x44pt touch target');

    // Check explicit accessibility labels
    const requiredBriefLabels = [
      'Share Trip Brief',
      'Add to Apple / Google Calendar',
      'Export Story Card for Instagram and Snap',
      'Go back to Circle Hub',
      'Open Trip Vault',
      'Open Memories',
      'Explore flight and villa options'
    ];

    for (const label of requiredBriefLabels) {
      assert.ok(tripBriefContent.includes(`accessibilityLabel="${label}"`), `Trip Brief missing accessibilityLabel: "${label}"`);
    }
  });
});
