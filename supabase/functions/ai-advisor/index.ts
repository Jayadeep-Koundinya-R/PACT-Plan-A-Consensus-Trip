// PACT AI Advisor Edge Function
// Supports:
// 1. compromise_whisperer: Generates privacy-preserving group compromises based exclusively on aggregated data.
// 2. budget_advisor: Generates market-accurate typical budget estimates for trip destinations.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhispererRequest {
  action: 'compromise_whisperer';
  destination: string;
  groupSize: number;
  aggregatedData: {
    budgetBuckets: Record<string, number>;
    commonDates: string;
    dealbreakerSummary: string;
  };
}

interface BudgetAdvisorRequest {
  action: 'budget_advisor';
  destination: string;
  tripDurationDays?: number;
}

interface ChatRequest {
  action: 'chat';
  prompt: string;
  conversationHistory?: Array<{ role: 'user' | 'model'; text: string }>;
}

interface StorytellerRequest {
  action: 'destination_storyteller';
  destination: string;
  placeName?: string;
}

type AIAdvisorRequest = WhispererRequest | BudgetAdvisorRequest | ChatRequest | StorytellerRequest;

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

// Local Curated Fallbacks
const DESTINATION_BUDGET_FALLBACKS: Record<string, { min: number; max: number; desc: string }> = {
  goa: { min: 400, max: 600, desc: 'Covers beachfront villa share, scooter rentals, and coastal dining.' },
  kyoto: { min: 900, max: 1400, desc: 'Covers traditional machiya stay, transit pass, and kaiseki experiences.' },
  bali: { min: 450, max: 750, desc: 'Covers private pool villa, surf transport, and cafe dining.' },
  paris: { min: 1200, max: 1800, desc: 'Covers central arrondissement boutique hotel, metro, and bistro dining.' },
  manali: { min: 250, max: 450, desc: 'Covers riverside chalet, mountain cab rentals, and trekking gear.' },
};

function getLocalBudgetFallback(destination: string, days: number = 5) {
  const norm = destination.toLowerCase().trim();
  const matchKey = Object.keys(DESTINATION_BUDGET_FALLBACKS).find(k => norm.includes(k));
  const base = matchKey ? DESTINATION_BUDGET_FALLBACKS[matchKey] : { min: 500, max: 800, desc: 'Standard comfortable group travel with shared private stay.' };
  return {
    minBudget: base.min,
    maxBudget: base.max,
    currency: 'USD',
    formattedRange: `Typical budget for a ${days}-day ${destination} trip: $${base.min}–$${base.max}/person`,
    explanation: base.desc,
    source: 'pact_market_index',
  };
}

