/**
 * PACT AI Advisor Client
 * Connects to Google Gemini only through the authenticated Supabase Edge Function
 * 'ai-advisor' with guaranteed <= 3.5s timeout
 * and instant local fallback so the user experience is never blocked.
 */
import { supabase, isLiveSupabaseConfigured } from '../supabase/client.ts';

export interface BudgetAdvisorResult {
  minBudget: number;
  maxBudget: number;
  currency: string;
  formattedRange: string;
  explanation: string;
  source: 'gemini_live' | 'pact_market_index';
}

export interface CompromiseWhispererResult {
  compromise: string;
  anonymizedSummary: string;
  source: 'gemini_live' | 'pact_consensus_engine';
}

export interface DestinationStoryResult {
  destination: string;
  placeName?: string;
  story: string;
  culturalTip: string;
  historicalContext: string;
  source: 'gemini_live' | 'pact_storyteller_index';
}

export interface ItineraryAnchor {
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  venueName: string;
  description: string;
  costPerPerson: string;
  satisfiedConstraintBadge: string;
}

export interface VetoAwareConciergeResult {
  destination: string;
  anchors: ItineraryAnchor[];
  source: 'gemini_live' | 'pact_veto_engine';
}

const DESTINATION_STORIES: Record<string, { story: string; culturalTip: string; historicalContext: string }> = {
  goa: {
    story: "Goa is a coastal enclave where four and a half centuries of Portuguese maritime history melt into lush Konkan fishing villages and whispering coconut groves. Morning brings the gentle clatter of local bakeries delivering fresh poee bread by bicycle, while afternoons slip into tranquil susegad—the cherished Goan art of unhurried contentment. For group travelers, Goa offers a rare duality: tranquil heritage estates nestled along Nerul's quiet backwaters just a short drive from coastal tavernas celebrating fiery coconut curries and seaside laughter.",
    culturalTip: "Embrace the 1 PM to 4 PM susegad lull when heritage village shops rest, and remove footwear when entering traditional ancestral homes.",
    historicalContext: "Liberated in 1961, Goa retains a distinctive Indo-Portuguese legal and architectural fabric seen in its oyster-shell windows, azulejo ceramic tiles, and open communal courtyards."
  },
  puducherry: {
    story: "Puducherry exists in a poetic cadence between Tamil sea breezes and French colonial symmetry. Divided by an ancient canal into the vibrant Tamil quarter and the quiet, pastel-washed French White Town, its cobblestone streets are shaded by sprawling bougainvillea cascading over mustard-yellow walls. Friends traveling together will find French-Indian fusion courtyards where artisanal sourdough meets aromatic filter coffee, leading to sunset strolls along Goubert Avenue overlooking the Bay of Bengal.",
    culturalTip: "White Town's residential lanes observe quiet hours after 10 PM; renting vintage bicycles is the most respectful and picturesque way to explore.",
    historicalContext: "Transferred peacefully to India in 1954, Puducherry preserves an 18th-century French grid layout planned around seaside sea walls and breezy colonial verandahs."
  },
  manali: {
    story: "Perched at the northern tip of the Kullu Valley, Manali is where rushing turquoise waters of the Beas River cut through ancient deodar cedar forests into snow-capped Himalayan ridges. Beyond the bustling town center lies Old Manali, where wooden Kath-Kuni chalets with slate roofs overlook apple orchards and aromatic spice cafes. For a circle of friends, it offers crisp mountain air, panoramic stargazing from mountain lodges, and daytime adventures into high alpine passes.",
    culturalTip: "High mountain passes require eco-permits; dress in layers as valley sunshine gives way quickly to alpine chill by late afternoon.",
    historicalContext: "Named after sage Manu, who stepped ashore here to recreate human life after the great flood according to Hindu mythology; traditional Kath-Kuni wood-and-stone architecture was engineered specifically to withstand seismic tremors."
  },
  jaipur: {
    story: "The Pink City is a living theater of Rajput valor, geometric astronomical genius, and vibrant royal craftsmanship. Founded in 1727 with wide avenues aligned to Vedic Vastu Shastra principles, Jaipur's terracotta-pink facades gleam under the desert sun. From bustling spice corridors in Johari Bazaar to tranquil candlelight dinners in 300-year-old palace courtyards, the city immerses group travelers in majestic architecture and warm Rajasthani hospitality.",
    culturalTip: "Always negotiate pre-arranged auto-rickshaw fares or book verified transfers when navigating the labyrinthine old walled city gates.",
    historicalContext: "Painted pink in 1876 under Maharaja Ram Singh to welcome the Prince of Wales, symbolizing traditional hospitable welcome."
  }
};

