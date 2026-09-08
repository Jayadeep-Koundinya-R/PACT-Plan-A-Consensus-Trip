/**
 * PACT Gemini AI Chat Client
 * Connects directly to Google Gemini (1.5/2.5/3.6 Flash) using EXPO_PUBLIC_GEMINI_API_KEY.
 *
 * Returns a structured result so the UI can tell a real AI answer apart from a
 * missing/invalid key, quota exhaustion or a network problem — instead of
 * silently substituting a canned reply.
 */
const directGeminiKey = (typeof process !== 'undefined' && process.env) ? process.env.EXPO_PUBLIC_GEMINI_API_KEY : undefined;

// Real, current Gemini model endpoints (gemini-3.6-flash is an active stable model).
const CANDIDATE_MODELS = ['gemini-3.6-flash', 'gemini-flash-latest', 'gemini-2.5-flash', 'gemini-1.5-flash'];

export type GeminiFailureReason =
  | 'missing_key'
  | 'invalid_key'
  | 'quota_exceeded'
  | 'model_not_found'
  | 'blocked'
  | 'no_response'
  | 'network_error';

export interface GeminiChatResult {
  ok: boolean;
  text: string;
  reason?: GeminiFailureReason;
  /** True when the model hit the output-length ceiling before finishing. */
  truncated?: boolean;
}

const OFFLINE_FALLBACK =
  'For most group trips a typical range is ~$450–$750/person (shared stay, food, local transport). ' +
  'I could not reach Gemini right now — please retry in a moment.';

function failureText(reason: GeminiFailureReason): string {
  switch (reason) {
    case 'missing_key':
      return '⚠️ Live AI is not configured yet. Add `EXPO_PUBLIC_GEMINI_API_KEY` to your `.env` file (from Google AI Studio) and restart the app. Until then only offline guidance is available.';
    case 'invalid_key':
      return '⚠️ Gemini rejected your `EXPO_PUBLIC_GEMINI_API_KEY` (invalid or disabled). Double-check the key in `.env` and confirm billing is enabled for the Gemini API.';
    case 'quota_exceeded':
      return '⚠️ Google Gemini hit its API quota/rate limit for this key, so live answers are paused. Please try again later — or upgrade to PACT Pro for priority AI access.';
    case 'model_not_found':
      return '⚠️ The AI model list in this app build is out of date. Please refresh to the latest app version so Gemini model names stay in sync.';
    case 'blocked':
      return '⚠️ Gemini blocked this request (content safety policy). Try rephrasing your question in a broader way.';
    case 'no_response':
      return `⚠️ Gemini returned an empty response. ${OFFLINE_FALLBACK}`;
    case 'network_error':
    default:
      return `⚠️ I couldn't reach Google Gemini (network or service error). ${OFFLINE_FALLBACK}`;
  }
}

function failureFromStatus(status: number): GeminiFailureReason {
  if (status === 400) return 'blocked';
  if (status === 401 || status === 403) return 'invalid_key';
  if (status === 404) return 'model_not_found';
  if (status === 429) return 'quota_exceeded';
  return 'network_error';
}

// Keep answers complete: 800 tokens truncates real itineraries/budgets.
// Flash models support up to 8192+, so this comfortably fits full answers.
const MAX_OUTPUT_TOKENS = 8192;

export async function askGemini(prompt: string, conversationHistory: { role: 'user' | 'model'; text: string }[] = []): Promise<GeminiChatResult> {
  if (!directGeminiKey) {
    return { ok: false, text: failureText('missing_key'), reason: 'missing_key' };
  }

  const systemInstruction = 'You are the PACT AI Travel Advisor, powered by Google Gemini. PACT is a privacy-first group travel consensus app that eliminates planning chaos and awkward money talks by keeping individual budgets and vetoes sealed. Provide friendly, concise, structured group travel advice: 1) realistic budget estimates, 2) day-by-day itineraries, 3) diplomatic compromise suggestions for friends with different budgets, 4) packing & logistics tips. Use clear headings, short bullets and helpful emojis.';

  // Format contents for Gemini generateContent
  const contents: Array<{ role: string; parts: { text: string }[] }> = [
    { role: 'user', parts: [{ text: systemInstruction }] },
    { role: 'model', parts: [{ text: 'Understood! I am your PACT AI Travel Guide. I will help your group plan seamless trips with realistic budgets, diplomatic compromises, and exciting itineraries. What is on your mind today?' }] }
  ];

  // Append bounded conversation history so long chats stay fast
  for (const msg of conversationHistory.slice(-12)) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }

  // Append latest prompt
  contents.push({ role: 'user', parts: [{ text: prompt }] });

  let failure: GeminiFailureReason = 'network_error';

  // Try candidate models in order
  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${directGeminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.4, maxOutputTokens: MAX_OUTPUT_TOKENS }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data?.candidates?.[0];
        const reply = candidate?.content?.parts?.[0]?.text;
        if (reply && reply.trim()) {
          // finishReason 'MAX_TOKENS' means the model was cut off mid-answer.
          const truncated = candidate?.finishReason === 'MAX_TOKENS';
          return { ok: true, text: reply.trim(), truncated };
        }
        failure = 'no_response';
      } else {
        failure = failureFromStatus(res.status);
        // No point switching models when the key itself is the problem.
        if (failure === 'invalid_key' || failure === 'quota_exceeded') break;
      }
    } catch (err) {
      console.warn(`Gemini model ${model} error:`, err);
      failure = 'network_error';
    }
  }

  return { ok: false, text: failureText(failure), reason: failure };
}