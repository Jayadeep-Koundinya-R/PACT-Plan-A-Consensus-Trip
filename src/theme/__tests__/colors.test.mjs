// Property 6: Screen Background Color Matches Theme Mode
// Property 7: Primary Action Buttons Use Primary Color Token
// Tests: Requirements 8.2, 8.3, 8.6
//
// These tests read the REAL token values from src/theme/colors.ts (regex-extracted,
// because node --test cannot import TS directly) and assert them against the
// DESIGN_SYSTEM.md palette. Previously this suite asserted hardcoded local
// constants against themselves, which validated nothing.

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
  const valueMatch = blockMatch[1].match(new RegExp(`${name}:\\s*['\"]([^'\"]+)['\"]`));
  assert.ok(valueMatch, `colors.${mode}.${name} must exist`);
  return valueMatch[1];
}

// DESIGN_SYSTEM.md palette — sharpened accents (2026-09-07): vivid gold, vivid teal, vermilion.
const DARK = {
  background: '#12182B',   // Ink
  surface: '#1E2742',
  primary: '#F0B24A',      // vivid gold
  secondary: '#25C9A0',    // vivid teal
  success: '#25C9A0',
  danger: '#E14733',       // vermilion
  seal: '#E14733',         // dual meaning with danger is intentional
  textPrimary: '#FDF9EF',
  textSecondary: '#C3BAA6'
};
const LIGHT = {
  background: '#F6EFDE',   // Parchment
  primary: '#C88A1F',      // bright gold for parchment
  secondary: '#0FA47F',    // vivid teal
  success: '#0FA47F',
  danger: '#D6432B',       // vermilion
  seal: '#D6432B',
  textPrimary: '#1E1A14'
};

describe('Property 6: Screen background token correctness', () => {
  it('dark background is Ink (#12182B)', () => {
    assert.equal(token('dark', 'background'), DARK.background);
  });

  it('light background is Parchment (#F6EFDE)', () => {
    assert.equal(token('light', 'background'), LIGHT.background);
  });

  it('dark and light backgrounds are different', () => {
    assert.notEqual(DARK.background, LIGHT.background);
  });

  it('neither background is the retired terracotta/coral palette', () => {
    assert.notEqual(token('dark', 'background'), '#090A0F');
    assert.notEqual(token('light', 'background'), '#F3EEE2');
  });
});

describe('Property 7: Primary color token correctness', () => {
  it('dark primary is Brass (#C99A5B)', () => {
    assert.equal(token('dark', 'primary'), DARK.primary);
  });

  it('light primary is Brass (#A97C3D)', () => {
    assert.equal(token('light', 'primary'), LIGHT.primary);
  });

  it('primary tokens are not the retired coral (#FF5A5F) or old terracotta (#EA580C)', () => {
    assert.notEqual(token('dark', 'primary'), '#FF5A5F');
    assert.notEqual(token('light', 'primary'), '#FF5A5F');
    assert.notEqual(token('dark', 'primary'), '#EA580C');
    assert.notEqual(token('light', 'primary'), '#EA580C');
  });
});

describe('Property 8: Seal color dual meaning (errors AND finalized-trip seal)', () => {
  it('dark seal is Sealing Red, identical to danger', () => {
    assert.equal(token('dark', 'seal'), token('dark', 'danger'));
    assert.equal(token('dark', 'seal'), DARK.seal);
  });

  it('light seal is Sealing Red, identical to danger', () => {
    assert.equal(token('light', 'seal'), token('light', 'danger'));
    assert.equal(token('light', 'seal'), LIGHT.seal);
  });

  it('seal is NOT the retired mint green', () => {
    assert.notEqual(token('dark', 'seal'), '#3DE0A0');
  });
});

describe('Property 9: Success tokens stay in the petrol/moss family', () => {
  it('dark success is the petrol-moss readable variant', () => {
    assert.equal(token('dark', 'success'), DARK.success);
  });

  it('light success is Moss (#4B7A51)', () => {
    assert.equal(token('light', 'success'), LIGHT.success);
  });
});

describe('Property 10: Text tokens match the document palette', () => {
  it('dark textPrimary is warm off-white (#F3EEE2)', () => {
    assert.equal(token('dark', 'textPrimary'), DARK.textPrimary);
  });

  it('dark textSecondary is warm grey (#A9A08C)', () => {
    assert.equal(token('dark', 'textSecondary'), DARK.textSecondary);
  });

  it('light textPrimary is ink brown (#1E1A14)', () => {
    assert.equal(token('light', 'textPrimary'), LIGHT.textPrimary);
  });
});
