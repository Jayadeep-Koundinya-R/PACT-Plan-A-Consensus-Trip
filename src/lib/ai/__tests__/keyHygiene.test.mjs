import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('AI clients contain no public Gemini key or direct Google endpoint', () => {
  const advisor = fs.readFileSync('src/lib/ai/aiAdvisorClient.ts', 'utf8');
  const chat = fs.readFileSync('src/lib/ai/aiChatClient.ts', 'utf8');
  const combined = `${advisor}\n${chat}`;

  assert.equal(combined.includes('EXPO_PUBLIC_GEMINI_API_KEY'), false);
  assert.equal(combined.includes('generativelanguage.googleapis.com'), false);
  assert.equal(combined.includes('queryGeminiDirect'), false);
  assert.ok(chat.includes("action: 'chat'"));
  assert.ok(advisor.includes("invoke('ai-advisor'"));
});
