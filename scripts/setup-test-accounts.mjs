import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xnfoobubyqbzzcuavfre.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZm9vYnVieXFienpjdWF2ZnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwNjkyMDQsImV4cCI6MjEwMzY0NTIwNH0.Qc8C58bnJeEASvNEArG5fZs7oo2nCWPViVo9ooXw7xc';

async function setupAccount(email, password, displayName, plan, expiresAt) {
  // Create client instance for this user
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  console.log(`\n--- Setting up ${plan.toUpperCase()} account for: ${email} ---`);
  
  // 1. Try to sign in first
  let { data: authData, error: signInError } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (signInError) {
    console.log(`Sign-in failed (${signInError.message}). Attempting sign-up...`);
    const { data: signUpData, error: signUpError } = await client.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } }
    });

    if (signUpError) {
      console.error(`Sign up error for ${email}:`, signUpError);
      return null;
    }
    authData = signUpData;
    console.log(`Successfully registered: ${email}`);
  } else {
    console.log(`Successfully signed in as: ${email}`);
  }

  const userId = authData.user?.id;
  if (!userId) {
    console.error('No user ID found in authData');
    return null;
  }

  console.log(`User ID: ${userId}`);

  // 2. Upsert profile
  const { error: profileError } = await client
    .from('profiles')
    .upsert({
      id: userId,
      display_name: displayName
    });

  if (profileError) {
    console.warn(`Profile upsert error:`, profileError);
  } else {
    console.log(`Profile synced for ${displayName}`);
  }

  // 3. Upsert subscription in Supabase
  const { data: subData, error: subError } = await client
    .from('subscriptions')
    .upsert({
      user_id: userId,
      plan: plan,
      revenuecat_customer_id: `rc_${userId}`,
      expires_at: expiresAt
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (subError) {
    console.warn(`Subscription upsert note:`, subError);
  } else {
    console.log(`Subscription active: Plan = ${subData?.plan}, Expires = ${subData?.expires_at}`);
  }

  return {
    email,
    password,
    displayName,
    userId,
    plan,
    expiresAt
  };
}

async function main() {
  console.log('🚀 PACT Supabase Pro & Free Account Creator');

  // Account 1: Free Tier
  const freeAccount = await setupAccount(
    'tester.free@pact.travel',
    'PactTest2026!',
    'Free Tier Tester',
    'free',
    null
  );

  // Account 2: Pro / Premium Tier
  const proAccount = await setupAccount(
    'tester.pro@pact.travel',
    'PactTest2026!',
    'Pro Tier Tester',
    'premium_annual',
    '2028-12-31T23:59:59Z'
  );

  console.log('\n======================================================');
  console.log('✅ Accounts Setup Summary:');
  console.log('Free Account:', freeAccount);
  console.log('Pro Account:', proAccount);
  console.log('======================================================\n');
}

main();
