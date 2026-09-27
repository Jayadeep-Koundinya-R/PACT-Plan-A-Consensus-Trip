import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * useDemoMode - Hook to gate demo-only features
 * 
 * Reads EXPO_PUBLIC_DEMO_MODE from environment and returns
 * whether demo features should be visible to the user.
 * 
 * Usage:
 *   const { isDemoMode, showDemoFeatures } = useDemoMode();
 *   if (showDemoFeatures) { ... }
 */
export function useDemoMode(): { isDemoMode: boolean; showDemoFeatures: boolean } {
  // Read from Expo Constants (bundled at build time) or process.env
  // @ts-ignore
  const envValue = Constants.expoConfig?.extra?.demoMode ?? 
    // @ts-ignore
    (typeof process !== 'undefined' ? process.env?.EXPO_PUBLIC_DEMO_MODE : null) ?? 
    null;
  
  // Also check globalThis for web compatibility
  // @ts-ignore
  const globalValue = typeof globalThis !== 'undefined' ? globalThis.EXPO_PUBLIC_DEMO_MODE : null;
  
  const rawValue = envValue ?? globalValue;
  
  // Parse the value - handle string "true"/"false" and boolean
  const isDemoMode = rawValue === true || rawValue === 'true' || rawValue === '1';
  
  return {
    isDemoMode,
    showDemoFeatures: isDemoMode
  };
}

export default useDemoMode;
