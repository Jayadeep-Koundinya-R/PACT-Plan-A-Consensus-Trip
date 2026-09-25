import * as Haptics from 'expo-haptics';
import { CircleRouteGuard } from '../../../src/components/common';
import { SkeletonLoader } from '../../../src/components/SkeletonLoader';
import { EmptyState } from '../../../src/components/EmptyState';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
  BackHandler
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { usePactHaptics } from '../../../src/hooks/usePactHaptics';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Check, X, Shield, Lock } from 'lucide-react-native';
import { WaxSealStamp } from '../../../src/components/WaxSealStamp';
import { resolveTripOptionsForCircle } from '../../../src/lib/consensus/dynamicOptions';

interface StampBallotCardProps {
  opt: {
    key: string;
    name: string;
    match: number;
    dates: string;
    price: string;
  };
  vote: 'approve' | 'reject' | null;
  rank: number | undefined;
  onVote: (key: string, decision: 'approve' | 'reject') => void;
  onRank: (key: string, rank: number) => void;
  haptics: ReturnType<typeof usePactHaptics>;
}

const StampBallotCard: React.FC<StampBallotCardProps> = ({
  opt,
  vote,
  rank,
  onVote,
  onRank,
  haptics
}) => {
  const cardScale = useSharedValue(1);
  const glowPulse = useSharedValue(0);
  const glowColor = useSharedValue('#3DE0A0');

  const triggerImpactHaptic = (decision: 'approve' | 'reject') => {
    if (decision === 'approve') {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (e) {}
      }
      haptics.success();
    } else {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {}
      }
      haptics.action();
    }
  };

  const handleDecision = (decision: 'approve' | 'reject') => {
    const isApprove = decision === 'approve';
    glowColor.value = isApprove ? '#3DE0A0' : '#FF5A5F';

    // Fast stamp-down: scale down to 0.92 and spring back with responsive tension
    cardScale.value = withSequence(
      withTiming(0.92, { duration: 60 }, (finished) => {
        if (finished) {
          runOnJS(triggerImpactHaptic)(decision);
        }
      }),
      withSpring(1, { damping: 8, stiffness: 360 })
    );

    glowPulse.value = withSequence(
      withTiming(1, { duration: 75 }),
      withTiming(0, { duration: 380 })
    );

    onVote(opt.key, decision);
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    const baseBorderColor =
      vote === 'approve'
        ? '#3DE0A0'
        : vote === 'reject'
        ? '#FF5A5F'
        : 'rgba(255, 255, 255, 0.14)';

    return {
      transform: [{ scale: cardScale.value }],
      borderColor: interpolateColor(
        glowPulse.value,
        [0, 1],
        [baseBorderColor, glowColor.value]
      )
    };
  });

  return (
    <Animated.View
      style={[
        styles.ballotCard,
        vote === 'approve' && styles.ballotCardApproved,
        vote === 'reject' && styles.ballotCardRejected,
        animatedCardStyle
      ]}
    >
      {/* Wax Seal Stamp feedback for both Approved (Emerald) and Vetoed (Crimson) */}
      {vote === 'approve' && (
        <WaxSealStamp
          key={`approved-${opt.key}`}
          label="SEALED"
          sublabel="APPROVED"
          variant="emerald"
        />
      )}
      {vote === 'reject' && (
        <WaxSealStamp
          key={`vetoed-${opt.key}`}
          label="SEALED"
          sublabel="VETOED"
          variant="crimson"
        />
      )}

      <View style={styles.cardHeaderRow}>
        <Text style={styles.destName}>{opt.name}</Text>
        <Text
          style={[
            styles.matchScore,
            vote === 'reject' && { color: '#FF5A5F' }
          ]}
        >
          {opt.match}% match
        </Text>
      </View>

      <Text style={styles.destMeta}>
        {opt.dates}  •  Est. {opt.price}
      </Text>

      {/* Voting Action Buttons ($44x44pt minimum touch target) */}
      <View style={[styles.voteButtonsRow, vote === 'approve' && { marginBottom: 14 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleDecision('approve')}
          style={[
            styles.approveBtn,
            vote === 'approve' && styles.approveBtnActive
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: vote === 'approve' }}
          accessibilityLabel={`Approve ${opt.name}`}
          accessibilityHint="Marks option as approved and enables preference ranking"
        >
          <Check size={18} color={vote === 'approve' ? '#052E20' : '#8B8D98'} />
          <Text
            style={[
              styles.approveBtnText,
              vote === 'approve' && { color: '#052E20' }
            ]}
          >
            Approve
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleDecision('reject')}
          style={[
            styles.rejectBtn,
            vote === 'reject' && styles.rejectBtnActive
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: vote === 'reject' }}
          accessibilityLabel={`Veto ${opt.name}`}
          accessibilityHint="Vetoes option from your preferences and clears ranking"
        >
          <X size={18} color={vote === 'reject' ? '#2E0805' : '#8B8D98'} />
          <Text
            style={[
              styles.rejectBtnText,
              vote === 'reject' && { color: '#2E0805' }
            ]}
          >
            Reject / Veto
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rank Selection Chips strictly for Approved options only */}
      {vote === 'approve' && (
        <View style={styles.rankChipsContainer}>
          <Text style={styles.rankLabelText}>Select Preference Rank:</Text>
          <View style={styles.rankChipsRow}>
            {[1, 2].map((r) => (
              <TouchableOpacity
                key={r}
                activeOpacity={0.8}
                onPress={() => {
                  haptics.tap();
                  onRank(opt.key, r);
                }}
                style={[
                  styles.rankChip,
                  rank === r && styles.rankChipActive
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: rank === r }}
                accessibilityLabel={`Rank ${opt.name} as number ${r} choice`}
                accessibilityHint={`Sets preference rank for ${opt.name} to #${r}`}
              >
                <Text
                  style={[
                    styles.rankChipText,
                    rank === r && { color: '#052E20', fontWeight: '800' }
                  ]}
                >
                  Rank #{r} Choice
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Clear indicator if option was rejected */}
      {vote === 'reject' && (
        <View style={styles.rejectedBanner}>
          <Text style={styles.rejectedBannerText}>
            Vetoed from your preferences (Ranking disabled)
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

export default function PactSilentBallot() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined' || id === '[id]') {
    return (
      <CircleRouteGuard id={id}>
        <View />
      </CircleRouteGuard>
    );
  }

  const router = useRouter();
  const { groups = [], members = [], castVote } = useGatherlyStore();
  const haptics = usePactHaptics();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: id && id !== 'undefined' ? id : 'circle-college-reunion-2026',
      name: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82'
    };

  const [isLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Dynamically resolve options for voting
  const resolved = useMemo(() => {
    return resolveTripOptionsForCircle(currentGroup.id, currentGroup.name, members);
  }, [currentGroup.id, currentGroup.name, members]);

  const options = useMemo(() => {
    return resolved.scoredOptions.map((so) => ({
      key: so.option.id,
      name: so.option.name,
      match: Math.round(so.totalScore),
      dates: `${so.option.dateStart} – ${so.option.dateEnd}`,
      price: `$${so.option.budgetPerPerson} / person`
    }));
  }, [resolved]);

  const [votes, setVotes] = useState<Record<string, 'approve' | 'reject' | null>>({});
  const [ranks, setRanks] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (options.length > 0 && Object.keys(votes).length === 0) {
      const initialVotes: Record<string, 'approve' | 'reject' | null> = {};
      const initialRanks: Record<string, number> = {};

      options.forEach((opt, idx) => {
        if (idx === 0) {
          initialVotes[opt.key] = 'approve';
          initialRanks[opt.key] = 1;
        } else {
          initialVotes[opt.key] = 'reject';
        }
      });

      setVotes(initialVotes);
      setRanks(initialRanks);
    }
  }, [options]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const onBackPress = () => {
        Alert.alert(
          'Leave Ballot?',
          'Your voting selections have not been submitted yet.',
          [
            { text: 'Keep Voting', style: 'cancel' },
            { text: 'Leave', style: 'destructive', onPress: () => router.back() }
          ]
        );
        return true;
      };
      const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backSub.remove();
    }
  }, [router]);

  const handleVote = (key: string, decision: 'approve' | 'reject') => {
    const nextVal = votes[key] === decision ? null : decision;
    setVotes((prev) => ({ ...prev, [key]: nextVal }));

    // CRITICAL: Immediately purge ranking when option is vetoed/unselected
    if (nextVal !== 'approve') {
      setRanks((prevRanks) => {
        if (!(key in prevRanks)) return prevRanks;
        const updated = { ...prevRanks };
        delete updated[key];
        return updated;
      });
    }
  };

  const handleRank = (key: string, r: number) => {
    setRanks((prev) => ({ ...prev, [key]: r }));
  };

  const handleCastBallot = async () => {
    haptics.success();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      for (const opt of options) {
        const v = votes[opt.key];
        if (v) {
          await castVote(opt.key, v === 'approve');
        }
      }
      router.push(`/circle/${currentGroup.id}/brief` as any);
    } catch (e) {
      setSubmitError('Failed to record ballot. Navigating to trip brief.');
      setTimeout(() => {
        router.push(`/circle/${currentGroup.id}/brief` as any);
      }, 800);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <View style={styles.phoneFrame}>
          <View style={styles.scrollContent}>
            <View style={styles.headerRow}>
              <View style={styles.backBtn}>
                <ArrowLeft size={18} color="#F4F3F0" />
              </View>
              <Text style={styles.headerTitle}>Loading Silent Ballot...</Text>
            </View>
            <SkeletonLoader count={2} height={140} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Row */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push(`/circle/${currentGroup.id}/hub` as any);
                }
              }}
              activeOpacity={0.7}
              style={styles.backBtn}
              accessibilityRole="button"
              accessibilityLabel="Back to Circle Hub"
              accessibilityHint="Returns to the main Circle Hub screen"
            >
              <ArrowLeft size={18} color="#F4F3F0" />
            </TouchableOpacity>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.headerTitle}>Silent Ballot</Text>
              <Text style={styles.headerSub}>Sealed Anti-Herd Voting</Text>
            </View>

            <View style={styles.sealedBadge}>
              <Lock size={11} color="#3DE0A0" />
              <Text style={styles.sealedBadgeText}>Votes Sealed</Text>
            </View>
          </View>

          {/* Guarantee Banner */}
          <View style={styles.guaranteeBanner}>
            <Shield size={16} color="#3DE0A0" style={{ marginTop: 2 }} />
            <Text style={styles.guaranteeText}>
              <Text style={styles.guaranteeBold}>Zero peer pressure. </Text>
              Individual votes are sealed and revealed simultaneously when all circle members finish.
            </Text>
          </View>

          {submitError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{submitError}</Text>
            </View>
          )}

          {/* Options to Vote On */}
          {options.length === 0 ? (
            <EmptyState
              icon="sparkles"
              title="No Ballot Options Available"
              description="No trip destinations are ready for silent voting."
              actionLabel="Return to Circle Hub"
              onAction={() => router.push(`/circle/${currentGroup.id}/hub` as any)}
            />
          ) : (
            options.map((opt) => (
              <StampBallotCard
                key={opt.key}
                opt={opt}
                vote={votes[opt.key]}
                rank={ranks[opt.key]}
                onVote={handleVote}
                onRank={handleRank}
                haptics={haptics}
              />
            ))
          )}
        </ScrollView>

        {/* Sticky Bottom CTA Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleCastBallot}
            disabled={isSubmitting}
            style={styles.lockBallotBtn}
            accessibilityRole="button"
            accessibilityLabel="Lock & Cast Sealed Ballot"
            accessibilityHint="Submits your sealed ballot for this circle"
          >
            <Lock size={16} color="#2E0805" />
            <Text style={styles.lockBallotBtnText}>
              {isSubmitting ? 'Sealing Ballot...' : 'Lock & Cast Sealed Ballot'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.bottomSubtext}>
            You can modify your vote anytime until the final member locks in.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    height: '100%',
    backgroundColor: '#050608'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  headerSub: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#8B8D98'
  },
  sealedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(61, 224, 160, 0.3)',
    backgroundColor: 'rgba(61, 224, 160, 0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  sealedBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#3DE0A0'
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 16
  },
  guaranteeText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98',
    lineHeight: 18,
    flex: 1
  },
  guaranteeBold: {
    fontFamily: fontUIBold,
    color: '#F4F3F0',
    fontWeight: '700'
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14
  },
  errorBannerText: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#EF4444',
    textAlign: 'center'
  },
  ballotCard: {
    backgroundColor: '#13151E',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    position: 'relative'
  },
  ballotCardApproved: {
    borderColor: '#3DE0A0',
    backgroundColor: 'rgba(61, 224, 160, 0.08)'
  },
  ballotCardRejected: {
    borderColor: '#FF5A5F',
    backgroundColor: 'rgba(255, 90, 95, 0.08)'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  destName: {
    fontFamily: fontDisplay,
    fontSize: 20,
    fontWeight: '700',
    color: '#F4F3F0'
  },
  matchScore: {
    fontFamily: fontUIBold,
    fontSize: 13,
    fontWeight: '700',
    color: '#3DE0A0'
  },
  destMeta: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8D98',
    marginBottom: 16
  },
  voteButtonsRow: {
    flexDirection: 'row',
    gap: 10
  },
  approveBtn: {
    flex: 1,
    minHeight: 44,
    minWidth: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  approveBtnActive: {
    backgroundColor: '#3DE0A0',
    borderColor: '#3DE0A0'
  },
  approveBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#8B8D98'
  },
  rejectBtn: {
    flex: 1,
    minHeight: 44,
    minWidth: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  rejectBtnActive: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F'
  },
  rejectBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#8B8D98'
  },
  rankChipsContainer: {
    marginTop: 10,
    gap: 6
  },
  rankLabelText: {
    fontFamily: fontUIBold,
    fontSize: 10.5,
    color: '#8B8D98'
  },
  rankChipsRow: {
    flexDirection: 'row',
    gap: 8
  },
  rankChip: {
    flex: 1,
    minHeight: 44,
    minWidth: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankChipActive: {
    backgroundColor: '#3DE0A0',
    borderColor: '#3DE0A0'
  },
  rankChipText: {
    fontFamily: fontUIBold,
    fontSize: 12,
    color: '#8B8D98'
  },
  rejectedBanner: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 90, 95, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 95, 0.3)',
    alignItems: 'center'
  },
  rejectedBannerText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    color: '#FF5A5F'
  },
  bottomBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 16 : 12,
    backgroundColor: 'rgba(19, 21, 30, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8
  },
  lockBallotBtn: {
    width: '100%',
    minHeight: 48,
    minWidth: 44,
    borderRadius: 12,
    backgroundColor: '#FF5A5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8
  },
  lockBallotBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#2E0805'
  },
  bottomSubtext: {
    fontFamily: fontUI,
    fontSize: 10.5,
    color: '#8B8D98',
    textAlign: 'center'
  }
});
