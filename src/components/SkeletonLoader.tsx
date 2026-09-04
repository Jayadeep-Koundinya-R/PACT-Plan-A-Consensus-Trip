import React, { useEffect, useRef, ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Animated, Easing } from 'react-native';
import { colors, radius } from '../theme/colors';

export interface ShimmerViewProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  minOpacity?: number;
  maxOpacity?: number;
  durationMs?: number;
}

/**
 * ShimmerView - Cross-platform opacity shimmer
 * Uses React Native Animated API running with native driver on mobile and CSS transitions on web.
 * Completely SSR-safe and works seamlessly across Web, iOS, and Android.
 */
export const ShimmerView: React.FC<ShimmerViewProps> = ({
  children,
  style,
  minOpacity = 0.4,
  maxOpacity = 0.8,
  durationMs = 750
}) => {
  const opacity = useRef(new Animated.Value(minOpacity)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: maxOpacity,
          duration: durationMs,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(opacity, {
          toValue: minOpacity,
          duration: durationMs,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [minOpacity, maxOpacity, durationMs]);

  return (
    <Animated.View style={[style, { opacity }]}>
      {children}
    </Animated.View>
  );
};

/**
 * VaultDocSkeleton - Shimmer skeleton for Vault documents
 */
export const VaultDocSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={styles.vaultContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerView key={i} style={styles.vaultCard}>
          <View style={styles.docIconBox} />
          <View style={styles.docContent}>
            <View style={styles.docTitleSkeleton} />
            <View style={styles.docMetaSkeleton} />
          </View>
          <View style={styles.docActionSkeleton} />
        </ShimmerView>
      ))}
    </View>
  );
};

/**
 * MemoryPhotoSkeleton - Shimmer skeleton for Memory photo library cards
 */
export const MemoryPhotoSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <View style={styles.photoGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <ShimmerView key={i} style={styles.photoCard}>
          <View style={styles.photoAuthorSkeleton} />
        </ShimmerView>
      ))}
    </View>
  );
};

interface SkeletonLoaderProps {
  isDarkMode?: boolean;
  count?: number;
}

/**
 * SkeletonLoader - General purpose shimmer loader cards
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  isDarkMode = true,
  count = 2
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <ShimmerView
          key={idx}
          style={[
            styles.skeletonCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.glassBorder
            }
          ]}
        >
          {/* Top row */}
          <View style={styles.topRow}>
            <View style={[styles.badgeSkeleton, { backgroundColor: theme.surfaceElevated }]} />
            <View style={[styles.voteSkeleton, { backgroundColor: theme.surfaceElevated }]} />
          </View>

          {/* Title */}
          <View style={[styles.titleSkeleton, { backgroundColor: theme.surfaceElevated }]} />

          {/* Subtitle */}
          <View style={[styles.subSkeleton, { backgroundColor: theme.surfaceElevated }]} />

          {/* Meta row */}
          <View style={styles.metaRow}>
            <View style={[styles.metaItemSkeleton, { backgroundColor: theme.surfaceElevated }]} />
            <View style={[styles.metaItemSkeleton, { backgroundColor: theme.surfaceElevated }]} />
          </View>

          {/* Score Box */}
          <View style={[styles.scoreBoxSkeleton, { backgroundColor: theme.surfaceSubtle }]} />
        </ShimmerView>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 16
  },
  skeletonCard: {
    borderRadius: radius.card,
    padding: 16,
    borderWidth: 1
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  badgeSkeleton: {
    width: 80,
    height: 24,
    borderRadius: radius.pill
  },
  voteSkeleton: {
    width: 60,
    height: 20,
    borderRadius: 6
  },
  titleSkeleton: {
    height: 22,
    borderRadius: 6,
    width: '70%',
    marginBottom: 8
  },
  subSkeleton: {
    height: 14,
    borderRadius: 4,
    width: '90%',
    marginBottom: 16
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  metaItemSkeleton: {
    height: 16,
    width: 70,
    borderRadius: 4
  },
  scoreBoxSkeleton: {
    height: 60,
    borderRadius: radius.md
  },
  // Vault Skeleton Styles
  vaultContainer: {
    gap: 10,
    marginBottom: 20
  },
  vaultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13151E',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  docIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 12
  },
  docContent: {
    flex: 1,
    gap: 6
  },
  docTitleSkeleton: {
    height: 14,
    width: '65%',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)'
  },
  docMetaSkeleton: {
    height: 10,
    width: '45%',
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  docActionSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)'
  },
  // Memory Photos Skeleton Styles
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20
  },
  photoCard: {
    width: '48%',
    height: 130,
    borderRadius: 12,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'flex-end',
    padding: 10
  },
  photoAuthorSkeleton: {
    height: 12,
    width: '50%',
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  }
});