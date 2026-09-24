import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fetchPlaceRecommendations, VERIFIED_REAL_PLACES } from '../../places/placeRecommendationsClient.ts';
import { usePlaceRecommendationsStore } from '../../../store/usePlaceRecommendationsStore.ts';

test('PACT V2 Step 3: place_recommendations_cache schema & index definition', (t) => {
  const schemaSql = fs.readFileSync('supabase/schema.sql', 'utf8');
  assert.ok(schemaSql.includes('public.place_recommendations_cache'), 'Table place_recommendations_cache must exist');
  assert.ok(schemaSql.includes('destination text not null unique'), 'destination text not null unique exists');
  assert.ok(schemaSql.includes('places_json jsonb not null'), 'places_json jsonb exists');
  assert.ok(schemaSql.includes('fetched_at timestamptz not null default now()'), 'fetched_at exists');
  assert.ok(schemaSql.includes('place_recommendations_destination_idx'), 'destination index exists');
});

test('PACT V2 Step 3: Real Venue Recommendations Engine (Names, Ratings, Price Levels, Categories)', async (t) => {
  const resGoa = await fetchPlaceRecommendations('Goa');
  assert.ok(resGoa, 'Result returned for Goa');
  assert.ok(resGoa.places.length >= 3, 'Must return at least 3 places');
  
  // Real place names verification
  const names = resGoa.places.map(p => p.name);
  assert.ok(names.includes('Ahilya by the Sea'), 'Contains real heritage stay Ahilya by the Sea');
  assert.ok(names.includes('Gunpowder'), 'Contains real culinary icon Gunpowder');
  
  // Ratings and review counts verification (must be real numbers >= 4.0)
  for (const place of resGoa.places) {
    assert.ok(place.rating >= 4.0 && place.rating <= 5.0, `Rating ${place.rating} must be between 4.0 and 5.0`);
    assert.ok(place.userRatingsTotal > 0, `userRatingsTotal ${place.userRatingsTotal} must be positive`);
    assert.ok(['stay', 'dining', 'activity'].includes(place.category), `Category ${place.category} must be stay, dining, or activity`);
    assert.ok(place.address && place.address.length > 5, `Address must be realistic: ${place.address}`);
  }

  // Price level verification ($$, $$$, $$$$)
  const stays = resGoa.places.filter(p => p.category === 'stay');
  assert.ok(stays.some(s => s.priceLevel === '$$$$' || s.priceLevel === '$$$'), 'Stays have real price tiers');

  // AI Gemini Narration verification
  assert.ok(resGoa.aiSummary.length > 20, 'Narration must be descriptive');
  assert.ok(resGoa.safetyNote && resGoa.safetyNote.length > 10, 'Safety tip must be present');
});

test('PACT V2 Step 3: Runner-up destinations Puducherry and Manali supported', async (t) => {
  const resPud = await fetchPlaceRecommendations('Puducherry');
  assert.ok(resPud.places.some(p => p.name.includes('Palais de Mahe')), 'Contains real heritage hotel Palais de Mahe');
  assert.ok(resPud.places.some(p => p.name.includes('Villa Shanti')), 'Contains real courtyard restaurant Villa Shanti');

  const resManali = await fetchPlaceRecommendations('Manali');
  assert.ok(resManali.places.some(p => p.name.includes('The Himalayan Resort')), 'Contains real resort The Himalayan Resort');
  assert.ok(resManali.places.some(p => p.name.includes('Cafe 1947')), 'Contains real riverside cafe Cafe 1947');
});

test('PACT V2 Step 3: Cache Prevents Redundant API Calls on Repeat Views', async (t) => {
  const store = usePlaceRecommendationsStore.getState();
  
  // First fetch
  await store.loadRecommendations('Goa');
  const count1 = usePlaceRecommendationsStore.getState().apiCallCount['goa'] || 1;
  const initialData = store.getRecommendations('Goa') || usePlaceRecommendationsStore.getState().recommendations['goa'];
  assert.ok(initialData, 'Initial data loaded into store');
  assert.equal(initialData.destination.toLowerCase(), 'goa');
  
  // Second fetch for same destination
  await store.loadRecommendations('Goa');
  const count2 = usePlaceRecommendationsStore.getState().apiCallCount['goa'];
  
  // Must NOT trigger another API call
  assert.equal(count2, count1, 'Repeat view must hit in-memory/Supabase cache and not increase API count');
  
  // Confirm data remains intact
  const cachedData = store.getRecommendations('Goa');
  assert.equal(cachedData.destination, initialData.destination);
  assert.equal(cachedData.places.length, initialData.places.length);
});

test('PACT V2 Step 3: Ranked Matrix UI Integration with Expandable Place Section', (t) => {
  const matrixCode = fs.readFileSync('app/circle/[id]/ranked-matrix.tsx', 'utf8');
  assert.ok(matrixCode.includes('<ExplorePlaceSection'), 'Ranked matrix integrates ExplorePlaceSection');
  assert.ok(matrixCode.includes('destination={topDestinationName}'), 'ExplorePlaceSection passed top destination dynamically');
  
  const exploreCode = fs.readFileSync('src/components/ExplorePlaceSection.tsx', 'utf8');
  assert.ok(exploreCode.includes('Explore {destination}') || exploreCode.includes('Explore this place'), 'Header title Explore exists');
  assert.ok(exploreCode.includes('usePlaceRecommendationsStore'), 'Uses place recommendation store');
  assert.ok(exploreCode.includes('Gemini Travel Narration'), 'Displays Gemini Travel Narration section');
  assert.ok(exploreCode.includes('Cached'), 'Displays cache status badge');
  assert.ok(exploreCode.includes('Group Safety Tip'), 'Displays safety note');
});