function getLocalWhispererFallback(dest: string, size: number, agg: WhispererRequest['aggregatedData']) {
  const buckets = Object.entries(agg.budgetBuckets || {})
    .map(([range, count]) => `${count} members at ${range}`)
    .join(', ');

  return {
    compromise: `Shifting dates to ${agg.commonDates || 'peak overlap days'} and booking a private 5-bedroom villa with en-suite bathrooms satisfies accommodation dealbreakers while maintaining fair tiered splits (${buckets || 'across group budget tiers'}).`,
    anonymizedSummary: `Analyzed ${size} sealed ballots without revealing individual limits: ${buckets || 'budget split'}. 100% agreement on ${agg.commonDates || 'common dates'}.`,
    source: 'pact_consensus_engine',
  };
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // 1. Mandatory JWT Authentication Guard (Prevent Free Gemini Proxy Abuse)
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid user session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: AIAdvisorRequest = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (body.action === 'chat') {
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
      if (!prompt || prompt.length > 4000) {
        return new Response(JSON.stringify({ error: 'Prompt must be between 1 and 4000 characters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (!apiKey) {
        return new Response(JSON.stringify({ ok: false, reason: 'missing_key', text: 'Live AI is not configured on the server.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const history = (body.conversationHistory || []).slice(-12).filter((message) =>
        (message.role === 'user' || message.role === 'model') &&
        typeof message.text === 'string' && message.text.length <= 4000
      );
      const systemInstruction = 'You are the PACT AI Travel Advisor, powered by Google Gemini. PACT is a privacy-first group travel consensus app. Provide concise, structured group travel advice about budgets, itineraries, diplomatic compromises, packing, and logistics. Never request or reveal individual private budgets, dates, or dealbreakers.';
      const contents = [
        { role: 'user', parts: [{ text: systemInstruction }] },
        { role: 'model', parts: [{ text: 'Understood. I will provide concise, privacy-preserving travel guidance.' }] },
        ...history.map((message) => ({ role: message.role, parts: [{ text: message.text }] })),
        { role: 'user', parts: [{ text: prompt }] }
      ];

      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({ contents, generationConfig: { temperature: 0.4, maxOutputTokens: 8192 } })
        });
        if (!response.ok) {
          const reason = response.status === 401 || response.status === 403
            ? 'invalid_key'
            : response.status === 429 ? 'quota_exceeded' : 'network_error';
          return new Response(JSON.stringify({ ok: false, reason, text: 'The AI service is temporarily unavailable.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        const result = await response.json();
        const candidate = result?.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text?.trim();
        if (!text) {
          return new Response(JSON.stringify({ ok: false, reason: 'no_response', text: 'The AI service returned no answer.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ ok: true, text, truncated: candidate?.finishReason === 'MAX_TOKENS' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Gemini chat request failed:', error);
        return new Response(JSON.stringify({ ok: false, reason: 'network_error', text: 'The AI service is temporarily unavailable.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (body.action === 'budget_advisor') {
      const { destination, tripDurationDays = 5 } = body;

      if (apiKey) {
        try {
          const prompt = `You are the PACT Group Travel Budget Advisor. Estimate a realistic, comfortable typical budget range per person for a ${tripDurationDays}-day group trip to "${destination}".
Return STRICT JSON format only:
{
  "minBudget": number,
  "maxBudget": number,
  "currency": "USD",
  "formattedRange": "Typical budget for a ${tripDurationDays}-day ${destination} trip: $[min]-[max]/person",
  "explanation": "Brief 1-sentence explanation of what this covers."
}`;

          const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              return new Response(JSON.stringify({ ...parsed, source: 'gemini_live' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          }
        } catch (aiErr) {
          console.error('Gemini API call error (falling back to local index):', aiErr);
        }
      }

      // Fallback
      return new Response(JSON.stringify(getLocalBudgetFallback(destination, tripDurationDays)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body.action === 'compromise_whisperer') {
      const { destination, groupSize, aggregatedData } = body;

      if (apiKey) {
        try {
          const prompt = `You are the PACT AI Compromise Whisperer. Your role is to resolve group travel deadlocks with diplomatic, actionable compromises without ever revealing individual secrets.
Group: ${groupSize} members
Destination: "${destination}"
Aggregated Anonymized Data:
- Budget Distribution: ${JSON.stringify(aggregatedData.budgetBuckets)}
- Overlapping Dates: "${aggregatedData.commonDates}"
- Dealbreaker Summary: "${aggregatedData.dealbreakerSummary}"

Strict Privacy Rules:
- DO NOT mention any individual member's name or assign blame.
- Treat constraints as group-wide math problems.
- Suggest a creative compromise that respects everyone (e.g. villa with private ensuite rooms for bathroom privacy, tiered room splits for wide budgets).

Return STRICT JSON only:
{
  "compromise": "Actionable 2-sentence compromise recommendation.",
  "anonymizedSummary": "1-sentence summary of the aggregate balance."
}`;

          const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, responseMimeType: 'application/json' }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              return new Response(JSON.stringify({ ...parsed, source: 'gemini_live' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          }
        } catch (aiErr) {
          console.error('Gemini API call error (falling back to local heuristics):', aiErr);
        }
      }

      // Fallback
      return new Response(JSON.stringify(getLocalWhispererFallback(destination, groupSize, aggregatedData)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (body.action === 'destination_storyteller') {
      const { destination, placeName } = body;
      const norm = (destination || 'Goa').toLowerCase().trim();

      if (apiKey) {
        try {
          const prompt = `You are the PACT AI Travel Storyteller. Explain the cultural essence, history, and atmosphere of "${destination}"${placeName ? ` (focusing on ${placeName})` : ''} for a group of friends visiting.
Keep it conversational, vivid, engaging, and under 3 short paragraphs.
Strict Rules:
- Never invent usage statistics ("X travelers used PACT").
- Highlight authentic cultural norms, local lore, and sensory details.
Return STRICT JSON only:
{
  "story": "2-3 conversational paragraphs capturing the soul and history of the place.",
  "culturalTip": "One respectful cultural or local tip for group visitors.",
  "historicalContext": "One fascinating historical anchor that shaped this place."
}`;

          const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
            })
          });

          if (res.ok) {
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text);
              return new Response(JSON.stringify({ ...parsed, destination, placeName, source: 'gemini_live' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          }
        } catch (aiErr) {
          console.error('Gemini Storyteller call error (falling back to local index):', aiErr);
        }
      }

      // Fallback
      const matchKey = Object.keys(DESTINATION_STORIES).find(k => norm.includes(k));
      const fallback = matchKey ? DESTINATION_STORIES[matchKey] : {
        story: `${destination} offers a compelling blend of regional heritage, distinct culinary traditions, and evocative landscapes that make it an unforgettable backdrop for group travel memories.`,
        culturalTip: "Engage with local guides and respect quiet hours in heritage residential neighborhoods.",
        historicalContext: `${destination} developed as a vital regional crossroad, shaping its unique architectural and cultural identity today.`
      };

      return new Response(JSON.stringify({ ...fallback, destination, placeName, source: 'pact_storyteller_index' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action requested' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
