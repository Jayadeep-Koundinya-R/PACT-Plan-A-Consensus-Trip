import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// API keys are injected at EAS build time via EXPO_PUBLIC_ env vars.
// Never commit literal API key strings.
const IOS_RC_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '';
const ANDROID_RC_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '';

/**
 * Initialize the RevenueCat SDK.
 * Safe to call on every app start — no-ops gracefully when key is empty
 * (Expo Go, web preview, CI environments).
 */
export function initPurchases(): void {
  const key = Platform.OS === 'ios' ? IOS_RC_KEY : ANDROID_RC_KEY;
  if (!key) {
    // Graceful no-op: running in Expo Go, web, or missing EAS secret
    return;
  }
  Purchases.configure({ apiKey: key });
}
