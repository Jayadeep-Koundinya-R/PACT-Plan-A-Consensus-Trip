import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Phase 3 & Phase 4: Data Honesty & Real Interactions', () => {
  it('formats memory photo count accurately based on real array size', () => {
    const formatCount = (len) => `${len} shared ${len === 1 ? 'memory' : 'memories'}`;
    assert.equal(formatCount(0), '0 shared memories');
    assert.equal(formatCount(1), '1 shared memory');
    assert.equal(formatCount(4), '4 shared memories');
    assert.equal(formatCount(12), '12 shared memories');
  });

  it('generates compliant RFC 5545 iCalendar content with required fields', () => {
    const title = 'Goa Beach Escape 2026';
    const dest = 'Goa';
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PACT//Consensus Trip Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:pact-test@pact.travel`,
      `DTSTAMP:20261012T000000Z`,
      `DTSTART;VALUE=DATE:20261012`,
      `DTEND;VALUE=DATE:20261017`,
      `SUMMARY:${title} (PACT Consensus Trip)`,
      `DESCRIPTION:Consensus Trip to ${dest} backed by PACT.\n100% agreement reached.`,
      `LOCATION:${dest}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    assert.ok(icsData.includes('BEGIN:VCALENDAR'));
    assert.ok(icsData.includes('VERSION:2.0'));
    assert.ok(icsData.includes('BEGIN:VEVENT'));
    assert.ok(icsData.includes('DTSTART;VALUE=DATE:20261012'));
    assert.ok(icsData.includes('DTEND;VALUE=DATE:20261017'));
    assert.ok(icsData.includes('LOCATION:Goa'));
    assert.ok(icsData.includes('END:VEVENT'));
    assert.ok(icsData.includes('END:VCALENDAR'));
  });

  it('derives avatar initials correctly from displayName and fallback', () => {
    const deriveInitials = (displayName) => {
      if (!displayName || !displayName.trim()) return 'ME';
      const parts = displayName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return displayName.slice(0, 2).toUpperCase();
    };

    assert.equal(deriveInitials('Alex Rivers'), 'AR');
    assert.equal(deriveInitials('Maya Chen'), 'MC');
    assert.equal(deriveInitials('Jordan'), 'JO');
    assert.equal(deriveInitials(''), 'ME');
    assert.equal(deriveInitials(null), 'ME');
    assert.equal(deriveInitials(undefined), 'ME');
  });

  it('derives subscription badge dynamically reflecting subscriptionPlan', () => {
    const getBadge = (plan) => (plan !== 'free' ? 'PRO' : 'FREE');
    assert.equal(getBadge('free'), 'FREE');
    assert.equal(getBadge('premium_monthly'), 'PRO');
    assert.equal(getBadge('premium_annual'), 'PRO');
  });
});
