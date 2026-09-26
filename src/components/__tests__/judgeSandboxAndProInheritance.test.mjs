import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 1 & 2: Judge Sandbox Bar, Persona Switcher & Pro Circle Inheritance UX', () => {
  const rootDir = process.cwd();
  const judgeBarContent = fs.readFileSync(path.join(rootDir, 'src/components/JudgeSandboxBar.tsx'), 'utf8');
  const proCardContent = fs.readFileSync(path.join(rootDir, 'src/components/ProCircleInheritanceCard.tsx'), 'utf8');
  const hubContent = fs.readFileSync(path.join(rootDir, 'app/circle/[id]/hub.tsx'), 'utf8');
  const ballotContent = fs.readFileSync(path.join(rootDir, 'app/circle/[id]/silent-ballot.tsx'), 'utf8');
  const matrixContent = fs.readFileSync(path.join(rootDir, 'app/circle/[id]/ranked-matrix.tsx'), 'utf8');
  const paywallContent = fs.readFileSync(path.join(rootDir, 'app/paywall.tsx'), 'utf8');

  test('JudgeSandboxBar defines all 5 test traveler personas with clear roles', () => {
    assert.ok(judgeBarContent.includes("'user-maya-001'"), 'Must include Maya');
    assert.ok(judgeBarContent.includes("'user-jake-002'"), 'Must include Jake');
    assert.ok(judgeBarContent.includes("'user-priya-003'"), 'Must include Priya');
    assert.ok(judgeBarContent.includes("'user-alex-004'"), 'Must include Alex');
    assert.ok(judgeBarContent.includes("'user-sam-005'"), 'Must include Sam');
    assert.ok(judgeBarContent.includes('JUDGE SANDBOX'), 'Must display JUDGE SANDBOX badge');
  });

  test('JudgeSandboxBar includes 1-click Consensus fast-forward and Teleprompter script modal', () => {
    assert.ok(judgeBarContent.includes('setDemoScenario(\'consensus\')'), 'Must trigger consensus scenario');
    assert.ok(judgeBarContent.includes('DemoScriptModal'), 'Must integrate pitch teleprompter modal');
    assert.ok(judgeBarContent.includes('loadDemoCircle'), 'Must support demo reset');
  });

  test('ProCircleInheritanceCard clearly highlights RevenueCat Pro Circle status and perks', () => {
    assert.ok(proCardContent.includes('PRO CIRCLE INHERITANCE'), 'Must display Pro Circle Inheritance title');
    assert.ok(proCardContent.includes('RevenueCat Active'), 'Must display RevenueCat Active badge');
    assert.ok(proCardContent.includes('24-Member Cap'), 'Must list 24-Member Cap perk');
    assert.ok(proCardContent.includes('AI Whisperer'), 'Must list AI Whisperer perk');
    assert.ok(proCardContent.includes('Guest Pro Pass'), 'Must list Guest Pro Pass perk');
    assert.ok(proCardContent.includes('Upgrade Pass'), 'Must provide upgrade button when not Pro');
  });

  test('Circle Hub mounts JudgeSandboxBar and ProCircleInheritanceCard', () => {
    assert.ok(hubContent.includes('<JudgeSandboxBar'), 'Hub must mount JudgeSandboxBar');
    assert.ok(hubContent.includes('<ProCircleInheritanceCard'), 'Hub must mount ProCircleInheritanceCard');
    assert.ok(hubContent.includes('Pro Guest'), 'Hub member list must display Pro Guest badge');
  });

  test('Silent Ballot and Ranked Matrix mount JudgeSandboxBar for multi-persona evaluation', () => {
    assert.ok(ballotContent.includes('<JudgeSandboxBar'), 'Silent Ballot must mount JudgeSandboxBar');
    assert.ok(matrixContent.includes('<JudgeSandboxBar'), 'Ranked Matrix must mount JudgeSandboxBar');
  });

  test('Paywall includes 1-tap Judge Sandbox Pro Unlock button', () => {
    assert.ok(paywallContent.includes('handleSimulateJudgePro'), 'Paywall must define handleSimulateJudgePro');
    assert.ok(paywallContent.includes('Judge Sandbox: 1-Tap Unlock Pro'), 'Paywall must display sandbox unlock button');
    assert.ok(paywallContent.includes('setCircleProStatus'), 'Paywall must set circle pro status on activation');
  });
});
