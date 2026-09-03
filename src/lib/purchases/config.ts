import { Platform } from 'react-native';

// API keys are injected at EAS build time via EXPO_PUBLIC_ env vars.
// Never commit literal API key strings.
const IOS_RC_KEY = process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '';
const ANDROID_RC_KEY = process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '';

/**
 * Initialize the RevenueCat SDK.
 * Uses lazy require so the native-only SDK is never imported on web.
 * Safe to call on every app start — no-ops gracefully when:
 *  - Platform is web
 *  - Key is empty (Expo Go, CI environments)
 */
export function initPurchases(): void {
  if (Platform.OS === 'web') return;

  const key = Platform.OS === 'ios' ? IOS_RC_KEY : ANDROID_RC_KEY;
  if (!key) {
    // Graceful no-op: running in Expo Go or missing EAS secret
    return;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Purchases = require('react-native-purchases').default;
    Purchases.configure({ apiKey: key });
  } catch (e) {
    // SDK not available in this build environment
  }
}
