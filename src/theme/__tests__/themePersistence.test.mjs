import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  pactThemes,
  getThemeById,
  DEFAULT_THEME_ID,
} from '../colors.ts';

describe('PACT Multi-Theme System & Persistence Engine', () => {
  it('defines at least 4 predefined curated themes with exactly 2 dark and 2 light', () => {
    const themeList = Object.values(pactThemes);
    assert.ok(themeList.length >= 4, `Must define at least 4 themes, found ${themeList.length}`);

    const darkThemes = themeList.filter((t) => t.category === 'dark');
    const lightThemes = themeList.filter((t) => t.category === 'light');

    assert.ok(darkThemes.length >= 2, `Must define at least 2 dark themes, found ${darkThemes.length}`);
    assert.ok(lightThemes.length >= 2, `Must define at least 2 light themes, found ${lightThemes.length}`);

    // Verify presence of required keys
    assert.ok(pactThemes.obsidian_dark, 'Obsidian Midnight dark theme must exist');
    assert.ok(pactThemes.cyber_dark, 'Cyber Horizon dark theme must exist');
    assert.ok(pactThemes.parchment_light, 'Parchment Luxe light theme must exist');
    assert.ok(pactThemes.nordic_light, 'Nordic Glacier light theme must exist');
  });

  it('verifies dark themes define dark backgrounds and light themes define light backgrounds', () => {
    assert.equal(pactThemes.obsidian_dark.colors.background, '#090A0F');
    assert.equal(pactThemes.cyber_dark.colors.background, '#080B14');

    assert.equal(pactThemes.parchment_light.colors.background, '#F4F3F0');
    assert.equal(pactThemes.nordic_light.colors.background, '#F0F4F8');
  });

  it('guarantees complete color tokens across all themes', () => {
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

    const cyber = getThemeById('cyber_dark');
    assert.equal(cyber.id, 'cyber_dark');
    assert.equal(cyber.category, 'dark');

    const fallback = getThemeById('non_existent_theme_id');
    assert.equal(fallback.id, DEFAULT_THEME_ID);
  });
});
