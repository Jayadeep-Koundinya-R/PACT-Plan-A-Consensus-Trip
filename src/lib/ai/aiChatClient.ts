/**
 * PACT Gemini AI Chat Client
 * Connects directly to Google Gemini 1.5/2.5/3.6 Flash using EXPO_PUBLIC_GEMINI_API_KEY
 */
const directGeminiKey = (typeof process !== 'undefined' && process.env) ? process.env.EXPO_PUBLIC_GEMINI_API_KEY : undefined;

const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-1.5-flash'];

export async function askGemini(prompt: string, conversationHistory: { role: 'user' | 'model'; text: string }[] = []): Promise<string> {
  if (!directGeminiKey) {
    return "To enable live Google Gemini responses, please make sure `EXPO_PUBLIC_GEMINI_API_KEY` is set in your `.env` file. In the meantime, I can tell you that PACT uses sealed constraint scoring to reach 100% group consensus!";
  }

  const systemInstruction = "You are the PACT AI Travel Advisor, powered by Google Gemini. PACT is a privacy-first group travel consensus application that eliminates WhatsApp planning chaos and awkward money talks by mathematically sealing individual budgets and vetoes.\n\nYour job is to provide friendly, concise, and structured group travel advice. You help with: 1) Realistic budget estimates & breakdown, 2) Curated day-by-day itineraries, 3) Diplomatic compromise suggestions for friends with differing budgets, and 4) Packing & logistics tips.\n\nFormat with clear headings, bullet points, and helpful emojis. Keep responses concise and engaging.";

  // Format contents for Gemini generateContent
  const contents = [
    {
      role: 'user',
      parts: [{ text: systemInstruction }]
    },
    {
      role: 'model',
      parts: [{ text: "Understood! I am the PACT AI Travel Advisor. I will help your group plan seamless trips with realistic budgets, diplomatic compromises, and exciting itineraries. How can I help your group today?" }]
    }
  ];

  // Append conversation history
  for (const msg of conversationHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }

  // Append latest prompt
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  // Try candidate models in order
  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${directGeminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return reply.trim();
        }
      }
    } catch (err) {
      console.warn(`Gemini model ${model} error:`, err);
    }
  }

  // Fallback if API fails or rate limited
  return "I'm having trouble connecting to Google Gemini right now. For Goa trips, we recommend ~$400–$600 per person covering private beachfront villa sharing, scooter rentals, and coastal seafood shacks! For custom itineraries, try asking again in a moment.";
}
