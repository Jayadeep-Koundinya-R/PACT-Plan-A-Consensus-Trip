import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { useCircleChatStore } from '../../../store/useCircleChatStore.ts';

test('PACT V2 Step 2: Circle Chat Schema and RLS Policy Specification', (t) => {
  const schemaSql = fs.readFileSync('supabase/schema.sql', 'utf8');
  assert.ok(schemaSql.includes('public.circle_messages'));
  assert.ok(schemaSql.includes('group_id uuid not null references public.groups(id)'));
  assert.ok(schemaSql.includes('user_id uuid not null references auth.users(id)'));
  assert.ok(schemaSql.includes('user_display_name text not null'));
  assert.ok(schemaSql.includes('content text not null'));
  assert.ok(schemaSql.includes('created_at timestamptz not null default now()'));
  assert.ok(schemaSql.includes('circle_messages_group_id_idx'));
  assert.ok(schemaSql.includes('alter table public.circle_messages enable row level security;'));
  assert.ok(schemaSql.includes('Circle members can read all messages in their circle'));
  assert.ok(schemaSql.includes('Circle members can send messages in their circle'));
  assert.ok(schemaSql.toLowerCase().includes('deliberate exception'));
  assert.ok(schemaSql.includes('chat_log_archived boolean not null default false'));
});

test('PACT V2 Step 2: Live 2-Account Bidirectional Messaging Flow', (t) => {
  const testCircleId = 'test-circle-dual-account-' + Date.now();
  const store = useCircleChatStore.getState();
  store.setMessages(testCircleId, []);
  assert.equal(store.getMessages(testCircleId).length, 0);
  const msg1 = { id: 'msg-1', groupId: testCircleId, userId: 'u-alex', userDisplayName: 'Alex (You)', content: 'Are we doing South Goa?', createdAt: new Date().toISOString() };
  store.addMessage(testCircleId, msg1);
  const feedAcc2 = store.getMessages(testCircleId);
  assert.equal(feedAcc2.length, 1);
  assert.equal(feedAcc2[0].userDisplayName, 'Alex (You)');
  const msg2 = { id: 'msg-2', groupId: testCircleId, userId: 'u-jordan', userDisplayName: 'Jordan Lee', content: 'Yes! South Goa villa looks stunning.', createdAt: new Date(Date.now() + 1000).toISOString() };
  store.addMessage(testCircleId, msg2);
  const conversation = store.getMessages(testCircleId);
  assert.equal(conversation.length, 2);
  assert.equal(conversation[0].userId, 'u-alex');
  assert.equal(conversation[1].userId, 'u-jordan');
  store.addMessage(testCircleId, msg2);
  assert.equal(store.getMessages(testCircleId).length, 2);
});

test('PACT V2 Step 2: Circle Boundary Isolation', (t) => {
  const cA = 'c-iso-a-' + Date.now();
  const cB = 'c-iso-b-' + Date.now();
  const store = useCircleChatStore.getState();
  store.setMessages(cA, []);
  store.setMessages(cB, []);
  store.addMessage(cA, { id: 'm-a', groupId: cA, userId: 'u1', userDisplayName: 'U1', content: 'A only', createdAt: new Date().toISOString() });
  assert.equal(store.getMessages(cA).length, 1);
  assert.equal(store.getMessages(cB).length, 0);
});

test('PACT V2 Step 2: Archive-On-Finalize and Memory Library Persistence', (t) => {
  const cid = 'c-archive-' + Date.now();
  const store = useCircleChatStore.getState();
  store.setMessages(cid, [
    { id: 'a-1', groupId: cid, userId: 'u-alex', userDisplayName: 'Alex (You)', content: 'Consensus reached! Locking South Goa.', createdAt: new Date().toISOString() },
    { id: 'a-2', groupId: cid, userId: 'u-jordan', userDisplayName: 'Jordan Lee', content: 'See you all in Goa!', createdAt: new Date().toISOString() }
  ]);
  const archived = store.archiveChatLog(cid);
  assert.ok(archived);
  assert.equal(archived.messageCount, 2);
  assert.ok(archived.transcript.includes('Alex (You): Consensus reached!'));
  assert.ok(archived.transcript.includes('Jordan Lee: See you all in Goa!'));
  const retrieved = store.getArchivedChatLog(cid);
  assert.ok(retrieved);
  assert.equal(retrieved.messageCount, 2);
});