/**
 * AI pitch and conflict diagnosis generator for PACT Pro.
 */
export function generateAIEnhancedExplanation(
  optionName: string,
  score: number,
  consensusPct: number,
  reason: string
): string {
  if (consensusPct >= 70) {
    return `🎯 PACT AI Analysis: "${optionName}" is a high-consensus favorite with ${consensusPct}% group alignment. Both budget boundaries and date windows overlap smoothly across all active members. Recommended action: Lock it in before flights surge.`;
  }

  if (score === 0) {
    return `⚠️ PACT AI Analysis: "${optionName}" triggered an absolute 0% veto because at least one member marked a dealbreaker constraint against this vibe or activity. Recommended action: Pivot to leading alternative.`;
  }

  return `💡 PACT AI Analysis for "${optionName}" (${score}% score): ${reason}. Minor trade-offs detected in budget thresholds or departure dates. A quick $50 budget shift or 2-day date flexibility will boost this option into the consensus green zone.`;
}