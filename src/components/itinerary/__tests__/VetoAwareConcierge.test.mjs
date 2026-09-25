import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getLocalConciergeFallback } from '../../../lib/ai/aiAdvisorClient.js';

describe('Veto-Aware AI Concierge (VetoAwareConcierge)', () => {
  test('getLocalConciergeFallback returns 3 anchors (Morning, Afternoon, Evening) for Goa, Manali, Puducherry, and generic destinations', () => {
    const resGoa = getLocalConciergeFallback('Goa');
    assert.equal(resGoa.anchors.length, 3, 'Must return 3 itinerary anchors');
    assert.equal(resGoa.anchors[0].timeOfDay, 'Morning');
    assert.equal(resGoa.anchors[1].timeOfDay, 'Afternoon');
    assert.equal(resGoa.anchors[2].timeOfDay, 'Evening');
    assert.ok(resGoa.anchors[0].satisfiedConstraintBadge.includes('Passed: Dietary Veto'), 'Includes shield clearance badge');

    const resKyoto = getLocalConciergeFallback('Kyoto');
    assert.equal(resKyoto.anchors.length, 3, 'Generic fallback returns 3 anchors');
    assert.ok(resKyoto.anchors[0].venueName.includes('Kyoto'), 'Generic fallback adapts to destination name');
  });

  test('Privacy Guard: Concierge result payload contains ZERO member names or individual preference rows', () => {
    const res = getLocalConciergeFallback('Goa');
    const jsonText = JSON.stringify(res);

    assert.equal(jsonText.includes('Maya'), false, 'Must not expose member names like Maya');
    assert.equal(jsonText.includes('Jake'), false, 'Must not expose member names like Jake');
    assert.equal(jsonText.includes('Priya'), false, 'Must not expose member names like Priya');
    assert.equal(jsonText.includes('email'), false, 'Must not expose email addresses');
  });

  test('VetoAwareConcierge component source code verifies clearance shield badges and loading skeleton', () => {
    const componentPath = path.join(process.cwd(), 'src/components/itinerary/VetoAwareConcierge.tsx');
    assert.ok(fs.existsSync(componentPath), 'VetoAwareConcierge.tsx component file must exist');

    const code = fs.readFileSync(componentPath, 'utf8');
    assert.ok(code.includes('Veto-Aware AI Concierge'), 'Displays Veto-Aware AI Concierge header');
    assert.ok(code.includes('Sealed Veto Clearance'), 'Displays Sealed Veto Clearance badge');
    assert.ok(code.includes('satisfiedConstraintBadge'), 'Renders green constraint clearance shield badges');
    assert.ok(code.includes('ActivityIndicator'), 'Includes loading indicator state');
  });
});
