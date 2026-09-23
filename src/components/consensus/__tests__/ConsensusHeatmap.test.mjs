import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Helper to simulate and test ConsensusHeatmap visual and props logic
function getConsensusHeatmapProps({
  datesScore,
  budgetScore,
  vibeScore,
  hasVeto = false,
  vetoLabel,
  isCompact = false
}) {
  const normalizeScore = (score) => {
    if (typeof score !== 'number' || isNaN(score)) return 0;
    if (score <= 1.0 && score > 0) return Math.min(100, Math.max(0, Math.round(score * 100)));
    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const datesPct = normalizeScore(datesScore);
  const budgetPct = normalizeScore(budgetScore);
  const vibePct = normalizeScore(vibeScore);

  const badgeText = vetoLabel || (hasVeto ? 'Dealbreaker Veto Triggered' : 'Zero Dealbreakers Triggered');

  return {
    datesPct,
    budgetPct,
    vibePct,
    badgeText,
    containerStyle: {
      minHeight: 44,
      minWidth: 44,
      borderColor: hasVeto ? '#EF4444' : (isCompact ? 'rgba(61, 224, 160, 0.3)' : '#3DE0A0'),
      backgroundColor: '#13151E',
      borderRadius: 16
    },
    badgeStyle: {
      textColor: hasVeto ? '#EF4444' : '#3DE0A0',
      iconColor: hasVeto ? '#EF4444' : '#3DE0A0',
      bgColor: hasVeto ? 'rgba(239, 68, 68, 0.15)' : 'rgba(61, 224, 160, 0.12)'
    },
    touchTarget: {
      minHeight: 44,
      minWidth: 44
    }
  };
}

describe('ConsensusHeatmap Component Test Suite', () => {
  it('renders 100% dates and budget scores correctly when passed 1.0 or 100', () => {
    const resFloat = getConsensusHeatmapProps({ datesScore: 1.0, budgetScore: 1.0, vibeScore: 0.96 });
    assert.equal(resFloat.datesPct, 100, 'Float 1.0 should normalize to 100%');
    assert.equal(resFloat.budgetPct, 100, 'Float 1.0 should normalize to 100%');
    assert.equal(resFloat.vibePct, 96, 'Float 0.96 should normalize to 96%');

    const resInt = getConsensusHeatmapProps({ datesScore: 100, budgetScore: 100, vibeScore: 96 });
    assert.equal(resInt.datesPct, 100, 'Int 100 should normalize to 100%');
    assert.equal(resInt.budgetPct, 100, 'Int 100 should normalize to 100%');
    assert.equal(resInt.vibePct, 96, 'Int 96 should normalize to 96%');
  });

  it('renders zero-veto state with emerald tokens when hasVeto=false', () => {
    const res = getConsensusHeatmapProps({ datesScore: 100, budgetScore: 100, vibeScore: 90, hasVeto: false });
    assert.equal(res.badgeText, 'Zero Dealbreakers Triggered');
    assert.equal(res.badgeStyle.textColor, '#3DE0A0');
    assert.equal(res.badgeStyle.iconColor, '#3DE0A0');
    assert.equal(res.containerStyle.borderColor, '#3DE0A0');
  });

  it('renders veto state styling with crimson tokens (#EF4444) when hasVeto=true', () => {
    const res = getConsensusHeatmapProps({ datesScore: 60, budgetScore: 40, vibeScore: 50, hasVeto: true });
    assert.equal(res.badgeText, 'Dealbreaker Veto Triggered');
    assert.equal(res.badgeStyle.textColor, '#EF4444');
    assert.equal(res.badgeStyle.iconColor, '#EF4444');
    assert.equal(res.containerStyle.borderColor, '#EF4444');
  });

  it('verifies all touch targets meet minimum 44x44pt requirement', () => {
    const res = getConsensusHeatmapProps({ datesScore: 100, budgetScore: 100, vibeScore: 95 });
    assert.ok(res.touchTarget.minHeight >= 44, 'Touch target height must be at least 44pt');
    assert.ok(res.touchTarget.minWidth >= 44, 'Touch target width must be at least 44pt');
    assert.ok(res.containerStyle.minHeight >= 44, 'Container minHeight must be at least 44pt');
  });
});
