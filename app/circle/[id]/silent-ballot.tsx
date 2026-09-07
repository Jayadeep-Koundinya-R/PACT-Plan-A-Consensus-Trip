import * as Haptics from 'expo-haptics';
import { CircleRouteGuard } from '../../../src/components/common';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Rect, Path } from 'react-native-svg';
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
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Check, X, Shield, Lock } from 'lucide-react-native';
import { PactButton } from '../../../src/components/common';
import { WaxSealStamp } from '../../../src/components/WaxSealStamp';


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
  const glowColor = useSharedValue('#58A68C');

  const triggerImpactHaptic = (decision: 'approve' | 'reject') => {
    if (decision === 'approve') {
      if (Platform.OS !== 'web') {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } catch (e) {}
      }
      haptics.success();
    } else {
      haptics.action();
    }
  };

  const handleDecision = (decision: 'approve' | 'reject') => {
    const isApprove = decision === 'approve';
    glowColor.value = isApprove ? '#58A68C' : '#C1503F';

    // Fast stamp-down: scale down to 0.9 and spring back rapidly with high tension
    cardScale.value = withSequence(
      withTiming(0.9, { duration: 65 }, (finished) => {
        if (finished) {
          runOnJS(triggerImpactHaptic)(decision);
        }
      }),
      withSpring(1, { damping: 7, stiffness: 380 })
    );

    // Pulse a subtle shadow/glow pulse on the card
    glowPulse.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 400 })
    );

    onVote(opt.key, decision);
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
      shadowColor: glowColor.value,
      shadowOpacity: glowPulse.value * 0.45,
      shadowRadius: glowPulse.value * 16,
      elevation: glowPulse.value * 4,
      borderColor: interpolateColor(
        glowPulse.value,
        [0, 1],
        ['rgba(243, 238, 226, 0.1)', glowColor.value]
      )
    };
  });

  return (
    <Animated.View style={[styles.ballotCard, animatedCardStyle]}>
      {vote === 'approve' && <WaxSealStamp label="SEALED" sublabel="APPROVED" />}
      <View style={styles.cardHeaderRow}>
        <Text style={styles.destName}>{opt.name}</Text>
        <Text style={styles.matchScore}>{opt.match}%</Text>
      </View>

      <Text style={styles.destMeta}>
        {opt.dates}     Est. {opt.price}
      </Text>

      {/* Voting Action Buttons */}
      <View style={[styles.voteButtonsRow, vote === 'approve' && { marginBottom: 14 }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleDecision('approve')}
          style={[
            styles.approveBtn,
            vote === 'approve' && styles.approveBtnActive
          ]}
        >
          <Check size={16} color={vote === 'approve' ? '#16301E' : '#A9A08C'} />
          <Text
            style={[
              styles.approveBtnText,
              vote === 'approve' && { color: '#16301E' }
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
        >
          <X size={16} color={vote === 'reject' ? '#41201A' : '#A9A08C'} />
          <Text
            style={[
              styles.rejectBtnText,
              vote === 'reject' && { color: '#41201A' }
            ]}
          >
            Reject / veto
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rank Selection Chips if Approved */}
      {vote === 'approve' && (
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
            >
              <Text
                style={[
                  styles.rankChipText,
                  rank === r && { color: '#231A0C', fontWeight: '700' }
                ]}
              >
                Rank as #{r} choice
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

export default function PactSilentBallot() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id || id === 'undefined' || id === '[id]') {
    return <CircleRouteGuard id={id}><View /></CircleRouteGuard>;
  }
  const router = useRouter();
  const { groups = [], castVote, currentUserId = 'user-maya-001' } = useGatherlyStore();
  const haptics = usePactHaptics();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: (id && id !== 'undefined') ? id : 'circle-college-reunion-2026',
      name: 'Goa Beach Escape 2026',
      inviteCode: 'GOA-4F82'
    };

  const [votes, setVotes] = useState<Record<string, 'approve' | 'reject' | null>>({
    goa: 'approve',
    pondy: 'reject'
  });

  const [ranks, setRanks] = useState<Record<string, number>>({
    goa: 1,
    pondy: 2
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = [
    {
      key: 'goa',
      name: 'Goa, India',
      match: 96,
      dates: 'Oct 14 – Oct 19',
      price: '$540 / person'
    },
    {
      key: 'pondy',
      name: 'Puducherry, India',
      match: 82,
      dates: 'Oct 12 – Oct 17',
      price: '$480 / person'
    }
  ];

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const setVote = (key: string, val: 'approve' | 'reject') => {
    triggerHaptic();
    setVotes((v) => ({ ...v, [key]: v[key] === val ? null : val }));
  };

  const setRank = (key: string, r: number) => {
    triggerHaptic();
    setRanks((rk) => ({ ...rk, [key]: r }));
  };

  const handleCastBallot = async () => {
    triggerHaptic();
    setIsSubmitting(true);

    try {
      await castVote('opt-goa-001', votes.goa === 'approve');
      await castVote('opt-pondy-002', votes.pondy === 'approve');
      router.push(`/circle/${currentGroup.id}/brief` as any);
    } catch (e) {
      router.push(`/circle/${currentGroup.id}/brief` as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.outerContainer}>
      <View style={styles.phoneFrame}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              
              <Text style={styles.headerTitle}>Silent ballot</Text>
            </View>

            <View style={styles.sealedBadge}>
              <Svg width="10" height="10" viewBox="0 0 10 10">
                <Rect x="2" y="4.3" width="6" height="4.7" rx="1" fill="none" stroke="#A9A08C" strokeWidth="0.9" />
                <Path d="M3.2 4.3V3a1.8 1.8 0 0 1 3.6 0v1.3" fill="none" stroke="#A9A08C" strokeWidth="0.9" />
              </Svg>
              <Text style={styles.sealedBadgeText}>Votes sealed</Text>
            </View>
          </View>

          {/* Zero Peer Pressure Guarantee Banner */}
          <View style={styles.guaranteeBanner}>
            <Svg width="16" height="16" viewBox="0 0 16 16" style={{ marginTop: 2 }}>
              <Path
                d="M8 1.5l5.5 2v4.2c0 3.4-2.3 6-5.5 6.8-3.2-.8-5.5-3.4-5.5-6.8V3.5z"
                fill="none"
                stroke="#A9A08C"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </Svg>
            <Text style={styles.guaranteeText}>
              <Text style={styles.guaranteeBold}>Zero peer pressure. </Text>
              Individual votes are sealed and revealed simultaneously when all 5 members finish.
            </Text>
          </View>

          {/* Options to Vote On */}
          {options.map((opt) => {
            const vote = votes[opt.key];
            return (
              <View key={opt.key} style={styles.ballotCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.destName}>{opt.name}</Text>
                  <Text style={styles.matchScore}>{opt.match}%</Text>
                </View>

                <Text style={styles.destMeta}>
                  {opt.dates}  •  Est. {opt.price}
                </Text>

                {/* Voting Action Buttons */}
                <View style={[styles.voteButtonsRow, vote === 'approve' && { marginBottom: 14 }]}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setVote(opt.key, 'approve')}
                    style={[
                      styles.approveBtn,
                      vote === 'approve' && styles.approveBtnActive
                    ]}
                  >
                    <Check size={16} color={vote === 'approve' ? '#16301E' : '#A9A08C'} />
                    <Text
                      style={[
                        styles.approveBtnText,
                        vote === 'approve' && { color: '#16301E' }
                      ]}
                    >
                      Approve
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => setVote(opt.key, 'reject')}
                    style={[
                      styles.rejectBtn,
                      vote === 'reject' && styles.rejectBtnActive
                    ]}
                  >
                    <X size={16} color={vote === 'reject' ? '#41201A' : '#A9A08C'} />
                    <Text
                      style={[
                        styles.rejectBtnText,
                        vote === 'reject' && { color: '#41201A' }
                      ]}
                    >
                      Reject / veto
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Rank Selection Chips if Approved */}
                {vote === 'approve' && (
                  <View style={styles.rankChipsRow}>
                    {[1, 2].map((r) => (
                      <TouchableOpacity
                        key={r}
                        activeOpacity={0.8}
                        onPress={() => setRank(opt.key, r)}
                        style={[
                          styles.rankChip,
                          ranks[opt.key] === r && styles.rankChipActive
                        ]}
                      >
                        <Text
                          style={[
                            styles.rankChipText,
                            ranks[opt.key] === r && { color: '#231A0C', fontWeight: '700' }
                          ]}
                        >
                          Rank as #{r} choice
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom CTA Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleCastBallot}
            disabled={isSubmitting}
            style={styles.lockBallotBtn}
          >
            <Svg width="14" height="14" viewBox="0 0 14 14">
              <Rect x="3" y="6.2" width="8" height="6" rx="1.3" fill="none" stroke="#231A0C" strokeWidth="1.3" />
              <Path d="M4.5 6.2V4.6a2.1 2.1 0 0 1 4.2 0v1.6" fill="none" stroke="#231A0C" strokeWidth="1.3" />
            </Svg>
            <Text style={styles.lockBallotBtnText}>
              {isSubmitting ? 'Sealing Ballot...' : 'Lock & cast sealed ballot'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.bottomSubtext}>
            You can change your vote anytime before the final member submits.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#0C1120',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: '#12182B',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(243, 238, 226, 0.07)',
    borderRadius: Platform.OS === 'web' ? 40 : 0,
    overflow: 'hidden',
    position: 'relative'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontFamily: fontDisplay,
    fontWeight: '700',
    fontSize: 16,
    color: '#F3EEE2'
  },
  sealedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  sealedBadgeText: {
    fontFamily: fontUIBold,
    fontSize: 11,
    fontWeight: '600',
    color: '#A9A08C'
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18
  },
  guaranteeText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#A9A08C',
    lineHeight: 18,
    flex: 1
  },
  guaranteeBold: {
    fontFamily: fontUIBold,
    color: '#F3EEE2',
    fontWeight: '600'
  },
  ballotCard: {
    backgroundColor: '#1A2138',
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.1)',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  destName: {
    fontFamily: fontDisplay,
    fontSize: 21,
    fontWeight: '700',
    color: '#F3EEE2'
  },
  matchScore: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#58A68C'
  },
  destMeta: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#8B8474',
    marginBottom: 16
  },
  voteButtonsRow: {
    flexDirection: 'row',
    gap: 10
  },
  approveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.16)',
    backgroundColor: 'rgba(243, 238, 226, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  approveBtnActive: {
    backgroundColor: '#58A68C',
    borderColor: '#58A68C'
  },
  approveBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#A9A08C'
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.16)',
    backgroundColor: 'rgba(243, 238, 226, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  rejectBtnActive: {
    backgroundColor: '#C1503F',
    borderColor: '#C1503F'
  },
  rejectBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#A9A08C'
  },
  rankChipsRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#161D33',
    borderWidth: 1,
    borderColor: 'rgba(243, 238, 226, 0.1)',
    borderRadius: 12,
    padding: 4
  },
  rankChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rankChipActive: {
    backgroundColor: '#C99A5B'
  },
  rankChipText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#A9A08C'
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#12182B',
    borderTopWidth: 1,
    borderTopColor: 'rgba(243, 238, 226, 0.07)'
  },
  lockBallotBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#C99A5B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10
  },
  lockBallotBtnText: {
    fontFamily: fontUIBold,
    fontSize: 14.5,
    fontWeight: '700',
    color: '#231A0C'
  },
  bottomSubtext: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#6B6455',
    textAlign: 'center',
    lineHeight: 16
  }
});