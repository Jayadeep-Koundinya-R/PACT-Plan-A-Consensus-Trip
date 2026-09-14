import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('LI clients contain no public Gemini key or direct Google endpoint', () => {
  const advisor = fs.readFileSync('src/lib/ai/aiAdvisorClient.ts', 'utf8');
  assert.equal(fs.existsSync('src/lib/ai/aiChatClient.ts'), false);

  assert.equal(advisor.includes('EXPO_PUBLIC_GEMINI_API_KEY'), false);
  assert.equal(advisor.includes('generativelanguage.googleapis.com'), false);
  assert.equal(advisor.includes('queryGeminiDirect'), false);
  assert.ok(advisor.includes("invoke('ai-advisor'"));
});
