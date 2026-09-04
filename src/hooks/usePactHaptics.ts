/**
 * usePactHaptics — unified haptic feedback hook for PACT
 *
 * Wraps expo-haptics with 5 named presets and a throttled slider preset.
 * Falls back silently on web where Haptics is unavailable.
 */
import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const IS_NATIVE = Platform.OS !== 'web';

export function usePactHaptics() {
  const lastSliderTs = useRef(0);

  /** Light tap — chip toggles, small UI taps */
  const tap = useCallback(() => {
    if (!IS_NATIVE) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
  }, []);

  /** Medium impact — primary CTA presses, card selections */
  const action = useCallback(() => {
    if (!IS_NATIVE) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
  }, []);

  /** Success notification — form submit, vote locked, consensus reached */
  const success = useCallback(() => {
    if (!IS_NATIVE) return;
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
  }, []);

  /** Warning notification — dealbreaker toggled, budget warning */
  const warning = useCallback(() => {
    if (!IS_NATIVE) return;
    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch {}
  }, []);

  /** Throttled selection tick — budget slider / date scroll (max once per 80ms) */
  const slider = useCallback(() => {
    if (!IS_NATIVE) return;
    const now = Date.now();
    if (now - lastSliderTs.current < 80) return;
    lastSliderTs.current = now;
    try { Haptics.selectionAsync(); } catch {}
  }, []);

  return { tap, action, success, warning, slider };
}