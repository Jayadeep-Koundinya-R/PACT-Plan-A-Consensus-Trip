// Property 6: Screen Background Color Matches Theme Mode
// Property 7: Primary Action Buttons Use Primary Color Token
// Tests: Requirements 8.2, 8.3, 8.6
//
// These tests read the REAL token values from src/theme/colors.ts (regex-extracted,
// because node --test cannot import TS directly) and assert them against the
// restored original palette: Base #090A0F, Card #13151E, Coral #FF5A5F, Emerald #3DE0A0,
// Gold #D4AF37, Amber #F59E0B, Danger #EF4444.

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const colorsSrc = fs.readFileSync(
  path.resolve(__dirname, '../colors.ts'),
  'utf8'
);

/** Extract a token value from the dark or light block of colors.ts. */
function token(mode, name) {
  const blockMatch = colorsSrc.match(new RegExp(`${mode}:\\s*\\{([\\s\\S]*?)\\n  \\}`));
  assert.ok(blockMatch, `colors.ts must contain a ${mode} block`);
  const valueMatch = blockMatch[1].match(new RegExp(`${name}:\\s*['"]([^'"]+)['"]`));
  assert.ok(valueMatch, `colors.${mode}.${name} must exist`);
  return valueMatch[1];
}

// Canonical original palette
const DARK = {
  background: '#090A0F',   // Base
  card: '#13151E',         // Card
  surface: '#13151E',
  primary: '#FF5A5F',      // Coral
  secondary: '#3DE0A0',    // Emerald
  success: '#3DE0A0',      // Emerald
  warning: '#F59E0B',      // Amber
  gold: '#D4AF37',         // Gold
  danger: '#EF4444',       // Danger
  seal: '#3DE0A0',
  textPrimary: '#F4F3F0',
  textSecondary: '#8B8D98'
};
const LIGHT = {
  background: '#F4F3F0',
  primary: '#FF5A5F',      // Coral
  secondary: '#16A34A',
  success: '#16A34A',
  warning: '#D97706',
  gold: '#B45309',
  danger: '#DC2626',
  seal: '#16A34A',
  textPrimary: '#090A0F'
};

describe('Property 6: Screen background token correctness', () => {
  it('dark background is Base (#090A0F)', () => {
    assert.equal(token('dark', 'background'), DARK.background);
  });

  it('dark card is Card (#13151E)', () => {
    assert.equal(token('dark', 'card'), DARK.card);
  });

  it('light background is #F4F3F0', () => {
    assert.equal(token('light', 'background'), LIGHT.background);
  });

  it('dark and light backgrounds are different', () => {
    assert.notEqual(DARK.background, LIGHT.background);
  });

  it('neither background is the retired Ink & Brass palette', () => {
    assert.notEqual(token('dark', 'background'), '#12182B');
    assert.notEqual(token('light', 'background'), '#F6EFDE');
  });
});

describe('Property 7: Primary color token correctness', () => {
  it('dark primary is Coral (#FF5A5F)', () => {
    assert.equal(token('dark', 'primary'), DARK.primary);
  });

  it('light primary is Coral (#FF5A5F)', () => {
    assert.equal(token('light', 'primary'), LIGHT.primary);
  });

  it('primary tokens are Coral (#FF5A5F), not brass (#C99A5B or #F0B24A)', () => {
    assert.notEqual(token('dark', 'primary'), '#C99A5B');
    assert.notEqual(token('light', 'primary'), '#A97C3D');
    assert.notEqual(token('dark', 'primary'), '#F0B24A');
    assert.notEqual(token('light', 'primary'), '#C88A1F');
  });
});

describe('Property 8: Seal color token correctness', () => {
  it('dark seal is Emerald (#3DE0A0)', () => {
    assert.equal(token('dark', 'seal'), DARK.seal);
  });

  it('light seal is #16A34A', () => {
    assert.equal(token('light', 'seal'), LIGHT.seal);
  });

  it('seal is Emerald, NOT the retired vermilion / sealing red (#E14733 or #C1503F)', () => {
    assert.notEqual(token('dark', 'seal'), '#E14733');
    assert.notEqual(token('dark', 'seal'), '#C1503F');
  });
});

describe('Property 9: Success tokens stay in the Emerald family', () => {
  it('dark success is Emerald (#3DE0A0)', () => {
    assert.equal(token('dark', 'success'), DARK.success);
  });

  it('dark secondary is Emerald (#3DE0A0)', () => {
    assert.equal(token('dark', 'secondary'), DARK.secondary);
  });

  it('dark warning is Amber (#F59E0B)', () => {
    assert.equal(token('dark', 'warning'), DARK.warning);
  });

  it('dark gold is Gold (#D4AF37)', () => {
    assert.equal(token('dark', 'gold'), DARK.gold);
  });
});

describe('Property 10: Text and danger tokens match the original palette', () => {
  it('dark danger is Danger (#EF4444)', () => {
    assert.equal(token('dark', 'danger'), DARK.danger);
  });

  it('dark textPrimary is #F4F3F0', () => {
    assert.equal(token('dark', 'textPrimary'), DARK.textPrimary);
  });

  it('dark textSecondary is #8B8D98', () => {
    assert.equal(token('dark', 'textSecondary'), DARK.textSecondary);
  });

  it('light textPrimary is ink black (#090A0F)', () => {
    assert.equal(token('light', 'textPrimary'), LIGHT.textPrimary);
  });
});
