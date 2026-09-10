/**
 * PACT AI Chat Client.
 * All live requests go through the authenticated Supabase Edge Function.
 */
import { supabase, isLiveSupabaseConfigured } from '../supabase/client.ts';

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
  truncated?: boolean;
}

function failureText(reason: GeminiFailureReason): string {
  switch (reason) {
    case 'missing_key':
      return 'Live AI is not available right now. PACT will continue with offline guidance.';
    case 'invalid_key':
      return 'The server could not authorize the AI request. Please try again later.';
    case 'quota_exceeded':
      return 'The AI service has reached its rate limit. Please try again later.';
    case 'blocked':
      return 'The AI service blocked this request. Try rephrasing it.';
    case 'no_response':
      return 'The AI service returned no answer. Please try again.';
    case 'model_not_found':
    case 'network_error':
    default:
      return 'I could not reach the AI service right now. Please try again.';
  }
}

export async function askGemini(
  prompt: string,
  conversationHistory: { role: 'user' | 'model'; text: string }[] = []
): Promise<GeminiChatResult> {
  if (!isLiveSupabaseConfigured) {
    return { ok: false, text: failureText('missing_key'), reason: 'missing_key' };
  }

  try {
    const { data, error } = await supabase.functions.invoke('ai-advisor', {
      body: {
        action: 'chat',
        prompt,
        conversationHistory: conversationHistory.slice(-12)
      }
    });

    if (error || !data?.text) {
      return { ok: false, text: failureText('network_error'), reason: 'network_error' };
    }

    return {
      ok: data.ok !== false,
      text: data.text,
      reason: data.reason,
      truncated: Boolean(data.truncated)
    };
  } catch (error) {
    console.warn('AI advisor request failed:', error);
    return { ok: false, text: failureText('network_error'), reason: 'network_error' };
  }
}
