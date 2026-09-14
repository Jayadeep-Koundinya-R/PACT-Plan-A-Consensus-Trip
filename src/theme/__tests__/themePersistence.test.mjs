import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  pactThemes,
  getThemeById,
  DEFAULT_THEME_ID,
} from '../colors.ts';

describe('PACT Canonical Theme & Persistence Engine', () => {
  it('defines Obsidian Midnight as the canonical theme and locks to obsidian_dark', () => {
    assert.ok(pactThemes.obsidian_dark, 'Obsidian Midnight dark theme must exist');
    assert.equal(pactThemes.obsidian_dark.category, 'dark');
    assert.equal(DEFAULT_THEME_ID, 'obsidian_dark');
    assert.equal(pactThemes.obsidian_dark.colors.background, '#090A0F');
    assert.equal(pactThemes.obsidian_dark.colors.primary, '#FF5A5F');
    assert.equal(pactThemes.obsidian_dark.colors.seal, '#3DE0A0');
  });

  it('guarantees complete color tokens across the theme', () => {
    const requiredKeys = ['background', 'surface', 'card', 'primary', 'secondary', 'seal', 'border'];
    Object.values(pactThemes).forEach((themeDef) => {
      requiredKeys.forEach((key) => {
        assert.ok(
          themeDef.colors[key],
          `Theme ${themeDef.id} must define color token "${key}"`
        );
      });
    });
  });

  it('getThemeById resolves valid themes and falls back to default on invalid ID', () => {
    const obsidian = getThemeById('obsidian_dark');
    assert.equal(obsidian.id, 'obsidian_dark');
    assert.equal(obsidian.category, 'dark');

    const fallback = getThemeById('non_existent_theme_id');
    assert.equal(fallback.id, DEFAULT_THEME_ID);
  });
});
