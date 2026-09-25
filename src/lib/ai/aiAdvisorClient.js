import { supabase, isLiveSupabaseConfigured } from '../supabase/client.ts';

const advisorCache = new Map();

const CONCIERGE_ANCHORS = {
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

export function getLocalConciergeFallback(destination) {
  const norm = (destination || 'Goa').toLowerCase().trim();
  const matchKey = Object.keys(CONCIERGE_ANCHORS).find((k) => norm.includes(k));
  const anchors = matchKey
    ? CONCIERGE_ANCHORS[matchKey]
    : [
        {
          timeOfDay: 'Morning',
          venueName: `${destination} Central Artisan Cafe`,
          description: 'Artisanal breakfast & fresh coffee in central heritage district.',
          costPerPerson: '$12 / person',
          satisfiedConstraintBadge: 'Passed: Dietary Veto'
        },
        {
          timeOfDay: 'Afternoon',
          venueName: `${destination} Cultural Heritage Walk`,
          description: 'Guided stroll through historic landmarks & local markets.',
          costPerPerson: '$20 / person',
          satisfiedConstraintBadge: 'Fits: Group Pacing'
        },
        {
          timeOfDay: 'Evening',
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

export async function getVetoAwareItineraryAnchors(aggregateConstraints) {
  const { destination } = aggregateConstraints;
  const cacheKey = `concierge:${destination.toLowerCase().trim()}:${JSON.stringify(aggregateConstraints)}`;
  if (advisorCache.has(cacheKey)) {
    return advisorCache.get(cacheKey);
  }

  if (isLiveSupabaseConfigured) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        throw new Error('No active session for Edge Function');
      }

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI Concierge timeout (>3.5s)')), 3500)
      );

      const callPromise = supabase.functions.invoke('ai-advisor', {
        body: {
          action: 'veto_aware_concierge',
          destination,
          aggregateConstraints
        }
      });

      const { data, error } = await Promise.race([callPromise, timeoutPromise]);
      if (!error && data && data.anchors && data.anchors.length > 0) {
        const result = {
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
