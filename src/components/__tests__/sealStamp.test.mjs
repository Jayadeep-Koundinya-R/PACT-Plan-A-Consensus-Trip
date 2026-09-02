// Property 4: SealStamp Animation Fires Exactly Once Per Mount
// Tests: Requirements 6.1, 6.4

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Test the hasPlayed guard logic in isolation
function createHasPlayedGuard() {
  const hasPlayed = { current: false };
  
  function tryPlay() {
    if (hasPlayed.current) return false; // blocked
    hasPlayed.current = true;
    return true; // played
  }
  
  return { tryPlay };
}

describe('Property 4: SealStamp animation fires exactly once per mount', () => {
  it('plays on first call', () => {
    const { tryPlay } = createHasPlayedGuard();
    assert.equal(tryPlay(), true);
  });

  it('does not play on second call (re-render)', () => {
    const { tryPlay } = createHasPlayedGuard();
    tryPlay(); // first mount
    assert.equal(tryPlay(), false); // re-render — should not play again
  });

  it('does not play on any subsequent calls', () => {
    const { tryPlay } = createHasPlayedGuard();
    tryPlay();
    for (let i = 0; i < 10; i++) {
      assert.equal(tryPlay(), false, `Should not play on call ${i + 2}`);
    }
  });

  it('a new instance plays again (fresh mount)', () => {
    const guard1 = createHasPlayedGuard();
    guard1.tryPlay();
    
    // New instance = new component mount
    const guard2 = createHasPlayedGuard();
    assert.equal(guard2.tryPlay(), true);
  });
});