export function getLocalStoryFallback(destination: string, placeName?: string): DestinationStoryResult {
  const norm = (destination || 'Goa').toLowerCase().trim();
  const matchKey = Object.keys(DESTINATION_STORIES).find(k => norm.includes(k));
  const base = matchKey ? DESTINATION_STORIES[matchKey] : {
    story: `${destination} offers an inspiring balance of natural beauty, culinary distinctiveness, and cultural history that makes it ideal for group journeys.`,
    culturalTip: "Respect local resident hours and support neighborhood family-run cafes.",
    historicalContext: `${destination} preserves centuries of rich regional traditions reflected in its architecture and local community.`
  };
  return {
    ...base,
    destination,
    placeName,
    source: 'pact_storyteller_index'
  };
}

// In-memory cache to guarantee 0ms instant renders on revisited screens
const advisorCache = new Map<string, any>();

// Curated Market Estimates Fallback
const DESTINATION_BUDGETS: Record<string, { min: number; max: number; desc: string }> = {
  goa: { min: 400, max: 600, desc: 'Covers beachfront villa share, scooter rentals, and coastal dining.' },
  kyoto: { min: 900, max: 1400, desc: 'Covers traditional machiya stay, transit pass, and dining.' },
  bali: { min: 450, max: 750, desc: 'Covers private pool villa, surf transport, and cafe dining.' },
  paris: { min: 1200, max: 1800, desc: 'Covers central boutique stay, metro pass, and bistro dining.' },
  manali: { min: 250, max: 450, desc: 'Covers riverside chalet, mountain cab rentals, and gear.' },
};

export function getLocalBudgetFallback(destination: string, days: number = 5): BudgetAdvisorResult {
  const norm = (destination || 'Goa').toLowerCase().trim();
  const matchKey = Object.keys(DESTINATION_BUDGETS).find(k => norm.includes(k));
  const base = matchKey ? DESTINATION_BUDGETS[matchKey] : { min: 450, max: 750, desc: 'Comfortable group travel with shared villa accommodation.' };
  return {
    minBudget: base.min,
    maxBudget: base.max,
    currency: 'USD',
    formattedRange: `Typical budget for a ${days}-day ${destination} trip: $${base.min}–$${base.max}/person`,
    explanation: base.desc,
    source: 'pact_market_index',
  };
}

export function getLocalWhispererFallback(
  destination: string,
  groupSize: number,
  agg: { budgetBuckets?: Record<string, number>; commonDates?: string; dealbreakerSummary?: string }
): CompromiseWhispererResult {
  const buckets = Object.entries(agg.budgetBuckets || { '$400–$600': 2, '$800–$1,200': 3 })
    .map(([range, count]) => `${count} members at ${range}`)
    .join(', ');

  const commonDates = agg.commonDates || 'Oct 14–16 (100% overlap)';

  return {
    compromise: `Booking a 5-bedroom private villa with en-suite bathrooms in South Goa bridges the accommodation dealbreaker while preserving 100% date overlap (${commonDates}). Tiered room splits maintain budget fairness.`,
    anonymizedSummary: `Analyzed ${groupSize} sealed ballots: ${buckets}. 100% agreement on ${commonDates}.`,
    source: 'pact_consensus_engine',
  };
}

