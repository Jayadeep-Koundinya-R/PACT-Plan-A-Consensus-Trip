import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  TouchableOpacity
} from 'react-native';
import { fontUI, fontUIBold } from '../../theme/typography';
import { WifiOff, RefreshCw } from 'lucide-react-native';

export interface SyncBadgeProps {
  /** Optional override for testing or manual triggers */
  isOffline?: boolean;
  /** Force badge to be visible */
  forceShow?: boolean;
  /** Optional callback to trigger manual sync retry */
  onRetry?: () => void;
}

/**
 * SyncBadge - Lightweight floating offline indicator
 * Displays "Offline - Changes saved locally" with an amber dot when network drops.
 * Slides down smoothly and persists offline changes message.
 */
export const SyncBadge: React.FC<SyncBadgeProps> = ({
  isOffline: propIsOffline,
  forceShow = false,
  onRetry
}) => {
  const [isOffline, setIsOffline] = useState(
    propIsOffline ?? (Platform.OS === 'web' && typeof navigator !== 'undefined' ? !navigator.onLine : false)
  );

  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const dotPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (propIsOffline !== undefined) {
      setIsOffline(propIsOffline);
    }
  }, [propIsOffline]);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const shouldShow = forceShow || isOffline;

  useEffect(() => {
    if (shouldShow) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();

      // Pulsing amber dot
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(dotPulse, {
            toValue: 0.35,
            duration: 700,
            useNativeDriver: true
          }),
          Animated.timing(dotPulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true
          })
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [shouldShow, translateY, opacity, dotPulse]);

  if (!shouldShow && opacity._value === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          transform: [{ translateY }],
          opacity
        }
      ]}
      pointerEvents={shouldShow ? 'auto' : 'none'}
    >
      <View style={styles.badgePill}>
        {/* Pulsing Amber Dot */}
        <Animated.View style={[styles.amberDot, { opacity: dotPulse }]} />
        <WifiOff size={13} color="#F59E0B" style={styles.icon} />
        <Text style={styles.badgeText}>Offline — Changes saved locally</Text>
        {onRetry && (
          <TouchableOpacity onPress={onRetry} activeOpacity={0.7} style={styles.retryBtn}>
            <RefreshCw size={11} color="#F59E0B" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
    elevation: 10
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161824',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8
  },
  amberDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 6
  },
  icon: {
    marginRight: 6
  },
  badgeText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#F4F3F0',
    letterSpacing: 0.2
  },
  retryBtn: {
    marginLeft: 8,
    padding: 3
  }
});