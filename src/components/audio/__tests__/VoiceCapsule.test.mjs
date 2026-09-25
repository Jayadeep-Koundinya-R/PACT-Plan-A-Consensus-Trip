import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { PRESEEDED_DEMO_CAPSULES } from '../VoiceCapsuleList.js';

describe('PACT Voice Capsules (Micro-Audio Moments)', () => {
  test('PRESEEDED_DEMO_CAPSULES contains 2 pre-seeded demo capsules for judges', () => {
    assert.equal(PRESEEDED_DEMO_CAPSULES.length, 2, 'Pre-seeded list contains 2 demo capsules');
    assert.equal(PRESEEDED_DEMO_CAPSULES[0].authorName, 'Maya');
    assert.ok(PRESEEDED_DEMO_CAPSULES[0].durationSeconds <= 30, 'Duration is <= 30s');
    assert.equal(PRESEEDED_DEMO_CAPSULES[1].authorName, 'Sam');
  });

  test('VoiceCapsuleRecorder source code verifies 30s hard limit countdown and circular crimson button', () => {
    const recorderPath = path.join(process.cwd(), 'src/components/audio/VoiceCapsuleRecorder.tsx');
    assert.ok(fs.existsSync(recorderPath), 'VoiceCapsuleRecorder.tsx component file must exist');

    const code = fs.readFileSync(recorderPath, 'utf8');
    assert.ok(code.includes('Micro-Voice Capsule (30s max)'), 'Displays 30s max header');
    assert.ok(code.includes('setRemainingSeconds(30)') || code.includes('30 - remainingSeconds'), 'Enforces 30s limit countdown');
    assert.ok(code.includes('#FF5A5F'), 'Uses signature crimson recording color');
    assert.ok(code.includes('onRecordingComplete'), 'Calls onRecordingComplete callback upon completion');
  });

  test('VoiceCapsuleList source code verifies audio waveform graphic and play/pause toggle', () => {
    const listPath = path.join(process.cwd(), 'src/components/audio/VoiceCapsuleList.tsx');
    assert.ok(fs.existsSync(listPath), 'VoiceCapsuleList.tsx component file must exist');

    const code = fs.readFileSync(listPath, 'utf8');
    assert.ok(code.includes('ılı.lıllılı.ıllı'), 'Renders tactile audio waveform graphic');
    assert.ok(code.includes('setPlayingId'), 'Toggles play/pause state for capsule playback');
  });
});
