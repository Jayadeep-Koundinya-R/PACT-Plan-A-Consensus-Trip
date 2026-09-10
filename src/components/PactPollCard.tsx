import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Star, ThumbsUp, Ban, Check, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react-native';
import { usePactHaptics } from '../hooks/usePactHaptics';
import { WaxSealStamp } from './WaxSealStamp';
import { fontDisplay, fontUI, fontUIBold } from '../theme/typography';

export type PactPollStance = 'love' | 'down' | 'veto' | null;

export interface PactPollOption {
  key: string;
  name: string;
  match: number;
  dates: string;
  price: string;
  budgetFitPct: number;
  dateFitPct: number;
  tags?: string[];
}

export interface PactPollCardProps {
  option: PactPollOption;
  stance: PactPollStance;
  rank?: number;
  vetoReason?: string;
  onStanceChange: (key: string, stance: PactPollStance) => void;
  onRankChange: (key: string, rank: number) => void;
  onVetoReasonChange?: (key: string, reason: string) => void;
  isSealedView?: boolean;
}

const VETO_REASONS = [
  'Exceeds my flight budget',
  'Work / exam date conflict',
  'Too far / long travel time',
  'Not matching my vibe'
];

export const PactPollCard: React.FC<PactPollCardProps> = ({
  option,
  stance,
  rank,
  vetoReason,
  onStanceChange,
  onRankChange,
  onVetoReasonChange,
  isSealedView = true
}) => {
  const haptics = usePactHaptics();
  const cardScale = useSharedValue(1);
  const glowPulse = useSharedValue(0);
  const glowColor = useSharedValue('#3DE0A0');

  const triggerImpact = (selected: PactPollStance) => {
    if (selected === 'love') {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (e) {}
      }
      haptics.success();
    } else if (selected === 'down') {
      haptics.action();
    } else if (selected === 'veto') {
      haptics.action();
    }
  };

  const handleSelectStance = (newStance: PactPollStance) => {
    const target = stance === newStance ? null : newStance;
    if (target === 'love') {
      glowColor.value = '#D4AF37'; // Gold
    } else if (target === 'down') {
      glowColor.value = '#3DE0A0'; // Emerald
    } else if (target === 'veto') {
      glowColor.value = '#EF4444'; // Red
    } else {
      glowColor.value = '#8B8D98';
    }

    cardScale.value = withSequence(
      withTiming(0.94, { duration: 65 }, (finished) => {
        if (finished) {
          runOnJS(triggerImpact)(target);
        }
      }),
      withSpring(1, { damping: 8, stiffness: 360 })
    );

    glowPulse.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 400 })
    );

    onStanceChange(option.key, target);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      shadowColor: glowColor.value,
      shadowOpacity: glowPulse.value * 0.45,
      shadowRadius: glowPulse.value * 14,
      elevation: glowPulse.value * 4,
      borderColor: interpolateColor(
        glowPulse.value,
        [0, 1],
        ['rgba(255, 255, 255, 0.11)', glowColor.value]
      )
    };
  });

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {/* Wax seal watermark on Love or Down */}
      {stance === 'love' && (
        <WaxSealStamp label="LOVE IT" sublabel="+2 PTS" variant="emerald" />
      )}
      {stance === 'down' && (
        <WaxSealStamp label="SEALED" sublabel="DOWN FOR IT" variant="emerald" />
      )}

      {/* Header row: Destination Name & Pareto Match */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.destTitle}>{option.name}</Text>
          <Text style={styles.destDates}>{option.dates}</Text>
        </View>
        <View style={styles.matchScoreBadge}>
          <Text style={styles.matchScoreText}>{option.match}%</Text>
          <Text style={styles.matchScoreLabel}>Match</Text>
        </View>
      </View>

      {/* PACT Constraint Badges: Real-time Budget & Date Alignment */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.metaBadge,
            option.budgetFitPct === 100 ? styles.badgeGreen : styles.badgeAmber
          ]}
        >
          <Text
            style={[
              styles.metaBadgeText,
              option.budgetFitPct === 100 ? styles.textGreen : styles.textAmber
            ]}
          >
            {option.budgetFitPct === 100 ? '100% Budget Safe' : option.budgetFitPct + '% Budget Fit'}
          </Text>
        </View>

        <View
          style={[
            styles.metaBadge,
            option.dateFitPct === 100 ? styles.badgeGreen : styles.badgeAmber
          ]}
        >
          <Text
            style={[
              styles.metaBadgeText,
              option.dateFitPct === 100 ? styles.textGreen : styles.textAmber
            ]}
          >
            {option.dateFitPct === 100 ? 'All 5 Free' : '1 Date Conflict'}
          </Text>
        </View>

        <View style={[styles.metaBadge, styles.badgeMuted]}>
          <Text style={[styles.metaBadgeText, styles.textMuted]}>
            Est. {option.price}
          </Text>
        </View>
      </View>

      {/* Tags */}
      {option.tags && option.tags.length > 0 && (
        <View style={styles.tagStrip}>
          {option.tags.map((t) => (
            <Text key={t} style={styles.tagItem}>#{t}</Text>
          ))}
        </View>
      )}

      {/* 3-Way Stance Buttons */}
      <View style={styles.stanceRow}>
        {/* Love It Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleSelectStance('love')}
          style={[
            styles.stanceBtn,
            stance === 'love' && styles.stanceBtnLove
          ]}
          accessibilityLabel={'Love it stance for ' + option.name}
        >
          <Star
            size={15}
            color={stance === 'love' ? '#D4AF37' : '#8B8D98'}
            fill={stance === 'love' ? '#D4AF37' : 'none'}
          />
          <Text
            style={[
              styles.stanceBtnText,
              stance === 'love' && styles.stanceBtnTextLove
            ]}
          >
            Love It (+2)
          </Text>
        </TouchableOpacity>

        {/* Down For It Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleSelectStance('down')}
          style={[
            styles.stanceBtn,
            stance === 'down' && styles.stanceBtnDown
          ]}
          accessibilityLabel={'Down for it stance for ' + option.name}
        >
          <ThumbsUp
            size={14}
            color={stance === 'down' ? '#3DE0A0' : '#8B8D98'}
          />
          <Text
            style={[
              styles.stanceBtnText,
              stance === 'down' && styles.stanceBtnTextDown
            ]}
          >
            Down (+1)
          </Text>
        </TouchableOpacity>

        {/* Dealbreaker Veto Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleSelectStance('veto')}
          style={[
            styles.stanceBtn,
            stance === 'veto' && styles.stanceBtnVeto
          ]}
          accessibilityLabel={'Dealbreaker veto for ' + option.name}
        >
          <Ban
            size={14}
            color={stance === 'veto' ? '#EF4444' : '#8B8D98'}
          />
          <Text
            style={[
              styles.stanceBtnText,
              stance === 'veto' && styles.stanceBtnTextVeto
            ]}
          >
            Veto (Block)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Optional Veto Reason Selector if Veto Selected */}
      {stance === 'veto' && (
        <View style={styles.vetoReasonContainer}>
          <View style={styles.vetoReasonHeader}>
            <ShieldAlert size={13} color="#EF4444" />
            <Text style={styles.vetoReasonTitle}>Private Veto Reason (Anonymous to group):</Text>
          </View>
          <View style={styles.vetoChipsRow}>
            {VETO_REASONS.map((r) => {
              const isSelected = vetoReason === r;
              return (
                <TouchableOpacity
                  key={r}
                  activeOpacity={0.75}
                  onPress={() => {
                    haptics.tap();
                    onVetoReasonChange?.(option.key, r);
                  }}
                  style={[
                    styles.vetoChip,
                    isSelected && styles.vetoChipSelected
                  ]}
                  accessibilityLabel={'Veto reason: ' + r}
                >
                  <Text
                    style={[
                      styles.vetoChipText,
                      isSelected && styles.vetoChipTextSelected
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Ranking Chips if Approved (Love or Down) */}
      {(stance === 'love' || stance === 'down') && (
        <View style={styles.rankChipsRow}>
          <Text style={styles.rankPromptText}>Priority Rank:</Text>
          {[1, 2].map((r) => (
            <TouchableOpacity
              key={r}
              activeOpacity={0.8}
              onPress={() => {
                haptics.tap();
                onRankChange(option.key, r);
              }}
              style={[
                styles.rankChip,
                rank === r && styles.rankChipActive
              ]}
              accessibilityLabel={'Rank as #' + r + ' choice'}
            >
              <Text
                style={[
                  styles.rankChipText,
                  rank === r && styles.rankChipTextActive
                ]}
              >
                #{r} Choice
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.11)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  destTitle: {
    fontFamily: fontDisplay,
    fontSize: 18,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  destDates: {
    fontFamily: fontUI,
    fontSize: 13,
    color: '#8B8D98',
    marginTop: 2
  },
  matchScoreBadge: {
    backgroundColor: 'rgba(61, 224, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center'
  },
  matchScoreText: {
    fontFamily: fontUIBold,
    fontSize: 16,
    color: '#3DE0A0',
    fontWeight: '800'
  },
  matchScoreLabel: {
    fontFamily: fontUI,
    fontSize: 9,
    color: '#3DE0A0',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10
  },
  metaBadgeText: {
    fontFamily: fontUI,
    fontSize: 11
  },
  metaBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1
  },
  badgeGreen: {
    backgroundColor: 'rgba(61, 224, 160, 0.08)',
    borderColor: 'rgba(61, 224, 160, 0.25)'
  },
  textGreen: {
    color: '#3DE0A0',
    fontFamily: fontUIBold,
    fontSize: 11
  },
  badgeAmber: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  textAmber: {
    color: '#F59E0B',
    fontFamily: fontUIBold,
    fontSize: 11
  },
  badgeMuted: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  textMuted: {
    color: '#8B8D98',
    fontFamily: fontUI,
    fontSize: 11
  },
  tagStrip: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14
  },
  tagItem: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6C6F7A'
  },
  stanceRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  stanceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  stanceBtnLove: {
    backgroundColor: 'rgba(212, 175, 55, 0.16)',
    borderColor: '#D4AF37'
  },
  stanceBtnDown: {
    backgroundColor: 'rgba(61, 224, 160, 0.16)',
    borderColor: '#3DE0A0'
  },
  stanceBtnVeto: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderColor: '#EF4444'
  },
  stanceBtnText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#8B8D98'
  },
  stanceBtnTextLove: {
    color: '#D4AF37'
  },
  stanceBtnTextDown: {
    color: '#3DE0A0'
  },
  stanceBtnTextVeto: {
    color: '#EF4444'
  },
  vetoReasonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(239, 68, 68, 0.18)'
  },
  vetoReasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  vetoReasonTitle: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#EF4444'
  },
  vetoChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  vetoChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  vetoChipSelected: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#EF4444'
  },
  vetoChipText: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  vetoChipTextSelected: {
    color: '#EF4444',
    fontFamily: fontUIBold
  },
  rankChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)'
  },
  rankPromptText: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  rankChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  rankChipActive: {
    backgroundColor: '#3DE0A0',
    borderColor: '#3DE0A0'
  },
  rankChipText: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  rankChipTextActive: {
    color: '#052E20',
    fontFamily: fontUIBold
  }
});

