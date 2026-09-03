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
import * as Haptics from 'expo-haptics';
import { useGatherlyStore } from '../../../src/store/useGatherlyStore';
import { colors, radius } from '../../../src/theme/colors';
import { fontDisplay, fontUI, fontUIBold } from '../../../src/theme/typography';
import { ArrowLeft, Check, X, Shield, Lock } from 'lucide-react-native';

export default function PactSilentBallot() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { groups = [], castVote, currentUserId = 'user-maya-001' } = useGatherlyStore();

  const currentGroup =
    groups.find((g) => g && g.id === id) ||
    groups[0] || {
      id: id || 'circle-college-reunion-2026',
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
      await castVote({
        groupId: currentGroup.id,
        userId: currentUserId,
        votes: {
          'opt-goa-001': votes.goa === 'approve' ? 'yes' : votes.goa === 'reject' ? 'no' : 'neutral',
          'opt-pondy-002': votes.pondy === 'approve' ? 'yes' : votes.pondy === 'reject' ? 'no' : 'neutral'
        }
      });
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
              <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn}>
                <ArrowLeft size={18} color="#8B8D98" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Silent ballot</Text>
            </View>

            <View style={styles.sealedBadge}>
              <Svg width="10" height="10" viewBox="0 0 10 10">
                <Rect x="2" y="4.3" width="6" height="4.7" rx="1" fill="none" stroke="#8B8D98" strokeWidth="0.9" />
                <Path d="M3.2 4.3V3a1.8 1.8 0 0 1 3.6 0v1.3" fill="none" stroke="#8B8D98" strokeWidth="0.9" />
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
                stroke="#8B8D98"
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
                    <Check size={16} color={vote === 'approve' ? '#052E20' : '#8B8D98'} />
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
                    onPress={() => setVote(opt.key, 'reject')}
                    style={[
                      styles.rejectBtn,
                      vote === 'reject' && styles.rejectBtnActive
                    ]}
                  >
                    <X size={16} color={vote === 'reject' ? '#3A0A0A' : '#8B8D98'} />
                    <Text
                      style={[
                        styles.rejectBtnText,
                        vote === 'reject' && { color: '#3A0A0A' }
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
                            ranks[opt.key] === r && { color: '#2E0805', fontWeight: '700' }
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
              <Rect x="3" y="6.2" width="8" height="6" rx="1.3" fill="none" stroke="#2E0805" strokeWidth="1.3" />
              <Path d="M4.5 6.2V4.6a2.1 2.1 0 0 1 4.2 0v1.6" fill="none" stroke="#2E0805" strokeWidth="1.3" />
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
    backgroundColor: '#050608',
    justifyContent: 'center',
    alignItems: 'center'
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 420,
    flex: 1,
    backgroundColor: '#090A0F',
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    borderColor: 'rgba(255,255,255,0.06)',
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
    color: '#F4F3F0'
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
    color: '#8B8D98'
  },
  guaranteeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 18
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
    fontWeight: '600'
  },
  ballotCard: {
    backgroundColor: '#13151E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    color: '#F4F3F0'
  },
  matchScore: {
    fontFamily: fontUIBold,
    fontSize: 14,
    fontWeight: '700',
    color: '#3DE0A0'
  },
  destMeta: {
    fontFamily: fontUI,
    fontSize: 11.5,
    color: '#6C6F7A',
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
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  approveBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  approveBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#8B8D98'
  },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  rejectBtnActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444'
  },
  rejectBtnText: {
    fontFamily: fontUIBold,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#8B8D98'
  },
  rankChipsRow: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#0F1017',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: '#FF5A5F'
  },
  rankChipText: {
    fontFamily: fontUI,
    fontSize: 12,
    color: '#8B8D98'
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: '#090A0F',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)'
  },
  lockBallotBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF5A5F',
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
    color: '#2E0805'
  },
  bottomSubtext: {
    fontFamily: fontUI,
    fontSize: 11,
    color: '#454857',
    textAlign: 'center',
    lineHeight: 16
  }
});