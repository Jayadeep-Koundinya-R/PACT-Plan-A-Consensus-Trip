import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ViewStyle } from 'react-native';
import { ShieldCheck, ShieldAlert, Calendar, DollarSign, Sparkles } from 'lucide-react-native';
import { fontDisplay, fontUI, fontUIBold } from '../../theme/typography';

export interface ConsensusHeatmapProps {
  datesScore: number; // 0 to 100 (or 0.0 to 1.0)
  datesCaption?: string;
  budgetScore: number; // 0 to 100 (or 0.0 to 1.0)
  budgetCaption?: string;
  vibeScore: number; // 0 to 100 (or 0.0 to 1.0)
  vibeTags?: string[];
  hasVeto?: boolean;
  vetoLabel?: string;
  isCompact?: boolean;
  destinationName?: string;
  totalScore?: number;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * Normalizes score to 0..100 integer range.
 */
function normalizeScore(score: number): number {
  if (typeof score !== 'number' || isNaN(score)) return 0;
  if (score <= 1.0 && score > 0) return Math.min(100, Math.max(0, Math.round(score * 100)));
  return Math.min(100, Math.max(0, Math.round(score)));
}

export const ConsensusHeatmap: React.FC<ConsensusHeatmapProps> = ({
  datesScore: rawDatesScore,
  datesCaption = '100% date window overlap across all members',
  budgetScore: rawBudgetScore,
  budgetCaption = '100% budget clearance in Safe Zone',
  vibeScore: rawVibeScore,
  vibeTags = ['beach', 'nightlife', 'seafood'],
  hasVeto = false,
  vetoLabel,
  isCompact = false,
  destinationName,
  totalScore,
  onPress,
  style
}) => {
  const datesPct = normalizeScore(rawDatesScore);
  const budgetPct = normalizeScore(rawBudgetScore);
  const vibePct = normalizeScore(rawVibeScore);

  const datesAnim = useRef(new Animated.Value(0)).current;
  const budgetAnim = useRef(new Animated.Value(0)).current;
  const vibeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(datesAnim, {
        toValue: datesPct,
        duration: 600,
        useNativeDriver: false
      }),
      Animated.timing(budgetAnim, {
        toValue: budgetPct,
        duration: 600,
        useNativeDriver: false
      }),
      Animated.timing(vibeAnim, {
        toValue: vibePct,
        duration: 600,
        useNativeDriver: false
      })
    ]).start();
  }, [datesPct, budgetPct, vibePct, datesAnim, budgetAnim, vibeAnim]);

  const datesBarWidth = datesAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp'
  });

  const budgetBarWidth = budgetAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp'
  });

  const vibeBarWidth = vibeAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp'
  });

  const defaultVetoText = hasVeto
    ? 'Dealbreaker Veto Triggered'
    : 'Zero Dealbreakers Triggered';

  const badgeText = vetoLabel || defaultVetoText;

  const content = (
    <View
      style={[
        styles.container,
        isCompact ? styles.compactContainer : styles.fullContainer,
        hasVeto && styles.vetoContainerBorder,
        style
      ]}
      accessibilityRole={onPress ? 'button' : 'summary'}
      accessibilityLabel={`Consensus Heatmap${destinationName ? ` for ${destinationName}` : ''}. Dates overlap: ${datesPct}%. Budget safety: ${budgetPct}%. Vibe match: ${vibePct}%. ${badgeText}.`}
    >
      {/* Veto Badge Header */}
      <View style={styles.badgeHeaderRow}>
        <View style={hasVeto ? styles.vetoBadge : styles.zeroVetoBadge}>
          {hasVeto ? (
            <ShieldAlert size={14} color="#EF4444" />
          ) : (
            <ShieldCheck size={14} color="#3DE0A0" />
          )}
          <Text style={hasVeto ? styles.vetoBadgeText : styles.zeroVetoBadgeText}>
            {badgeText}
          </Text>
        </View>

        {typeof totalScore === 'number' && (
          <View style={styles.totalScoreChip}>
            <Text style={styles.totalScoreText}>{totalScore}% Match</Text>
          </View>
        )}
      </View>

      {/* Meter 1: Dates Overlap Meter (Emerald #3DE0A0) */}
      <View style={styles.meterBlock}>
        <View style={styles.meterHeader}>
          <View style={styles.meterLabelRow}>
            <Calendar size={13} color="#3DE0A0" />
            <Text style={styles.meterTitle}>Dates Overlap</Text>
          </View>
          <Text style={[styles.meterPctText, { color: '#3DE0A0' }]}>{datesPct}%</Text>
        </View>
        <View style={styles.trackBackground}>
          <Animated.View
            style={[
              styles.trackFill,
              { width: datesBarWidth, backgroundColor: '#3DE0A0' }
            ]}
          />
        </View>
        {!isCompact && datesCaption ? (
          <Text style={styles.meterCaption}>{datesCaption}</Text>
        ) : null}
      </View>

      {/* Meter 2: Budget Safety Meter (Teal #2DD4BF) */}
      <View style={styles.meterBlock}>
        <View style={styles.meterHeader}>
          <View style={styles.meterLabelRow}>
            <DollarSign size={13} color="#2DD4BF" />
            <Text style={styles.meterTitle}>Budget Safety</Text>
          </View>
          <Text style={[styles.meterPctText, { color: '#2DD4BF' }]}>{budgetPct}%</Text>
        </View>
        <View style={styles.trackBackground}>
          <Animated.View
            style={[
              styles.trackFill,
              { width: budgetBarWidth, backgroundColor: '#2DD4BF' }
            ]}
          />
        </View>
        {!isCompact && budgetCaption ? (
          <Text style={styles.meterCaption}>{budgetCaption}</Text>
        ) : null}
      </View>

      {/* Meter 3: Vibe Match Meter (Gold #D4AF37) */}
      <View style={styles.meterBlock}>
        <View style={styles.meterHeader}>
          <View style={styles.meterLabelRow}>
            <Sparkles size={13} color="#D4AF37" />
            <Text style={styles.meterTitle}>Vibe Match</Text>
          </View>
          <Text style={[styles.meterPctText, { color: '#D4AF37' }]}>{vibePct}%</Text>
        </View>
        <View style={styles.trackBackground}>
          <Animated.View
            style={[
              styles.trackFill,
              { width: vibeBarWidth, backgroundColor: '#D4AF37' }
            ]}
          />
        </View>
        {!isCompact && vibeTags && vibeTags.length > 0 ? (
          <View style={styles.vibeTagsRow}>
            {vibeTags.map((tag, idx) => (
              <View key={idx} style={styles.vibeTagPill}>
                <Text style={styles.vibeTagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {/* Privacy Guarantee Note */}
      {!isCompact && (
        <View style={styles.privacyNoteBox}>
          <Text style={styles.privacyNoteText}>
            🔒 Anonymized aggregate snapshot — individual member names, private dollar caps, and veto author identities remain 100% sealed.
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={styles.touchWrapper}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  touchWrapper: {
    minHeight: 44,
    minWidth: 44,
    width: '100%'
  },
  container: {
    backgroundColor: '#13151E',
    borderRadius: 16,
    width: '100%',
    minHeight: 44
  },
  fullContainer: {
    borderWidth: 1.5,
    borderColor: '#3DE0A0',
    padding: 16,
    gap: 12
  },
  compactContainer: {
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    padding: 12,
    gap: 8
  },
  vetoContainerBorder: {
    borderColor: '#EF4444'
  },
  badgeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  zeroVetoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    minHeight: 28
  },
  zeroVetoBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#3DE0A0'
  },
  vetoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    minHeight: 28
  },
  vetoBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444'
  },
  totalScoreChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  totalScoreText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#F4F3F0'
  },
  meterBlock: {
    gap: 4
  },
  meterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  meterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  meterTitle: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#F4F3F0'
  },
  meterPctText: {
    fontFamily: fontDisplay,
    fontSize: 12,
    fontWeight: '700'
  },
  trackBackground: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  trackFill: {
    height: '100%',
    borderRadius: 3
  },
  meterCaption: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98',
    marginTop: 2
  },
  vibeTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4
  },
  vibeTagPill: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6
  },
  vibeTagText: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#D4AF37'
  },
  privacyNoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 2
  },
  privacyNoteText: {
    fontFamily: fontUI,
    fontSize: 10,
    color: '#8B8D98',
    lineHeight: 14
  }
});
