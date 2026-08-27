import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

interface ConsensusMeterProps {
  percentage: number;
  threshold?: number;
  isDarkMode?: boolean;
  showLabel?: boolean;
}

export const ConsensusMeter: React.FC<ConsensusMeterProps> = ({
  percentage,
  threshold = 70,
  isDarkMode = false,
  showLabel = true
}) => {
  const theme = isDarkMode ? colors.dark : colors.light;
  const isPassing = percentage >= threshold;
  const fillColor = isPassing ? theme.success : percentage >= 50 ? theme.warning : theme.danger;

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={[styles.title, { color: theme.textSecondary }]}>
            Consensus Meter
          </Text>
          <View style={[styles.badge, { backgroundColor: isPassing ? theme.successLight : theme.secondaryLight }]}>
            <Text style={[styles.badgeText, { color: isPassing ? theme.success : theme.secondary }]}>
              {percentage}% {isPassing ? 'Consensus Reached' : `Goal: ${threshold}%`}
            </Text>
          </View>
        </View>
      )}
      <View style={[styles.track, { backgroundColor: theme.meterTrack }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(0, percentage))}%`,
              backgroundColor: fillColor
            }
          ]}
        />
        {/* Threshold indicator line */}
        <View style={[styles.thresholdMarker, { left: `${threshold}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%'
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700'
  },
  track: {
    height: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
    position: 'relative'
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#64748B',
    opacity: 0.6
  }
});