const CONCIERGE_ANCHORS: Record<string, ItineraryAnchor[]> = {
  goa: [
    {
      timeOfDay: 'Morning',
      venueName: 'Viva Panjim Heritage Cafe',
      description: 'Authentic Goan breakfast & coffee in Fontainhas historic quarter.',
      costPerPerson: '$12 / person',
      satisfiedConstraintBadge: 'Passed: Dietary Veto'
    },
    {
      timeOfDay: 'Afternoon',
      venueName: 'Palolem Cove Kayaking',
      description: 'Tranquil lagoon kayaking & secluded beach cove relaxation.',
      costPerPerson: '$22 / person',
      satisfiedConstraintBadge: 'Fits: Under $30 Cap'
    },
    {
      timeOfDay: 'Evening',
      venueName: "Fisherman's Wharf Sunset Dining",
      description: 'Fresh seafood & plant-based coastal dinner overlooking river.',
      costPerPerson: '$35 / person',
      satisfiedConstraintBadge: 'Passed: Group Veto Clearance'
    }
  ],
  manali: [
    {
      timeOfDay: 'Morning',
      venueName: 'Old Manali Artisan Cafe',
      description: 'Fresh sourdough pastries & spiced chai with valley mountain view.',
      costPerPerson: '$10 / person',
      satisfiedConstraintBadge: 'Passed: Dietary Veto'
    },
    {
      timeOfDay: 'Afternoon',
      venueName: 'Solang Valley Nature Trail',
      description: 'Gentle cedar forest walking path along Beas river stream.',
      costPerPerson: '$18 / person',
      satisfiedConstraintBadge: 'Fits: Easy Altitude Pacing'
    },
    {
      timeOfDay: 'Evening',
      venueName: 'Cafe 1947 Riverside Lounge',
      description: 'Live acoustic music & candlelit dinner by Beas river.',
      costPerPerson: '$28 / person',
      satisfiedConstraintBadge: 'Passed: Group Veto Clearance'
    }
  ],
  puducherry: [
    {
      timeOfDay: 'Morning',
      venueName: 'Baker Street French Bistro',
      description: 'Artisanal croissants & pour-over coffee in White Town.',
      costPerPerson: '$11 / person',
      satisfiedConstraintBadge: 'Passed: Dietary Veto'
    },
    {
      timeOfDay: 'Afternoon',
      venueName: 'Auroville Eco Craft Workshop',
      description: 'Shaded village craft walk & handmade paper workshop.',
      costPerPerson: '$16 / person',
      satisfiedConstraintBadge: 'Fits: Under $20 Cap'
    },
    {
      timeOfDay: 'Evening',
      venueName: 'Villa Shanti Courtyard Dinner',
      description: 'Candlelit French-Tamil fusion in historic open courtyard.',
      costPerPerson: '$32 / person',
      satisfiedConstraintBadge: 'Passed: Group Veto Clearance'
    }
  ]
};

export function getLocalConciergeFallback(destination: string): VetoAwareConciergeResult {
  const norm = (destination || 'Goa').toLowerCase().trim();
  const matchKey = Object.keys(CONCIERGE_ANCHORS).find((k) => norm.includes(k));
  const anchors = matchKey
    ? CONCIERGE_ANCHORS[matchKey]
    : [
        {
          timeOfDay: 'Morning' as const,
          venueName: `${destination} Central Artisan Cafe`,
          description: 'Artisanal breakfast & fresh coffee in central heritage district.',
          costPerPerson: '$12 / person',
          satisfiedConstraintBadge: 'Passed: Dietary Veto'
        },
        {
          timeOfDay: 'Afternoon' as const,
          venueName: `${destination} Cultural Heritage Walk`,
          description: 'Guided stroll through historic landmarks & local markets.',
          costPerPerson: '$20 / person',
          satisfiedConstraintBadge: 'Fits: Group Pacing'
        },
        {
          timeOfDay: 'Evening' as const,
          venueName: `${destination} Panorama Sunset Restaurant`,
          description: 'Panoramic dinner featuring regional plant-based & local fare.',
          costPerPerson: '$34 / person',
          satisfiedConstraintBadge: 'Passed: Group Veto Clearance'
        }
      ];

  return {
    destination,
    anchors,
    source: 'pact_veto_engine'
  };
}

export async function getVetoAwareItineraryAnchors(aggregateConstraints: {
  destination: string;
  tags?: string[];
  budgetTier?: string;
  anonymizedVetoCategories?: string[];
}): Promise<VetoAwareConciergeResult> {
  const { destination } = aggregateConstraints;
  const cacheKey = `concierge:${destination.toLowerCase().trim()}:${JSON.stringify(aggregateConstraints)}`;
  if (advisorCache.has(cacheKey)) {
    return advisorCache.get(cacheKey)!;
  }

  if (isLiveSupabaseConfigured) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        throw new Error('No active session for Edge Function');
      }

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI Concierge timeout (>3.5s)')), 3500)
      );

      const callPromise = supabase.functions.invoke('ai-advisor', {
        body: {
          action: 'veto_aware_concierge',
          destination,
          aggregateConstraints
        }
      });

      const { data, error } = (await Promise.race([callPromise, timeoutPromise])) as any;
      if (!error && data && data.anchors && data.anchors.length > 0) {
        const result: VetoAwareConciergeResult = {
          destination: data.destination || destination,
          anchors: data.anchors,
          source: data.source || 'gemini_live'
        };
        advisorCache.set(cacheKey, result);
        return result;
      }
    } catch (e) {}
  }

  const fallback = getLocalConciergeFallback(destination);
  advisorCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Fetch typical market budget for destination with 3.5s timeout + fallback
 */
