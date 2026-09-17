import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fetchDestinationStory, getLocalStoryFallback } from '../../ai/aiAdvisorClient.ts';
import { fetchPlaceRecommendations, VERIFIED_REAL_PLACES } from '../../places/placeRecommendationsClient.ts';

test('PACT V2 Step 4: AI Storytelling Engine returns vivid, non-generic history and cultural lore', async (t) => {
  // Test Goa
  const storyGoa = await fetchDestinationStory('Goa');
  assert.ok(storyGoa, 'Goa story result must exist');
  assert.ok(storyGoa.story.length > 80, 'Story text must be conversational and detailed');
  assert.ok(storyGoa.story.toLowerCase().includes('portuguese') || storyGoa.story.toLowerCase().includes('susegad'), 'Goa story includes authentic Goan heritage');
  assert.ok(storyGoa.culturalTip && storyGoa.culturalTip.length > 20, 'Cultural tip must be informative');
  assert.ok(storyGoa.historicalContext && storyGoa.historicalContext.length > 20, 'Historical context must be informative');
  assert.equal(storyGoa.destination, 'Goa');

  // Strict PRD verification: NEVER invent fake usage statistics
  assert.ok(!storyGoa.story.includes('used PACT'), 'Story must NEVER fabricate PACT usage statistics');
  assert.ok(!storyGoa.culturalTip.includes('used PACT'), 'Tip must NEVER fabricate PACT usage statistics');

  // Test Puducherry
  const storyPud = await fetchDestinationStory('Puducherry');
  assert.ok(storyPud.story.toLowerCase().includes('french') || storyPud.story.toLowerCase().includes('white town'), 'Puducherry story captures French-Tamil essence');
  assert.ok(storyPud.culturalTip.toLowerCase().includes('quiet') || storyPud.culturalTip.toLowerCase().includes('bicycle'), 'Puducherry cultural tip is authentic');

  // Test Manali
  const storyManali = await fetchDestinationStory('Manali');
  assert.ok(storyManali.story.toLowerCase().includes('himalayan') || storyManali.story.toLowerCase().includes('beas'), 'Manali story captures alpine atmosphere');
});

test('PACT V2 Step 4: AI Storyteller UI trigger and conversational dialog integration', (t) => {
  const exploreCode = fs.readFileSync('src/components/ExplorePlaceSection.tsx', 'utf8');
  assert.ok(exploreCode.includes('Tell me about'), 'Explore section contains Tell me about destination button');
  assert.ok(exploreCode.includes('fetchDestinationStory'), 'Explore section invokes fetchDestinationStory');
  assert.ok(exploreCode.includes('Group Cultural Tip'), 'Story dialog displays Group Cultural Tip');
  assert.ok(exploreCode.includes('Historical Anchor'), 'Story dialog displays Historical Anchor');
  assert.ok(exploreCode.includes('storyModalVisible'), 'Story dialog uses controlled state');
});

test('PACT V2 Step 5: Review-Derived Safety & Practical Notes are grounded in real reviews, not fake statistics', async (t) => {
  const resGoa = await fetchPlaceRecommendations('Goa');
  assert.ok(resGoa.places.length > 0, 'Goa places exist');

  // Verify real places have review-derived notes
  const placesWithNotes = resGoa.places.filter(p => !!p.reviewNote);
  assert.ok(placesWithNotes.length >= 3, 'At least 3 venues have real review-derived notes');

  for (const p of placesWithNotes) {
    const note = p.reviewNote;
    assert.ok(note.length > 15, `Review note for ${p.name} must be substantial: ${note}`);
    
    // Strict PRD check: must be grounded in review feedback (e.g. guests note, reviewers praise, diners highlight)
    const hasReviewAnchor = note.toLowerCase().includes('review') || 
                            note.toLowerCase().includes('guest') || 
                            note.toLowerCase().includes('diner') || 
                            note.toLowerCase().includes('note');
    assert.ok(hasReviewAnchor, `Review note must be grounded in real traveler feedback: ${note}`);

    // Strict PRD check: Never fabricate usage statistics ("X people used PACT")
    assert.ok(!note.toLowerCase().includes('used pact'), 'Review note must NEVER fabricate PACT usage stats');
    assert.ok(!note.toLowerCase().includes('pact travelers'), 'Review note must NEVER fabricate PACT traveler stats');
  }
});

test('PACT V2 Step 5: UI displays "Good to know" line on place cards, omitted when no note exists', (t) => {
  const exploreCode = fs.readFileSync('src/components/ExplorePlaceSection.tsx', 'utf8');
  assert.ok(exploreCode.includes('Good to know:'), 'Explore place card displays Good to know label');
  assert.ok(exploreCode.includes('place.reviewNote ?'), 'Review note box is conditionally rendered only when present');
  assert.ok(exploreCode.includes('reviewNoteBox'), 'Review note box uses dedicated styling');
});
