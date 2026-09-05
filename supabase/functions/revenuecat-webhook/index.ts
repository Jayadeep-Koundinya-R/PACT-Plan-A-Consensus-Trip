// RevenueCat Webhook -> Supabase Edge Function Handler
// Synchronizes subscription lifecycle and circle.has_pro flag
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

interface RevenueCatEvent {
  id: string;
  type: 'INITIAL_PURCHASE' | 'RENEWAL' | 'CANCELLATION' | 'EXPIRATION' | 'PRODUCT_CHANGE' | 'UNCANCELLATION';
  app_user_id: string;
  original_app_user_id: string;
  product_id: string;
  entitlement_ids?: string[];
  period_type?: string;
  purchased_at_ms: number;
  expiration_at_ms?: number;
  environment: 'SANDBOX' | 'PRODUCTION';
}

interface WebhookPayload {
  api_version: string;
  event: RevenueCatEvent;
}

export function determineProStatus(event: RevenueCatEvent): {
  isPro: boolean;
  plan: 'free' | 'premium_monthly' | 'premium_annual';
  expiresAt: string | null;
} {
  const activeEvents = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE'];
  const isExpiredOrCancelled = event.type === 'EXPIRATION';

  const isPro = activeEvents.includes(event.type) && !isExpiredOrCancelled;
  const isAnnual = (event.product_id || '').toLowerCase().includes('annual') || (event.product_id || '').toLowerCase().includes('yr');
  const plan = isPro ? (isAnnual ? 'premium_annual' : 'premium_monthly') : 'free';
  const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;

  return { isPro, plan, expiresAt };
}

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Verify auth header for webhook security
  const authHeader = req.headers.get('Authorization');
  const webhookSecret = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
  if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload: WebhookPayload = await req.json();
    const event = payload?.event;
    if (!event) {
      return new Response(JSON.stringify({ error: 'Missing event in payload' }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const userId = event.app_user_id;
    const { isPro, plan, expiresAt } = determineProStatus(event);

    // 1. Sync public.subscriptions
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      revenuecat_customer_id: event.original_app_user_id || userId,
      plan,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // 2. Cascade Pro status to all Circles organized by this user
    // A circle has_pro if its organizer is a Pro subscriber
    const { error: circleError } = await supabase
      .from('groups')
      .update({ has_pro: isPro })
      .eq('organizer_id', userId);

    if (circleError) {
      console.error('Error updating circle has_pro status:', circleError);
    }

    return new Response(JSON.stringify({
      success: true,
      userId,
      isPro,
      plan,
      expiresAt,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
