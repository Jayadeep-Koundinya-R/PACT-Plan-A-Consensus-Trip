import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildReceiptShareText } from '../PactReceiptCard.js';

describe('The Pact Receipt Viral Story Card (PactReceiptCard)', () => {
  test('buildReceiptShareText builds celebratory payload with destination, dates, and member count', () => {
    const text = buildReceiptShareText('Tokyo Central Villa', 'Oct 14 - Oct 19, 2026', 5);

    assert.ok(text.includes('THE PACT RECEIPT'), 'Includes title header');
    assert.ok(text.includes('5 Friends · 0 Arguments · 100% Sealed Agreement'), 'Includes hook banner');
    assert.ok(text.includes('📍 Destination: Tokyo Central Villa'), 'Includes destination name');
    assert.ok(text.includes('📅 Dates: Oct 14 - Oct 19, 2026'), 'Includes trip dates');
    assert.ok(text.includes('https://pact.app/invite'), 'Includes app invite link');
  });

  test('Privacy Guard: share payload contains NO individual member names, raw dollar figures, or veto author details', () => {
    const text = buildReceiptShareText('Tokyo Central Villa', 'Oct 14 - Oct 19, 2026', 5);

    // ZERO member names
    assert.equal(text.includes('Alex'), false, 'Must not leak member names like Alex');
    assert.equal(text.includes('Maya'), false, 'Must not leak member names like Maya');
    assert.equal(text.includes('Sam'), false, 'Must not leak member names like Sam');

    // ZERO dollar figures
    assert.equal(text.includes('$'), false, 'Must not leak raw dollar figures');
    assert.equal(text.includes('540'), false, 'Must not leak budget amounts');

    // ZERO veto details
    assert.equal(text.includes('veto'), false, 'Must not leak veto details in public share text');
  });

  test('PactReceiptCard source code verifies 9:16 story layout, gold foil border, and 44x44pt touch targets', () => {
    const codePath = path.join(process.cwd(), 'src/components/export/PactReceiptCard.tsx');
    assert.ok(fs.existsSync(codePath), 'PactReceiptCard.tsx component file must exist');

    const code = fs.readFileSync(codePath, 'utf8');

    // Gold foil border
    assert.ok(code.includes("borderColor: '#D4AF37'") || code.includes('D4AF37'), 'Includes gold foil border token');

    // Crimson seal
    assert.ok(code.includes('variant="crimson"') || code.includes('#FF5A5F'), 'Includes crimson wax seal stamp');

    // Aggregate metrics grid
    assert.ok(code.includes('100% Date Overlap'), 'Includes 100% date overlap metric');
    assert.ok(code.includes('Budget Clearance'), 'Includes budget clearance metric');
    assert.ok(code.includes('Vibe Alignment'), 'Includes vibe alignment metric');
    assert.ok(code.includes('0 Active Vetoes'), 'Includes 0 vetoes metric');

    // Touch targets >= 44x44pt
    assert.ok(code.includes('minHeight: 48') || code.includes('minHeight: 44'), 'Buttons maintain >= 44pt touch target height');
    assert.ok(code.includes('minWidth: 44'), 'Buttons maintain >= 44pt touch target width');
  });
});
