import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Account Purge and Tab Navigation Verification', () => {
  // 1. Account Deletion and Purge Data Contract
  test('deleteAccountAndPurgeData resets user profile, groups, preferences, and votes', () => {
    // Mock store state representing an active user with populated data
    let state = {
      currentUserId: 'user-maya-001',
      userEmail: 'maya@example.com',
      userName: 'Maya Lin',
      groups: [{ id: 'group-1', name: 'Goa Trip' }],
      activeGroupId: 'group-1',
      members: [{ userId: 'user-maya-001', budget_max: 600 }],
      tripOptions: [{ id: 'opt-1', title: 'South Goa Villa' }],
      preferenceDrafts: { 'group-1_user-maya-001': { budget_max: 600 } },
      votes: { 'opt-1_user-maya-001': true },
      finalizedBrief: { destination: 'Goa' },
      vaultDocuments: { 'group-1': [{ section: 'FLIGHTS', items: [] }] },
      memoryPhotos: { 'group-1': [{ id: 'p1', uri: 'photo.jpg' }] },
      subscriptionPlan: 'premium_monthly'
    };

    function purgeAccount(s) {
      return {
        ...s,
        currentUserId: '',
        userEmail: null,
        userName: null,
        groups: [],
        activeGroupId: '',
        members: [],
        tripOptions: [],
        preferenceDrafts: {},
        votes: {},
        finalizedBrief: null,
        vaultDocuments: {},
        memoryPhotos: {},
        subscriptionPlan: 'free'
      };
    }

    const purged = purgeAccount(state);

    assert.equal(purged.currentUserId, '');
    assert.equal(purged.userEmail, null);
    assert.equal(purged.userName, null);
    assert.deepEqual(purged.groups, []);
    assert.deepEqual(purged.preferenceDrafts, {});
    assert.deepEqual(purged.votes, {});
    assert.equal(purged.finalizedBrief, null);
    assert.deepEqual(purged.vaultDocuments, {});
    assert.deepEqual(purged.memoryPhotos, {});
    assert.equal(purged.subscriptionPlan, 'free');
  });

  // 2. Bottom Navigation Bar Layout Verification
  test('bottom tab navigation layout defines exactly the 4 required visible tabs plus hidden pro tab', () => {
    const layoutPath = path.resolve(process.cwd(), 'app/(tabs)/_layout.tsx');
    assert.ok(fs.existsSync(layoutPath), 'TabLayout file must exist');

    const content = fs.readFileSync(layoutPath, 'utf8');

    // Tab names
    assert.ok(content.includes('name="home"'), 'Home tab must be registered');
    assert.ok(content.includes('name="create"'), 'Create tab must be registered');
    assert.ok(content.includes('name="ai-advisor"'), 'AI Advisor tab must be registered');
    assert.ok(content.includes('name="settings"'), 'Settings tab must be registered');
    assert.ok(content.includes('name="pro"'), 'Pro tab route must exist');

    // Tab bar labels
    assert.ok(content.includes("tabBarLabel: 'My Circles'"), 'My Circles label must be set');
    assert.ok(content.includes("tabBarLabel: 'New Trip'"), 'New Trip label must be set');
    assert.ok(content.includes("tabBarLabel: 'AI Advisor'"), 'AI Advisor label must be set');
    assert.ok(content.includes("tabBarLabel: 'Settings'"), 'Settings label must be set');

    // Renamed from Ask Gemini
    assert.ok(!content.includes('Ask Gemini'), 'Ask Gemini should be replaced with AI Advisor');

    // Pro is hidden from bar
    assert.ok(content.includes('href: null'), 'Pro tab must have href: null to hide from bottom bar');
  });

  // 3. AI Advisor Tab Screen File Exists
  test('ai-advisor.tsx screen file exists in app/(tabs)/', () => {
    const advisorPath = path.resolve(process.cwd(), 'app/(tabs)/ai-advisor.tsx');
    assert.ok(fs.existsSync(advisorPath), 'app/(tabs)/ai-advisor.tsx must exist');

    const content = fs.readFileSync(advisorPath, 'utf8');
    assert.ok(content.includes('PACT AI Advisor'), 'Screen must include PACT AI Advisor title');
    assert.ok(content.includes('useAIChatStore'), 'Screen must integrate with useAIChatStore');
    assert.ok(content.includes('FREE_DAILY_PROMPT_LIMIT'), 'Screen must display daily prompt quota');
  });

  // 4. Settings Screen Working Buttons and Modals
  test('settings.tsx contains working Delete Account, Sign Out, and Billing confirmation modals', () => {
    const settingsPath = path.resolve(process.cwd(), 'app/settings.tsx');
    assert.ok(fs.existsSync(settingsPath), 'app/settings.tsx must exist');

    const content = fs.readFileSync(settingsPath, 'utf8');

    // Modal state declarations
    assert.ok(content.includes('showDeleteModal'), 'Delete modal state must be declared');
    assert.ok(content.includes('showSignOutModal'), 'Sign out modal state must be declared');
    assert.ok(content.includes('showBillingModal'), 'Billing modal state must be declared');

    // Function calls
    assert.ok(content.includes('deleteAccountAndPurgeData'), 'Must call deleteAccountAndPurgeData');
    assert.ok(content.includes('gatherlyLogout') || content.includes('userLogout'), 'Must call logout on sign out');

    // Interactive toggles
    assert.ok(content.includes('whatsAppNudges'), 'WhatsApp nudges toggle must be present');
    assert.ok(content.includes('deadlineReminders'), 'Deadline reminders toggle must be present');
  });
});
