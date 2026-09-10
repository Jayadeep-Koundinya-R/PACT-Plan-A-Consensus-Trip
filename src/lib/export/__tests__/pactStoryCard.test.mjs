import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateStorySharePayload } from '../pactStoryCard.ts';

describe('Cryptographic Sealed Pact Story Card & Viral Export', () => {
  it('generates viral story payload with destination, dates, and zero budget leaks', () => {
    const details = {
      circleName: 'Goa Boys 2026',
      winnerDestination: 'Goa Coastal Villa',
      dates: 'Oct 15 - 18, 2026',
      memberCount: 5,
      perPersonBudget: 550,
      currency: '$',
      sealHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    const payload = generateStorySharePayload(details);

    assert.ok(payload.title.includes('Goa Coastal Villa'));
    assert.ok(payload.caption.includes('📍 Goa Coastal Villa'));
    assert.ok(payload.caption.includes('5 Confirmed Friends'));
    assert.ok(payload.caption.includes('$550/person'));
    assert.ok(payload.caption.includes('SHA-256 Seal: e3b0c44298...'));
    assert.ok(payload.hashtags.includes('#PlanAConsensusTrip'));
  });

  it('handles missing currency or seal gracefully with sensible defaults', () => {
    const details = {
      circleName: 'Friends',
      winnerDestination: 'Coorg',
      dates: 'Nov 1 - 4',
      memberCount: 3,
      perPersonBudget: 400,
    };

    const payload = generateStorySharePayload(details);
    assert.ok(payload.caption.includes('$400/person'));
    assert.ok(payload.caption.includes('Cryptographically Sealed'));
  });
});
