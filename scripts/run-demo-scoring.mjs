import { calculateConsensus } from '../src/lib/consensus/engine.js';
import { DEMO_MEMBERS, DEMO_TRIP_OPTIONS, DEMO_GROUP_ID } from '../src/lib/consensus/seedData.js';

console.log('\n' + '='.repeat(70));
console.log('🚀 PACT — PLAN A CONSENSUS TRIP (VALIDATION RUNNER)');
console.log('Shipathon 2026 (RevenueCat) — Next Gen Award');
console.log('='.repeat(70) + '\n');

console.log(`Evaluating Group: "${DEMO_GROUP_ID}"`);
console.log(`Active Responding Members (${DEMO_MEMBERS.length}):`);
DEMO_MEMBERS.forEach((m, idx) => {
  const dates = m.dateRanges.map((d) => `${d.start} -> ${d.end}`).join(' | ');
  const dbs = m.dealbreakers?.length ? m.dealbreakers.join(', ') : 'None';
  console.log(
    `  ${idx + 1}. ${m.userName.padEnd(8)} | Budget: $${m.budgetMin}-$${m.budgetMax} | Dates: ${dates} | Tags: [${m.tags.join(', ')}] | Dealbreakers: [${dbs}]`
  );
});

console.log('\nEvaluating Candidate Options:');
DEMO_TRIP_OPTIONS.forEach((opt, idx) => {
  console.log(
    `  [${idx + 1}] ${opt.name.padEnd(25)} | $${opt.budgetPerPerson}/person | ${opt.dateStart} -> ${opt.dateEnd} | [${opt.tags.join(', ')}]`
  );
});

const result = calculateConsensus(
  DEMO_GROUP_ID,
  5,
  DEMO_TRIP_OPTIONS,
  DEMO_MEMBERS
);

console.log('\n' + '-'.repeat(70));
console.log('📊 DETERMINISTIC RANKING RESULTS');
console.log('-'.repeat(70));

result.rankedOptions.forEach((r) => {
  const isWinner = r.rank === 1 && result.consensusReached;
  const badge = isWinner ? '🏆 WINNER' : `#${r.rank}`;
  console.log(`\n${badge}: ${r.option.name} (${r.option.destinationType})`);
  console.log(`   Total Score:       ${r.totalScore}%`);
  console.log(`   Consensus Meter:   ${r.consensusPercent}% support`);
  console.log(`   Affordability:     ${r.budgetGapFlag ? '⚠️ BUDGET GAP FLAGGED' : '✅ Budget Viable'}`);
  console.log(`   Plain English:     "${r.plainEnglishReason}"`);
  console.log('   Member Breakdown:');
  r.memberBreakdowns.forEach((m) => {
    const status = m.isViable ? '✅' : '❌';
    const reason = m.dealbreakerHit
      ? `[DEALBREAKER: ${m.dealbreakerReason}]`
      : `Date: ${(m.dateScore * 100).toFixed(0)}%, Budget: ${(m.budgetScore * 100).toFixed(0)}%, Tags: ${(m.tagScore * 100).toFixed(0)}%`;
    console.log(
      `     ${status} ${m.userName.padEnd(8)} -> Score: ${(m.memberScore * 100).toFixed(1)}% | ${reason}`
    );
  });
});

console.log('\n' + '='.repeat(70));
console.log(`🎯 Consensus Status: ${result.consensusReached ? '✅ REACHED' : '⚠️ DEADLOCK'}`);
if (result.winningOption) {
  console.log(`🌟 Selected Destination: ${result.winningOption.option.name} (${result.winningOption.totalScore}% score)`);
} else {
  console.log(`⚠️ Diagnosis: ${result.deadlockDiagnosis.diagnosisText}`);
  console.log('💡 Organizer Recommendations:');
  result.deadlockDiagnosis.organizerSuggestions.forEach((s) => console.log(`   - ${s}`));
}
console.log('='.repeat(70) + '\n');
