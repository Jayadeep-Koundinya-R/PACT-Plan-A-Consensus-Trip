import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

interface SkeletonLoaderProps {
  isDarkMode?: boolean;
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  isDarkMode = true,
  count = 2
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <View
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
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12
  },
  skeletonCard: {
    borderRadius: radius.card,
    padding: 20,
    borderWidth: 1,
    gap: 10
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  badgeSkeleton: {
    width: 90,
    height: 22,
    borderRadius: radius.pill
  },
  voteSkeleton: {
    width: 44,
    height: 28,
    borderRadius: radius.pill
  },
  titleSkeleton: {
    width: '70%',
    height: 22,
    borderRadius: radius.sm
  },
  subSkeleton: {
    width: '90%',
    height: 14,
    borderRadius: radius.sm
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12
  },
  metaItemSkeleton: {
    width: 110,
    height: 16,
    borderRadius: radius.sm
  },
  scoreBoxSkeleton: {
    height: 54,
    borderRadius: radius.md
  }
});
