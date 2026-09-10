import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code') || 'PACT';
    const circleId = url.searchParams.get('circle_id');
    let circleName = url.searchParams.get('name') || 'Trip Circle';
    let lockedCount = parseInt(url.searchParams.get('locked') || '3', 10);
    let totalCount = parseInt(url.searchParams.get('total') || '5', 10);

    // If Supabase credentials exist, fetch live circle status
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (supabaseUrl && supabaseAnonKey && (circleId || code)) {
      try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        let query = supabase.from('groups').select('id, name, member_count');
        if (circleId) {
          query = query.eq('id', circleId);
        } else {
          query = query.ilike('name', `%${code}%`);
        }
        const { data, error } = await query.maybeSingle();
        if (data && !error) {
          circleName = data.name || circleName;
          totalCount = data.member_count || totalCount;
        }
      } catch (_err) {
        // Fall back gracefully to query params or defaults
      }
    }

    if (isNaN(lockedCount) || lockedCount < 0) lockedCount = 3;
    if (isNaN(totalCount) || totalCount < 1) totalCount = 5;
    if (lockedCount > totalCount) totalCount = lockedCount;

    const remaining = totalCount - lockedCount;
    const progressPercent = Math.min(100, Math.round((lockedCount / totalCount) * 100));

    // Generate responsive, high-res OpenGraph Card SVG (1200x630)
    const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#090A0F" />
          <stop offset="50%" stop-color="#11131B" />
          <stop offset="100%" stop-color="#090A0F" />
        </linearGradient>
        <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FF5A5F" />
          <stop offset="100%" stop-color="#FF7E82" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3DE0A0" />
          <stop offset="100%" stop-color="#22C55E" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- Background Canvas -->
      <rect width="1200" height="630" fill="url(#bg)" />
      
      <!-- Outer Card Container -->
      <rect x="40" y="40" width="1120" height="550" rx="24" fill="#13151E" stroke="#262A3B" stroke-width="2" />
      
      <!-- Top Brand Bar -->
      <g transform="translate(80, 85)">
        <!-- Compass Icon -->
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#FF5A5F" fill-opacity="0.15" stroke="#FF5A5F" stroke-width="1.5" />
        <circle cx="24" cy="24" r="12" fill="none" stroke="#FF5A5F" stroke-width="2" />
        <polygon points="24,16 28,24 24,21 20,24" fill="#FF5A5F" />
        <polygon points="24,32 28,24 24,27 20,24" fill="#FF5A5F" fill-opacity="0.6" />
        
        <text x="64" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="#FF5A5F" letter-spacing="2">PACT</text>
        <text x="64" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#8E95A8" letter-spacing="1">ZERO-KNOWLEDGE GROUP TRIP CONSENSUS</text>

        <!-- Status Pill -->
        <rect x="800" y="4" width="180" height="38" rx="19" fill="#1B2232" stroke="#3DE0A0" stroke-width="1" />
        <circle cx="820" cy="23" r="5" fill="#3DE0A0" filter="url(#glow)" />
        <text x="834" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#3DE0A0">LIVE BALLOT</text>
      </g>

      <!-- Center Content: Circle Title -->
      <g transform="translate(80, 190)">
        <text x="0" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#D4AF37" letter-spacing="1.5">CONFIDENTIAL TRIP INVITATION</text>
        <text x="0" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">${circleName}</text>
        <text x="0" y="130" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#A1A7B8">
          Submit your dates &amp; budget in private. Nobody sees your exact numbers.
        </text>
      </g>

      <!-- Meter Card -->
      <g transform="translate(80, 360)">
        <rect x="0" y="0" width="960" height="120" rx="16" fill="#181B26" stroke="#2B3044" stroke-width="1.5" />
        
        <!-- Meter Text Header -->
        <text x="28" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="800" fill="#FFFFFF">
          CONSENSUS READINESS: <tspan fill="#3DE0A0">${lockedCount} of ${totalCount} LOCKED</tspan>
        </text>
        <text x="932" y="36" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#F59E0B">
          ${remaining > 0 ? `${remaining} needed to unlock reveal` : 'Consensus Ready!'}
        </text>

        <!-- Progress Bar Background -->
        <rect x="28" y="52" width="904" height="16" rx="8" fill="#252A3C" />
        <!-- Progress Bar Fill -->
        <rect x="28" y="52" width="${Math.max(20, Math.round((904 * progressPercent) / 100))}" height="16" rx="8" fill="url(#emeraldGrad)" />

        <!-- Status Details -->
        <text x="28" y="96" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#7C849B">
          Invite Code: <tspan fill="#FF5A5F" font-weight="800">${code}</tspan> • 100% Zero-Knowledge Privacy Guarantee
        </text>
      </g>

      <!-- Bottom Feature Badges -->
      <g transform="translate(80, 520)">
        <!-- Badge 1 -->
        <rect x="0" y="0" width="220" height="34" rx="17" fill="#1A1F2C" stroke="#2C344A" stroke-width="1" />
        <text x="24" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#D2D6E2">🔒 Zero-Leak Privacy</text>

        <!-- Badge 2 -->
        <rect x="236" y="0" width="230" height="34" rx="17" fill="#1A1F2C" stroke="#2C344A" stroke-width="1" />
        <text x="256" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#D2D6E2">⚡ Pareto Optimal Match</text>

        <!-- Badge 3 -->
        <rect x="482" y="0" width="240" height="34" rx="17" fill="#1A1F2C" stroke="#2C344A" stroke-width="1" />
        <text x="502" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#D2D6E2">🤝 Zero Peer Pressure</text>

        <text x="960" y="23" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#FF5A5F">
          Tap link to join →
        </text>
      </g>
    </svg>
    `;

    return new Response(svg, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=15, s-maxage=30',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
