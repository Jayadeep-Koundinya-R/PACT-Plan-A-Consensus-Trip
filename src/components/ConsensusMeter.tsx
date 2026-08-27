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
  isDarkMode = true,
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
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isPassing
                  ? theme.successLight
                  : percentage >= 50
                  ? theme.warningLight
                  : theme.dangerLight
              }
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isPassing
                    ? theme.success
                    : percentage >= 50
                    ? theme.warning
                    : theme.danger
                }
              ]}
            >
              {percentage}% {isPassing ? 'Consensus Reached' : `Goal: ${threshold}%`}
            </Text>
          </View>
        </View>
      )}

      {/* Progress Track */}
      <View
        style={[
          styles.track,
          {
            backgroundColor: theme.meterTrack,
            borderColor: theme.glassBorder
          }
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${Math.min(100, Math.max(0, percentage))}%`,
              backgroundColor: fillColor,
              shadowColor: fillColor,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isPassing ? 0.6 : 0.3,
              shadowRadius: 8,
              elevation: 3
            }
          ]}
        />
        {/* 70% Threshold Marker Line */}
        <View
          style={[
            styles.thresholdMarker,
            {
              left: `${threshold}%`,
              backgroundColor: isPassing ? '#FFFFFF' : '#94A3B8'
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    width: '100%'
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  track: {
    height: 12,
    borderRadius: radius.pill,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 3,
    zIndex: 4,
    opacity: 0.95
  }
});