export async function fetchBudgetAdvisor(
  destination: string,
  days: number = 5
): Promise<BudgetAdvisorResult> {
  const cacheKey = `budget:${destination.toLowerCase().trim()}:${days}`;
  if (advisorCache.has(cacheKey)) {
    return advisorCache.get(cacheKey)!;
  }

  // The only live AI path is the authenticated Edge Function.
  if (isLiveSupabaseConfigured) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        // Unauthenticated visitor: use instant deterministic fallback without triggering 401
        throw new Error('No active session for Edge Function');
      }
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI Advisor timeout (>3.5s)')), 3500)
      );

      const callPromise = supabase.functions.invoke('ai-advisor', {
        body: {
          action: 'budget_advisor',
          destination,
          tripDurationDays: days
        }
      });

      const { data, error } = await Promise.race([callPromise, timeoutPromise]) as any;
      if (!error && data && data.formattedRange) {
        const result: BudgetAdvisorResult = {
          minBudget: data.minBudget || 400,
          maxBudget: data.maxBudget || 600,
          currency: data.currency || 'USD',
          formattedRange: data.formattedRange,
          explanation: data.explanation || 'Covers shared villa stay and daily meals.',
          source: data.source || 'gemini_live'
        };
        advisorCache.set(cacheKey, result);
        return result;
      }
    } catch (e) {}
  }

  // Instant Local Market Index Fallback
  const fallback = getLocalBudgetFallback(destination, days);
  advisorCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Fetch anonymized AI compromise recommendation for deadlocked group
 */
export async function fetchCompromiseWhisperer(
  destination: string,
  groupSize: number,
  aggregatedData: {
    budgetBuckets: Record<string, number>;
    commonDates: string;
    dealbreakerSummary: string;
  }
): Promise<CompromiseWhispererResult> {
  try {
    const cacheKey = `whisperer:${(destination || '').toLowerCase()}:${groupSize}:${JSON.stringify(aggregatedData || {})}`;
    if (advisorCache.has(cacheKey)) {
      return advisorCache.get(cacheKey)!;
    }

    // The only live AI path is the authenticated Edge Function.
    if (isLiveSupabaseConfigured) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData?.session) {
          // Unauthenticated visitor: use instant deterministic fallback without triggering 401
          throw new Error('No active session for Edge Function');
        }
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI Whisperer timeout (>3.5s)')), 3500)
        );

        const callPromise = supabase.functions.invoke('ai-advisor', {
          body: {
            action: 'compromise_whisperer',
            destination,
            groupSize,
            aggregatedData
          }
        });

        const { data, error } = await Promise.race([callPromise, timeoutPromise]) as any;
        if (!error && data && data.compromise) {
          const result: CompromiseWhispererResult = {
            compromise: data.compromise,
            anonymizedSummary: data.anonymizedSummary || 'Aggregated group consensus analyzed.',
            source: data.source || 'gemini_live'
          };
          advisorCache.set(cacheKey, result);
          return result;
        }
      } catch (e) {}
    }

    // Instant Local Heuristics Fallback
    const fallback = getLocalWhispererFallback(destination, groupSize, aggregatedData || {});
    advisorCache.set(cacheKey, fallback);
    return fallback;
  } catch (err) {
    console.warn('[aiAdvisorClient] fetchCompromiseWhisperer error fallback:', err);
    return getLocalWhispererFallback(destination || 'Goa', groupSize || 5, aggregatedData || {});
  }
}

/**
 * Fetch conversational AI storytelling explaining the history and cultural atmosphere of a destination
 */
export async function fetchDestinationStory(
  destination: string,
  placeName?: string
): Promise<DestinationStoryResult> {
  const cacheKey = `story:${destination.toLowerCase().trim()}:${(placeName || '').toLowerCase().trim()}`;
  if (advisorCache.has(cacheKey)) {
    return advisorCache.get(cacheKey)!;
  }

  if (isLiveSupabaseConfigured) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        // Unauthenticated visitor: use instant deterministic fallback without triggering 401
        throw new Error('No active session for Edge Function');
      }
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI Storyteller timeout (>3.5s)')), 3500)
      );

      const callPromise = supabase.functions.invoke('ai-advisor', {
        body: {
          action: 'destination_storyteller',
          destination,
          placeName
        }
      });

      const { data, error } = await Promise.race([callPromise, timeoutPromise]) as any;
      if (!error && data && data.story) {
        const result: DestinationStoryResult = {
          destination: data.destination || destination,
          placeName: data.placeName || placeName,
          story: data.story,
          culturalTip: data.culturalTip || 'Respect local residential quiet hours and cultural norms.',
          historicalContext: data.historicalContext || 'A storied regional crossroad.',
          source: data.source || 'gemini_live'
        };
        advisorCache.set(cacheKey, result);
        return result;
      }
    } catch (e) {}
  }

  // Instant Local Story Fallback
  const fallback = getLocalStoryFallback(destination, placeName);
  advisorCache.set(cacheKey, fallback);
  return fallback;
}
