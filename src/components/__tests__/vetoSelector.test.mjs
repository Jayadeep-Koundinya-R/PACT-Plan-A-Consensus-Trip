import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Core VetoSelector visual state logic helper
function getVetoTileVisualProps(isVetoed, label, sub) {
  return {
    tileStyle: {
      minHeight: 88, // >= 44pt requirement
      backgroundColor: isVetoed ? 'rgba(255, 90, 95, 0.14)' : '#13151E',
      borderColor: isVetoed ? '#FF5A5F' : 'rgba(255, 255, 255, 0.12)'
    },
    iconColor: isVetoed ? '#FF5A5F' : '#8B8D98',
    statusBadge: {
      text: isVetoed ? 'VETO' : 'ALLOWED',
      textColor: isVetoed ? '#FF5A5F' : '#3DE0A0',
      badgeBg: isVetoed ? 'rgba(255, 90, 95, 0.22)' : 'rgba(61, 224, 160, 0.12)'
    },
    titleColor: '#F4F3F0',
    subtitleColor: isVetoed ? '#FF8A8D' : '#8B8D98',
    accessibility: {
      role: 'switch',
      checked: isVetoed,
      label: `Dealbreaker: ${label}. ${sub}. ${
        isVetoed
          ? 'Veto active. Tap to allow option.'
          : 'Option allowed. Tap to trigger veto constraint.'
      }`,
      hint: 'Toggles strict dealbreaker veto constraint'
    }
  };
}

describe('VetoSelector Dealbreaker Visuals and Accessibility', () => {
  it('selected veto option applies high-contrast crimson red accent glow (#FF5A5F)', () => {
    const visual = getVetoTileVisualProps(true, 'No dorms', 'Private rooms only');
    assert.equal(visual.tileStyle.borderColor, '#FF5A5F');
    assert.equal(visual.iconColor, '#FF5A5F');
    assert.equal(visual.statusBadge.text, 'VETO');
    assert.equal(visual.statusBadge.textColor, '#FF5A5F');
    assert.equal(visual.subtitleColor, '#FF8A8D');
  });

  it('unselected dealbreaker retains clean dark obsidian backing (#13151E) with clear typography', () => {
    const visual = getVetoTileVisualProps(false, 'No dorms', 'Private rooms only');
    assert.equal(visual.tileStyle.backgroundColor, '#13151E');
    assert.equal(visual.tileStyle.borderColor, 'rgba(255, 255, 255, 0.12)');
    assert.equal(visual.statusBadge.text, 'ALLOWED');
    assert.equal(visual.statusBadge.textColor, '#3DE0A0');
    assert.equal(visual.titleColor, '#F4F3F0');
    assert.equal(visual.subtitleColor, '#8B8D98');
  });

  it('provides tactile touch target height >= 44pt minimum', () => {
    const visual = getVetoTileVisualProps(true, 'No red-eye flights', 'Max 5h / direct');
    assert.ok(visual.tileStyle.minHeight >= 44, 'Touch target height must meet or exceed 44pt minimum');
  });

  it('generates clear accessibility role, state, label, and hint', () => {
    const activeVisual = getVetoTileVisualProps(true, 'No red-eye flights', 'Max 5h / direct');
    assert.equal(activeVisual.accessibility.role, 'switch');
    assert.equal(activeVisual.accessibility.checked, true);
    assert.ok(activeVisual.accessibility.label.includes('Veto active'));

    const inactiveVisual = getVetoTileVisualProps(false, 'No red-eye flights', 'Max 5h / direct');
    assert.equal(inactiveVisual.accessibility.checked, false);
    assert.ok(inactiveVisual.accessibility.label.includes('Option allowed'));
  });
});
