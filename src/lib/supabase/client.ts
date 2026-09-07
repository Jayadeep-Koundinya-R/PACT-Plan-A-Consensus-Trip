import { createClient } from '@supabase/supabase-js';

let storageAdapter: any = undefined;
try {
  // Safe dynamic import to allow pure Node unit tests to run without React Native Flow syntax errors
  // @ts-ignore
  const { Platform } = require('react-native');
  if (Platform && Platform.OS !== 'web') {
    storageAdapter = require('@react-native-async-storage/async-storage').default;
  }
} catch (e) {
  storageAdapter = undefined;
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://pact-offline-mock.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.dummy-signature-for-local-offline-mock';

export const isLiveSupabaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
